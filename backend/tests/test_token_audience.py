import unittest
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException
from app.auth.security import create_access_token, decode_access_token
from app.database import settings


class TokenAudienceTests(unittest.TestCase):
    def test_new_tokens_work(self):
        self.assertEqual(decode_access_token(create_access_token(42)), 42)

    def test_old_database_tokens_are_rejected(self):
        token = jwt.encode({"sub": "42", "exp": datetime.now(timezone.utc) + timedelta(hours=1)}, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
        with self.assertRaises(HTTPException):
            decode_access_token(token)
