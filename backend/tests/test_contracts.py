import os
import re
import sys
import unittest
from asyncio import run
from datetime import date
from pathlib import Path
from types import SimpleNamespace


BACKEND_APP = Path(__file__).resolve().parents[1] / "app"
sys.path.insert(0, str(BACKEND_APP))

os.environ.setdefault("HOST_IP", "127.0.0.1")
os.environ.setdefault("PUBLIC_BASE_URL", "https://georeport.ru")
os.environ.setdefault("FILE_COUNT", "10")
os.environ.setdefault("FILE_SIZE", "50")
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://user:password@127.0.0.1:5432/georeport",
)
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("JWT_EXPIRATION", "3600")
os.environ.setdefault("SUPERUSER_NAME", "admin")
os.environ.setdefault("SUPERUSER_PASSWORD", "admin")
os.environ.setdefault("AWS_URI", "http://127.0.0.1:9000")
os.environ.setdefault("AWS_ACCCESS_KEY", "test")
os.environ.setdefault("AWS_SERVICE_NAME", "s3")
os.environ.setdefault("AWS_SECRET_KEY", "test")
os.environ.setdefault("AWS_REGION", "us-east-1")
os.environ.setdefault("AWS_BUCKET", "georeport")
os.environ.setdefault("REDIS_URL", "redis://127.0.0.1:6379")

from api.s3 import file_key_pattern
from api.reports import delete_report
from api.users import sign_in
from app import app
from db.tables import LicenseLevel
from fastapi import Request, Response
from jose import jwt
from models.users import Token
from services.users import UsersService


class BackendContractTests(unittest.TestCase):
    def test_required_api_paths_are_registered(self):
        paths = app.openapi()["paths"]
        required = {
            "/auth/sign-in/",
            "/auth/user/",
            "/auth/sign-out/",
            "/reports/",
            "/reports/qr/",
            "/reports/my-count/",
            "/reports/objects/{object_number}/",
            "/reports/objects/{object_number}/{active}/",
            "/files/",
            "/test_type_files/{report_id}",
            "/s3/",
            "/stat/period_count",
        }
        self.assertFalse(required - set(paths))

    def test_auth_token_does_not_expose_password_hash(self):
        user = SimpleNamespace(
            id=7,
            username="demo",
            mail="demo@example.com",
            is_superuser=False,
            organization="Lab",
            phone=79990000000,
            active=True,
            organization_url="https://example.com",
            license_level=LicenseLevel.ENTERPRISE,
            license_end_date=date(2027, 1, 1),
            license_update_date=date(2026, 1, 1),
            limit=100,
            password_hash="$2b$12$not-exported",
        )

        token = UsersService.create_token(user).access_token
        payload = jwt.decode(
            token,
            os.environ["JWT_SECRET"],
            algorithms=[os.environ["JWT_ALGORITHM"]],
        )

        self.assertNotIn("password_hash", payload["user"])
        self.assertLessEqual(abs((payload["exp"] - payload["iat"]) - 3600), 10)
        self.assertEqual(UsersService.verify_token(token).id, 7)

    def test_password_hashing_backend_is_usable(self):
        password = "correct horse battery staple"
        hashed = UsersService.hash_password(password)

        self.assertTrue(UsersService.verify_password(password, hashed))
        self.assertFalse(UsersService.verify_password("wrong", hashed))

    def test_s3_key_allowlist_supports_both_file_types(self):
        report_key = f"georeport/files/{'a' * 40}-scan.pdf"
        note_key = "georeport/test_type_files/7-FC-guide.pdf"

        self.assertIsNotNone(re.fullmatch(file_key_pattern, report_key))
        self.assertIsNotNone(re.fullmatch(file_key_pattern, note_key))
        self.assertIsNone(
            re.fullmatch(file_key_pattern, "georeport/files/../../secret")
        )

    def test_sign_in_sets_production_cookie_flags(self):
        class AuthService:
            async def authenticate_user(self, username, password):
                self.credentials = (username, password)
                return Token(access_token="signed-token")

        request = Request(
            {
                "type": "http",
                "method": "POST",
                "path": "/auth/sign-in/",
                "headers": [(b"x-forwarded-proto", b"https")],
            }
        )
        response = Response()
        service = AuthService()

        run(
            sign_in(
                request=request,
                response=response,
                auth_data=SimpleNamespace(username="demo", password="secret"),
                auth_service=service,
            )
        )

        cookie = response.headers["set-cookie"]
        self.assertEqual(service.credentials, ("demo", "secret"))
        self.assertIn("HttpOnly", cookie)
        self.assertIn("Secure", cookie)
        self.assertIn("SameSite=lax", cookie)
        self.assertIn("Max-Age=3600", cookie)

    def test_report_delete_removes_db_children_before_parent(self):
        calls = []

        class ReportService:
            async def get(self, report_id):
                calls.append("get")
                return SimpleNamespace(user_id=7)

            async def delete_files(self, report_id):
                calls.append("delete_files")
                return [SimpleNamespace(filename="scan.pdf")]

            async def delete(self, id):
                calls.append("delete_report")

        class StatisticsService:
            async def delete(self, report_id):
                calls.append("delete_statistics")

        class S3Service:
            async def delete(self, key):
                calls.append(("delete_s3", key))

        run(
            delete_report(
                id="a" * 40,
                user=SimpleNamespace(id=7, is_superuser=False),
                uow={
                    "report_service": ReportService(),
                    "statistics_service": StatisticsService(),
                    "s3_service": S3Service(),
                },
            )
        )

        self.assertLess(calls.index("delete_files"), calls.index("delete_report"))
        self.assertEqual(
            calls[-1],
            ("delete_s3", f"georeport/files/{'a' * 40}-scan.pdf"),
        )


if __name__ == "__main__":
    unittest.main()
