# GEOREPORT

> Сервис аутентификации протоколов лабораторных испытаний. Гарантия подлинности данных.

![logo](https://s3.timeweb.com/cw78444-3db3e634-248a-495a-8c38-9f7322725c84/logo.png)

**GEOREPORT** — проект компании «АО МОСТДОРГЕОТРЕСТ» для аутентификации протоколов лабораторных испытаний и защиты от подделки.

---

## Возможности

- **Управление пользователями** — лицензии, лимиты, доступ
- **Протоколы** — хранение и верификация отчётов
- **Личный кабинет** — создание протоколов, QR-коды, статистика просмотров
- **API** — интеграция с внешними системами

---

## Стек

| Слой | Технологии |
|------|------------|
| **Backend** | FastAPI, PostgreSQL, SQLAlchemy, Redis, S3/MinIO |
| **Frontend** | **Svelte** (SvelteKit) или **React** (CRA) |
| **Инфра** | Docker, Nginx, SSL |

---

## Фронтенды

| Вариант | Папка | Описание |
|---------|-------|----------|
| **Svelte** | `frontend-svelte/` | SvelteKit, glassmorphism |
| **React** | `frontend/` | Create React App |

---

## Быстрый старт (тест)

Полный стек: PostgreSQL, Redis, MinIO, backend + frontend.

**Svelte:**
```bash
cp .env.example .env
# Отредактируйте .env при необходимости
docker compose -f docker-compose-test-svelte.yml up --build -d
```

**React:**
```bash
cp .env.example .env
docker compose -f docker-compose-test.yml up --build -d
```

Приложение: `http://localhost`

---

## Деплой (production)

1. **Скопируйте `.env`:**
   ```bash
   cp .env.example .env
   ```
   Заполните переменные (PostgreSQL, JWT, S3/MinIO).

2. **SSL-сертификаты** — положите `key.key` и `crt.crt` в `./app/`.

3. **Запуск:**

   **Svelte:**
   ```bash
   docker compose -f docker-compose-svelte.yml up --build -d
   ```

   **React:**
   ```bash
   docker compose up --build -d
   ```

---

## Структура проекта

```
.
├── backend/              # FastAPI
├── frontend/              # React (CRA)
├── frontend-svelte/       # Svelte (SvelteKit)
├── server/
│   ├── conf.d/           # Nginx для React
│   └── conf.d-svelte/    # Nginx для Svelte
├── docker-compose.yml           # Production (React)
├── docker-compose-svelte.yml    # Production (Svelte)
├── docker-compose-test.yml      # Тест (React)
├── docker-compose-test-svelte.yml  # Тест (Svelte)
└── .env.example
```

---

## Миграции

```bash
cd backend
poetry run alembic upgrade head
```

---

## Схема БД

[Схема](https://dbdiagram.io/d/64edcb6a02bd1c4a5e99ec69)

---

## Очистка Docker

```bash
docker compose -f docker-compose-test-svelte.yml down -v
# или
docker rm $(docker ps -a -q) -f
docker rmi $(docker images -a -q) -f
```
