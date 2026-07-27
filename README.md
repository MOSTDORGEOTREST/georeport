# GEOREPORT

Сервис аутентификации протоколов лабораторных испытаний и защиты данных от подделки.

## Стек

- Backend: FastAPI, PostgreSQL, SQLAlchemy, Redis, S3/MinIO
- Frontend: SvelteKit
- Инфраструктура: Docker Compose, Nginx, SSL

Проект работает только в одной конфигурации: Svelte-фронтенд из `frontend/`
и FastAPI-бэкенд из `backend/`. Переключателя режима нет.

## Локальный запуск полного стека

```bash
docker compose -f docker-compose-test.yml up --build -d
```

Приложение откроется на `http://localhost`.

Остановка:

```bash
docker compose -f docker-compose-test.yml down
```

## Production

1. Создайте `.env`:

   ```bash
   cp .env.example .env
   ```

2. Задайте реальные PostgreSQL, JWT, S3 и учётные данные администратора.
3. Положите SSL-сертификаты `key.key` и `crt.crt` в `app/`.
4. Запустите:

   ```bash
   docker compose up --build -d
   ```

Обновление уже работающего сервера:

```bash
git pull
docker compose up --build -d --remove-orphans
docker compose ps
```

Простой перезапуск без пересборки:

```bash
docker compose restart
```

## Структура

```text
.
├── backend/                 # FastAPI API
├── frontend/                # SvelteKit
├── server/
│   ├── conf.d/app.conf      # Production Nginx
│   └── test.conf            # Локальный тестовый Nginx
├── docker-compose.yml       # Production
├── docker-compose-test.yml  # Полный локальный стек
└── .env.example
```

## Миграции

```bash
cd backend
poetry run alembic upgrade head
```

## Схема БД

[Схема](https://dbdiagram.io/d/64edcb6a02bd1c4a5e99ec69)
