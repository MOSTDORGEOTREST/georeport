#!/usr/bin/env bash
# GEOREPORT: управление тестовым и production Docker Compose.
set -Eeuo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

COMPOSE=()
COMPOSE_FILE=""
PROJECT=""
MODE=""
MIRROR_REGISTRY="${DOCKER_MIRROR:-}"
MIRROR_APPLIED="no"

say()   { printf '\n\033[1;33m▸ %s\033[0m\n' "$*"; }
ok()    { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
error() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; }

show_menu() {
  cat <<'EOF'

GEOREPORT
  dev        тестовая версия: полная очистка и установка с нуля
  dev_lite   тестовая версия: обновить или создать контейнеры
  prod       production: полная очистка и установка с нуля
  prod_lite  production: обновить или создать контейнеры
  clear      полностью очистить оба Compose-проекта
  update     обновить код из Git
  info       показать состояние и последние логи
  exit       закрыть
EOF
}

ensure_compose() {
  if [ "${#COMPOSE[@]}" -gt 0 ]; then
    return 0
  fi

  if docker compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
  else
    error "Не найден ни 'docker compose', ни 'docker-compose'."
    return 1
  fi
}

compose() {
  "${COMPOSE[@]}" -f "$COMPOSE_FILE" -p "$PROJECT" "$@"
}

select_dev() {
  MODE="dev"
  COMPOSE_FILE="docker-compose-test.yml"
  PROJECT="georeport-test"
}

select_prod() {
  MODE="prod"
  COMPOSE_FILE="docker-compose.yml"
  PROJECT="georeport"

  if [ ! -f .env ]; then
    error "Нет .env. Скопируйте .env.example в .env и заполните production-значения."
    return 1
  fi

  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
  if [ -n "$MIRROR_REGISTRY" ]; then
    MIRROR_APPLIED="no"
  fi

  local variable
  for variable in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_HOST POSTGRES_PORT POSTGRES_NAME \
    JWT_SECRET AWS_URI AWS_ACCCESS_KEY AWS_SECRET_KEY AWS_BUCKET; do
    if [ -z "${!variable:-}" ]; then
      error "В .env не задана переменная: $variable"
      return 1
    fi
  done

  case "$POSTGRES_HOST" in
    postgres|localhost|127.0.0.1)
      echo "⚠ POSTGRES_HOST='$POSTGRES_HOST' похож на локальную БД. Проверьте .env."
      ;;
  esac
}

mirror_image() {
  local registry="${1#http://}"
  registry="${registry#https://}"
  registry="${registry%/}"
  local image="${2#docker.io/}"
  local first_component="${image%%/*}"

  if [[ "$image" == "$registry/"* ]]; then
    printf '%s' "$image"
    return
  fi

  # Образы из Quay, GHCR и приватных registry не являются Docker Hub-образами.
  if [[ "$image" == */* && ( "$first_component" == *.* || "$first_component" == *:* || "$first_component" == "localhost" ) ]]; then
    printf '%s' "$image"
    return
  fi

  if [[ "$image" != */* ]]; then
    image="library/$image"
  fi
  printf '%s/%s' "$registry" "$image"
}

apply_mirror() {
  local registry="$1"
  if [ -z "$registry" ]; then
    error "Адрес зеркала пуст."
    return 1
  fi

  export PYTHON_IMAGE NODE_IMAGE NGINX_IMAGE CERTBOT_IMAGE POSTGRES_IMAGE
  export REDIS_IMAGE MINIO_IMAGE MINIO_MC_IMAGE

  PYTHON_IMAGE="$(mirror_image "$registry" "${PYTHON_IMAGE:-python:3.10-slim-bookworm}")"
  NODE_IMAGE="$(mirror_image "$registry" "${NODE_IMAGE:-node:22-alpine}")"
  NGINX_IMAGE="$(mirror_image "$registry" "${NGINX_IMAGE:-nginx:1.27-alpine}")"
  CERTBOT_IMAGE="$(mirror_image "$registry" "${CERTBOT_IMAGE:-certbot/certbot:latest}")"
  POSTGRES_IMAGE="$(mirror_image "$registry" "${POSTGRES_IMAGE:-postgres:15-alpine}")"
  REDIS_IMAGE="$(mirror_image "$registry" "${REDIS_IMAGE:-redis:7-alpine}")"
  MINIO_IMAGE="$(mirror_image "$registry" "${MINIO_IMAGE:-minio/minio:latest}")"
  MINIO_MC_IMAGE="$(mirror_image "$registry" "${MINIO_MC_IMAGE:-minio/mc:latest}")"
  MIRROR_REGISTRY="$registry"
  MIRROR_APPLIED="yes"
  ok "Для текущего запуска используется зеркало: ${registry#https://}"
}

is_registry_error() {
  grep -Eiq \
    'toomanyrequests|too many requests|TLS handshake timeout|i/o timeout|connection reset|connection refused|context deadline exceeded|dial tcp|no such host|temporary failure|failed to fetch anonymous token|unexpected EOF|unexpected status.*(429|500|502|503|504)|net/http.*timeout' \
    "$1"
}

run_with_registry_fallback() {
  local title="$1"
  shift
  local log_file
  local exit_code
  log_file="$(mktemp)"

  say "$title"
  set +e
  "$@" 2>&1 | tee "$log_file"
  exit_code="${PIPESTATUS[0]}"
  set -e

  if [ "$exit_code" -eq 0 ]; then
    rm -f "$log_file"
    return 0
  fi

  if grep -Eiq 'cannot connect to the docker daemon|failed to connect to the docker API|dockerDesktopLinuxEngine' "$log_file"; then
    echo
    error "Docker daemon недоступен. Запустите Docker Engine или Docker Desktop."
    echo "Registry-зеркало эту ошибку не исправит."
    rm -f "$log_file"
    return "$exit_code"
  fi

  if [ "$MIRROR_APPLIED" = "no" ] && is_registry_error "$log_file"; then
    echo
    echo "⚠ Docker Hub недоступен или ограничил запросы."
    echo "  Можно повторить через зеркало mirror.gcr.io."
    echo "  Другое зеркало задаётся переменной DOCKER_MIRROR."

    if [ -t 0 ]; then
      printf "Повторить сейчас через mirror.gcr.io? [y/N] "
      read -r answer
      if [[ "$answer" =~ ^[YyДд]$ ]]; then
        apply_mirror "mirror.gcr.io"
        rm -f "$log_file"
        say "Повтор: $title"
        "$@"
        return
      fi
    fi
  fi

  rm -f "$log_file"
  return "$exit_code"
}

prepare_mode() {
  local requested_mode="$1"
  ensure_compose || return 1

  if [ "$requested_mode" = "dev" ]; then
    select_dev
  else
    select_prod || return 1
  fi

  if [ -n "$MIRROR_REGISTRY" ] && [ "$MIRROR_APPLIED" = "no" ]; then
    apply_mirror "$MIRROR_REGISTRY" || return 1
  fi
}

start_stack() {
  run_with_registry_fallback \
    "Загружаю готовые сервисные образы" \
    compose pull --ignore-buildable || return 1

  run_with_registry_fallback \
    "Запускаю сервисы" \
    compose up -d --remove-orphans || return 1

  say "Состояние контейнеров"
  compose ps

  if [ "$MODE" = "dev" ]; then
    ok "Тестовый стек запущен: http://localhost"
    echo "  MinIO: http://localhost:9001 (minioadmin/minioadmin)"
    echo "  PostgreSQL: localhost:5432 (georeport/georeport)"
  else
    ok "Production запущен. Внешние PostgreSQL и S3 не изменялись."
  fi
}

clean_selected_project() {
  if [ "$MODE" = "dev" ]; then
    compose down --volumes --remove-orphans --rmi local
    return
  fi

  compose down --remove-orphans --rmi local || return 1

  # Сертификаты Certbot должны переживать полную пересборку production.
  # Redis содержит только кэш, поэтому его том можно безопасно пересоздать.
  if docker volume inspect "${PROJECT}_redis_data" >/dev/null 2>&1; then
    docker volume rm "${PROJECT}_redis_data"
  fi
}

full_deploy() {
  local requested_mode="$1"
  prepare_mode "$requested_mode" || return 1

  say "Полностью очищаю Compose-проект '$PROJECT'"
  clean_selected_project || return 1

  run_with_registry_fallback \
    "Собираю backend и frontend с нуля" \
    compose build --no-cache --pull || return 1

  start_stack
}

lite_deploy() {
  local requested_mode="$1"
  prepare_mode "$requested_mode" || return 1

  run_with_registry_fallback \
    "Обновляю backend и frontend с использованием build-кэша" \
    compose build --pull || return 1

  start_stack
}

clear_project() {
  local requested_mode="$1"

  if ! prepare_mode "$requested_mode"; then
    if [ "$requested_mode" = "prod" ] && [ ! -f .env ]; then
      echo "⚠ Production пропущен: отсутствует .env."
      return 0
    fi
    return 1
  fi

  say "Очищаю Compose-проект '$PROJECT'"
  clean_selected_project
}

clear_all() {
  ensure_compose || return 1
  clear_project dev || return 1
  clear_project prod || return 1
  ok "Контейнеры, сети, локальные образы и рабочие тома GEOREPORT удалены."
  echo "  Production-сертификаты Certbot сохранены."
}

update_code() {
  if [ ! -d .git ]; then
    error "Каталог проекта не является Git-репозиторием."
    return 1
  fi

  say "Обновляю код"
  git pull --ff-only
}

show_project_info() {
  local requested_mode="$1"

  if ! prepare_mode "$requested_mode"; then
    if [ "$requested_mode" = "prod" ] && [ ! -f .env ]; then
      echo "⚠ Production пропущен: отсутствует .env."
      return 0
    fi
    return 1
  fi

  say "$PROJECT: состояние"
  compose ps --all
  say "$PROJECT: последние 200 строк логов"
  compose logs --tail=200
}

show_info() {
  ensure_compose || return 1
  show_project_info dev || return 1
  show_project_info prod
}

run_command() {
  case "$1" in
    dev) full_deploy dev ;;
    dev_lite) lite_deploy dev ;;
    prod) full_deploy prod ;;
    prod_lite) lite_deploy prod ;;
    clear) clear_all ;;
    update) update_code ;;
    info) show_info ;;
    exit) return 0 ;;
    *)
      error "Неизвестная команда: $1"
      show_menu
      return 1
      ;;
  esac
}

if [ "$#" -gt 1 ]; then
  error "Укажите только одну команду."
  show_menu
  exit 2
fi

if [ "$#" -eq 1 ]; then
  run_command "$1"
  exit $?
fi

while true; do
  show_menu
  printf '\nКоманда: '
  if ! read -r command; then
    echo
    exit 0
  fi
  command="${command//$'\r'/}"

  if [ "$command" = "exit" ]; then
    exit 0
  fi

  if ! run_command "$command"; then
    echo
    echo "Команда завершилась с ошибкой."
  fi
done
