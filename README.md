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

Приложение откроется на `http://localhost`. Тестовый контур запускает те же
сборки backend, frontend и Nginx, что и production, но добавляет локальные
PostgreSQL, Redis и MinIO и заполняет БД демонстрационными данными.

- логин администратора: `admin` / `admin`;
- MinIO: `http://localhost:9001` (`minioadmin` / `minioadmin`);
- PostgreSQL: `localhost:5432` (`georeport` / `georeport`).

Остановка:

```bash
docker compose -f docker-compose-test.yml down
```

Полная чистая пересборка тестового контура:

```bash
./hard_start.sh dev
```

Обновление тестового контура без удаления БД и файлов MinIO:

```bash
./hard_start.sh dev_lite
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
./hard_start.sh update
./hard_start.sh prod_lite
```

Простой перезапуск без пересборки:

```bash
docker compose restart
```

Полная пересборка с проверкой обязательных переменных:

```bash
./hard_start.sh prod
```

## Команды управления

Без параметров скрипт открывает интерактивное меню:

```bash
./hard_start.sh
```

Команду также можно передать сразу:

- `dev` — полностью удалить тестовые контейнеры, локальные образы и тома,
  затем собрать и установить всё с нуля;
- `dev_lite` — пересобрать изменённые файлы и создать или обновить тестовые
  контейнеры без удаления PostgreSQL, Redis и MinIO;
- `prod` — полностью пересоздать production-контейнеры, локальные образы и
  Redis-том, затем собрать всё с нуля;
- `prod_lite` — обновить production-контейнеры без удаления локального тома;
- `clear` — удалить контейнеры, сети, локальные образы и тома обоих контуров;
- `update` — выполнить безопасный `git pull --ff-only`;
- `info` — показать состояние и последние 200 строк логов обоих контуров;
- `exit` — закрыть интерактивное меню.

Production-команды не удаляют данные внешних PostgreSQL и S3. Скрипт также не
очищает общесистемный Docker build cache и не затрагивает контейнеры других
проектов.

## Если Docker Hub недоступен

Имена всех базовых и сервисных образов настраиваются через `.env`. Скрипт
`hard_start.sh` распознаёт типичные timeout/rate-limit ошибки Docker registry,
и предлагает повторить загрузку через `mirror.gcr.io`.

Другое доверенное зеркало можно задать переменной окружения:

```bash
DOCKER_MIRROR=dockerhub.timeweb.cloud ./hard_start.sh dev
```

Зеркало применяется только к текущему запуску. Для постоянной настройки задайте
полные `*_IMAGE` адреса в `.env`. Доступность и актуальность стороннего зеркала
нужно проверять у его владельца.

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
├── hard_start.sh             # Чистый запуск и fallback registry
└── .env.example
```

## Миграции

```bash
cd backend
poetry run alembic upgrade head
```

## Схема БД

[Схема](https://dbdiagram.io/d/64edcb6a02bd1c4a5e99ec69)
