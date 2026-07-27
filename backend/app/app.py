import datetime
import os
import random

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from passlib.hash import bcrypt
from redis import asyncio as aioredis
from sqlalchemy.future import select
from starlette_exporter import PrometheusMiddleware, handle_metrics

from api import router
from config import configs
from db import tables
from db.database import Base, async_session, engine
from db.tables import LicenseLevel


def create_ip_ports_array(ip: str, *ports):
    return [f"{ip}:{port}" for port in ports]


app = FastAPI(
    title="Georeport MDGT",
    description="Сервис аутентификации протоколов испытаний",
    version="2.0.1",
)

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8555",
    "https://georeport.ru",
    "http://georeport.ru",
]
origins += create_ip_ports_array(configs.host_ip, 3000, 8000, 80)
origins += create_ip_ports_array("http://192.168.0.76", 3000, 8000, 80, 8555)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(PrometheusMiddleware)
app.add_route("/metrics", handle_metrics)
app.include_router(router)

script_dir = os.path.dirname(__file__)
app.mount(
    "/static",
    StaticFiles(directory=os.path.join(script_dir, "static/")),
    name="static",
)


@app.get("/")
async def index():
    return {"message": "successful"}


@app.on_event("startup")
async def startup_event():
    redis = aioredis.from_url(
        os.environ.get("REDIS_URL", "redis://localhost:6379"),
        encoding="utf8",
        decode_responses=True,
    )
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def create_superuser():
        async with async_session() as session:
            async with session.begin():
                user_names = await session.execute(
                    select(tables.Users).filter_by(username=configs.superuser_name)
                )
                existing_user = user_names.scalars().first()

                if existing_user:
                    return

                try:
                    user = tables.Users(
                        username=configs.superuser_name,
                        password_hash=bcrypt.hash(configs.superuser_password),
                        mail="tnick1502@mail.ru",
                        organization="МОСТДОРГЕОТРЕСТ",
                        organization_url="https://mdgt.ru/",
                        phone=74956566910,
                        is_superuser=True,
                        active=True,
                        license_level=LicenseLevel.ENTERPRISE,
                        license_end_date=datetime.date(2030, 12, 31),
                        license_update_date=datetime.date.today(),
                        limit=1000000000,
                    )
                    session.add(user)
                    await session.flush()

                    if not configs.seed_demo_data:
                        await session.commit()
                        print("Создан суперпользователь")
                        return

                    user_trial = tables.Users(
                        username="trial",
                        password_hash=bcrypt.hash("trial"),
                        mail="nick.mdgt@mail.ru",
                        organization="МОСТДОРГЕОТРЕСТ",
                        organization_url="https://mdgt.ru/",
                        phone=70000000000,
                        is_superuser=False,
                        active=True,
                        license_level=LicenseLevel.STANDART,
                        license_end_date=datetime.date(2030, 12, 31),
                        license_update_date=datetime.date.today(),
                        limit=100,
                    )
                    session.add(user_trial)
                    await session.flush()

                    report = tables.Reports(
                        id="95465771a6f399bf52cd57db2cf640f8624fd868",
                        user_id=user.id,
                        datetime=datetime.datetime.now(),
                        laboratory_number="1",
                        test_type="Трехосное нагружение",
                        object_number="1",
                        data={
                            "Лабораторный номер": "Э1-1/-/ТС",
                            "Объект": "-",
                            "Даты выдачи протокола": "2022-04-26",
                            "Модуль деформации E, МПа:": 8.3,
                            "Модуль деформации E50, МПа": 7.7,
                            "Коэффициент поперечной деформации ν, д.е.": 0.41,
                            "Модуль повторного нагружения Eur, МПа:": 33.6,
                        },
                        active=True,
                    )
                    session.add(report)

                    for i in range(50):
                        report = tables.Reports(
                            id=f"9546577{i}6f399bf52cd57db2cf640f8624fd868",
                            user_id=user_trial.id,
                            datetime=datetime.date.today(),
                            object_number=random.choice(
                                ["112-54", "341-15", "294-41"]
                            ),
                            laboratory_number=f"1{i}",
                            test_type="Трехосное нагружение",
                            data={
                                "Модуль деформации E50, МПа": round(
                                    random.uniform(15, 50), 2
                                ),
                                "Эффективный угол внутреннего трения, град": round(
                                    random.uniform(25, 35), 2
                                ),
                                "Эффективное сцепление c, МПа": round(
                                    random.uniform(0.001, 0.05), 3
                                ),
                            },
                            active=True,
                        )
                        session.add(report)

                    await session.commit()
                    print("Создан суперпользователь")
                except Exception as err:
                    print("Ошибка создания суперпользователя ", str(err))

    await create_superuser()
