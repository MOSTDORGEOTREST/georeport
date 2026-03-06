#!/bin/bash
set -e

REPO_URL="https://github.com/MOSTDORGEOTREST/georeport.git"
PROJECT_DIR="georeport"

if [ -d "$PROJECT_DIR" ]; then
  echo "Папка $PROJECT_DIR уже существует, обновляем..."
  cd "$PROJECT_DIR"
  git pull
else
  echo "Клонируем репозиторий..."
  git clone "$REPO_URL"
  cd "$PROJECT_DIR"
fi

docker compose -f docker-compose-test.yml down
docker compose -f docker-compose-test.yml up --build -d

SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo "=== Готово ==="
echo "Приложение:     http://${SERVER_IP}:3000"
echo "MinIO консоль:  http://${SERVER_IP}:9001  (minioadmin / minioadmin)"
echo ""
echo "Логин: admin / admin"
echo ""
echo "Логи:  docker compose -f docker-compose-test.yml logs -f"
echo "Стоп:  docker compose -f docker-compose-test.yml down"
