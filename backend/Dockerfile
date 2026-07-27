FROM python:3.10-slim

WORKDIR /code/app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8555

RUN apt-get update && apt-get install -y --no-install-recommends curl libzbar0 \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/etc/poetry python3 - \
    && ln -s /etc/poetry/bin/poetry /usr/local/bin/poetry

COPY poetry.lock /code/poetry.lock
COPY pyproject.toml /code/pyproject.toml

RUN poetry config virtualenvs.create false && \
    poetry install --only main --no-root --no-interaction --no-ansi

COPY app /code/app

RUN useradd --create-home appuser && chown -R appuser:appuser /code

USER appuser
