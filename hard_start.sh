#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════
# GEOREPORT · «жёсткий» перезапуск: полная очистка docker-артефактов
# ПРОЕКТА и пересборка всего с нуля (--no-cache, свежие базовые образы).
#
#   ./hard_start.sh          — PROD  (docker-compose.yml + .env,
#                                     внешние PostgreSQL и S3 из .env —
#                                     НЕ ТРОГАЮТСЯ ВООБЩЕ)
#   ./hard_start.sh dev      — DEV   (docker-compose-test.yml: локальные
#                                     тестовые postgres/minio/redis в докере,
#                                     тестовая БД пересоздаётся с нуля,
#                                     демо-данные сеются автоматически)
#
# Безопасность:
#   • чистится ТОЛЬКО этот проект (compose-проекты georeport / georeport-test),
#     чужие контейнеры/образы/тома на хосте не затрагиваются;
#   • в PROD тома НЕ удаляются (redis-кэш можно снести флагом --purge-cache);
#     прод-данные живут во внешних PostgreSQL и S3 — docker до них не дотянется;
#   • в DEV тома удаляются всегда — тестовая БД каждый раз чистая.
# ════════════════════════════════════════════════════════════════════
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MODE="${1:-prod}"
PURGE_CACHE="no"
[ "${2:-}" = "--purge-cache" ] && PURGE_CACHE="yes"

# docker compose v2 или классический docker-compose
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo "✗ Не найден ни 'docker compose', ни 'docker-compose'." >&2
  exit 1
fi

say()  { printf '\n\033[1;33m▸ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# ── свежий код ──────────────────────────────────────────────────────
if [ -d .git ]; then
  say "git pull"
  git pull --ff-only || echo "⚠ git pull не удался (offline?) — собираю текущий код"
fi

case "$MODE" in
# ════════════════════════ PROD ═════════════════════════════════════
prod)
  COMPOSE_FILE="docker-compose.yml"
  PROJECT="georeport"

  [ -f .env ] || fail "Нет .env — прод не запускаю. Создайте: cp .env.example .env"

  # проверяем, что критичные переменные внешних баз заданы
  say "Проверка .env (внешние PostgreSQL и S3)"
  set -a; . ./.env; set +a
  for v in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_HOST POSTGRES_PORT POSTGRES_NAME \
           JWT_SECRET AWS_URI AWS_ACCCESS_KEY AWS_SECRET_KEY AWS_BUCKET; do
    [ -n "${!v:-}" ] || fail "В .env пустая переменная: $v"
  done
  case "$POSTGRES_HOST" in
    postgres|localhost|127.0.0.1)
      echo "⚠ POSTGRES_HOST='$POSTGRES_HOST' — похоже на локальную/тестовую БД."
      echo "  В prod ожидается адрес ВНЕШНЕГО PostgreSQL. Продолжаю, но проверьте .env." ;;
  esac
  ok "Переменные на месте. Внешние базы скрипт не трогает: он управляет только контейнерами."

  say "Останавливаю и удаляю контейнеры/образы проекта '$PROJECT' (тома сохраняются)"
  $DC -f "$COMPOSE_FILE" -p "$PROJECT" down --remove-orphans --rmi all || true
  # легаси: контейнеры, запущенные раньше без "-p" (проект = имя папки)
  LEGACY="$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')"
  if [ -n "$LEGACY" ] && [ "$LEGACY" != "$PROJECT" ]; then
    $DC -f "$COMPOSE_FILE" -p "$LEGACY" down --remove-orphans --rmi all >/dev/null 2>&1 || true
    $DC -f docker-compose-test.yml -p "$LEGACY" down --remove-orphans --rmi all >/dev/null 2>&1 || true
  fi
  if [ "$PURGE_CACHE" = "yes" ]; then
    say "--purge-cache: удаляю и локальные тома проекта (redis-кэш; данных БД тут нет)"
    $DC -f "$COMPOSE_FILE" -p "$PROJECT" down --volumes --remove-orphans || true
  fi
  ;;

# ════════════════════════ DEV ══════════════════════════════════════
dev|test)
  COMPOSE_FILE="docker-compose-test.yml"
  PROJECT="georeport-test"

  say "DEV: полная очистка проекта '$PROJECT' ВМЕСТЕ с томами — тестовая БД будет создана заново"
  $DC -f "$COMPOSE_FILE" -p "$PROJECT" down --volumes --remove-orphans --rmi all || true
  # легаси: тестовый стек, запускавшийся раньше без "-p" (проект = имя папки)
  LEGACY="$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')"
  if [ -n "$LEGACY" ] && [ "$LEGACY" != "$PROJECT" ]; then
    $DC -f "$COMPOSE_FILE" -p "$LEGACY" down --volumes --remove-orphans --rmi all >/dev/null 2>&1 || true
  fi
  ;;

*)
  fail "Неизвестный режим '$MODE'. Использование: ./hard_start.sh [prod|dev] [--purge-cache]"
  ;;
esac

# ── общая часть: пересборка с нуля ──────────────────────────────────
say "Чищу висячие образы и build-кэш"
docker image prune -f >/dev/null || true
docker builder prune -af >/dev/null || true

say "Собираю всё заново (--no-cache, свежие базовые образы)"
$DC -f "$COMPOSE_FILE" -p "$PROJECT" build --no-cache --pull

say "Запускаю"
$DC -f "$COMPOSE_FILE" -p "$PROJECT" up -d

say "Статус"
$DC -f "$COMPOSE_FILE" -p "$PROJECT" ps

if [ "$MODE" = "prod" ]; then
  ok "PROD запущен. Внешние PostgreSQL/S3 из .env не затронуты."
else
  ok "DEV запущен на http://localhost — тестовая БД чистая, демо-данные засеяны (SEED_DEMO_DATA=true)."
  echo "  MinIO-консоль: http://localhost:9001 (minioadmin/minioadmin), Postgres: localhost:5432 (georeport/georeport)"
fi
