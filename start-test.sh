#!/bin/bash
set -e

REPO_URL="https://github.com/MOSTDORGEOTREST/georeport.git"
PROJECT_DIR="georeport"

# Клонируем репозиторий (или обновляем если уже есть)
if [ -d "$PROJECT_DIR" ]; then
  echo "Папка $PROJECT_DIR уже существует, обновляем..."
  cd "$PROJECT_DIR"
  git pull
else
  echo "Клонируем репозиторий..."
  git clone "$REPO_URL"
  cd "$PROJECT_DIR"
fi

# Останавливаем предыдущие контейнеры если есть
docker compose -f docker-compose-test.yml down

# Собираем и запускаем
docker compose -f docker-compose-test.yml up --build -d

echo ""
echo "=== Готово ==="
echo "Фронтенд:       http://localhost:3000"
echo "Бэкенд API:     http://localhost:8555"
echo "MinIO консоль:  http://localhost:9001  (minioadmin / minioadmin)"
echo ""
echo "Логин в приложение: admin / admin"
echo ""
echo "Логи:  docker compose -f docker-compose-test.yml logs -f"
echo "Стоп:  docker compose -f docker-compose-test.yml down"
