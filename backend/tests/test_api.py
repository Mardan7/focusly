import os
import tempfile
import unittest

# Use an isolated database, never the developer's configured database.
test_directory = tempfile.TemporaryDirectory()
os.environ["DATABASE_URL"] = "sqlite:///" + test_directory.name.replace("\\", "/") + "/test.db"

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine


class ApiTests(unittest.TestCase):
    def setUp(self):
        Base.metadata.drop_all(engine)
        Base.metadata.create_all(engine)
        self.client = TestClient(app)
        self.headers = self.register("first@example.com")

    def tearDown(self):
        self.client.close()

    @classmethod
    def tearDownClass(cls):
        engine.dispose()
        test_directory.cleanup()

    def register(self, email):
        response = self.client.post("/auth/register", json={"name": "Test User", "email": email, "password": "test-password"})
        self.assertEqual(response.status_code, 201, response.text)
        return {"Authorization": "Bearer " + response.json()["access_token"]}

    def test_generated_id_and_duplicate_id(self):
        response = self.client.post("/tasks", headers=self.headers, json={"title": "New task"})
        self.assertEqual(response.status_code, 201, response.text)
        task_id = response.json()["id"]
        self.assertTrue(task_id)
        duplicate = self.client.post("/tasks", headers=self.headers, json={"id": task_id, "title": "Duplicate"})
        self.assertEqual(duplicate.status_code, 409)

    def test_task_validation_and_partial_update(self):
        task = self.client.post("/tasks", headers=self.headers, json={"title": "Original"}).json()
        path = "/tasks/" + task["id"]
        for field in ("title", "description", "priority", "category", "completed", "estimated_pomodoros", "completed_pomodoros"):
            with self.subTest(field=field):
                self.assertEqual(self.client.put(path, headers=self.headers, json={field: None}).status_code, 422)
        for patch in ({"priority": "invalid"}, {"category": "invalid"}, {"title": "   "}):
            self.assertEqual(self.client.put(path, headers=self.headers, json=patch).status_code, 422)
            self.assertEqual(self.client.post("/tasks", headers=self.headers, json={"title": "Task", **patch}).status_code, 422)
        response = self.client.put(path, headers=self.headers, json={"completed": True, "due_date": None})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "Original")
        self.assertTrue(response.json()["completed"])

    def test_login_ownership_sessions_and_stats(self):
        login = self.client.post("/auth/login", json={"email": "first@example.com", "password": "test-password"})
        self.assertEqual(login.status_code, 200)
        self.assertEqual(self.client.get("/auth/me", headers=self.headers).status_code, 200)
        task = self.client.post("/tasks", headers=self.headers, json={"title": "Focus"}).json()
        other = self.register("second@example.com")
        self.assertEqual(self.client.get("/tasks", headers=other).json(), [])
        self.assertEqual(self.client.get("/stats", headers=other).json()["sessions"], 0)
        path = "/tasks/" + task["id"]
        self.assertEqual(self.client.get(path, headers=other).status_code, 404)
        self.assertEqual(self.client.put(path, headers=other, json={"title": "Changed"}).status_code, 404)
        self.assertEqual(self.client.delete(path, headers=other).status_code, 404)
        session = {"task_id": task["id"], "session_type": "focus", "duration": 1500}
        self.assertEqual(self.client.post("/sessions", headers=other, json=session).status_code, 404)
        self.assertEqual(self.client.post("/sessions", headers=self.headers, json=session).status_code, 201)
        self.assertEqual(self.client.get("/stats", headers=self.headers).json()["total_focus_seconds"], 1500)
        self.assertEqual(self.client.delete(path, headers=self.headers).status_code, 204)
        self.assertEqual(self.client.get("/stats", headers=self.headers).json()["sessions"], 1)
        self.assertIsNone(self.client.get("/sessions", headers=self.headers).json()[0]["task_id"])

    def test_names_and_duplicate_registration(self):
        for name in ("  ", " a ", None, 123):
            self.assertEqual(self.client.patch("/auth/me", headers=self.headers, json={"name": name}).status_code, 422)
            self.assertEqual(self.client.post("/auth/register", json={"name": name, "email": "new@example.com", "password": "test-password"}).status_code, 422)
        self.assertEqual(self.client.post("/auth/register", json={"name": "Duplicate", "email": "first@example.com", "password": "test-password"}).status_code, 409)

    def test_settings_partial_update_and_isolation(self):
        response = self.client.put("/settings", headers=self.headers, json={"language": "ru", "theme": "light"})
        self.assertEqual(response.status_code, 200)
        response = self.client.put("/settings", headers=self.headers, json={"sound_enabled": False})
        self.assertEqual(response.json()["language"], "ru")
        self.assertEqual(response.json()["theme"], "light")
        other = self.register("other@example.com")
        self.assertEqual(self.client.get("/settings", headers=other).json()["language"], "en")
        self.assertEqual(self.client.put("/settings", headers=self.headers, json={"theme": "invalid"}).status_code, 422)

    def test_session_dates_are_utc_and_incomplete_sessions_excluded(self):
        response = self.client.post("/sessions", headers=self.headers, json={"session_type": "focus", "duration": 60, "completed_at": "2026-01-02T02:00:00+05:00"})
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual(response.json()["completed_at"], "2026-01-01T21:00:00Z")
        self.client.post("/sessions", headers=self.headers, json={"session_type": "focus", "duration": 60, "completed": False})
        stats = self.client.get("/stats", headers=self.headers).json()
        self.assertEqual(stats["sessions"], 1)
        self.assertEqual(stats["daily_focus"], [{"date": "2026-01-01", "seconds": 60}])
        self.assertTrue(self.client.get("/auth/me", headers=self.headers).json()["created_at"].endswith("Z"))

    def test_password_change_and_auth_required(self):
        for path in ("/tasks", "/sessions", "/stats", "/settings", "/auth/me"):
            self.assertEqual(self.client.get(path).status_code, 401)
            self.assertEqual(self.client.get(path, headers={"Authorization": "Bearer invalid"}).status_code, 401)
        self.assertEqual(self.client.post("/auth/change-password", headers=self.headers, json={"current_password": "wrong", "new_password": "new-test-password"}).status_code, 400)
        self.assertEqual(self.client.post("/auth/change-password", headers=self.headers, json={"current_password": "test-password", "new_password": "new-test-password"}).status_code, 204)
        self.assertEqual(self.client.post("/auth/login", json={"email": "first@example.com", "password": "test-password"}).status_code, 401)
        self.assertEqual(self.client.post("/auth/login", json={"email": "first@example.com", "password": "new-test-password"}).status_code, 200)

    def test_production_requires_configured_secret(self):
        from app.database import Settings
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            Settings(_env_file=None, database_url="postgresql+psycopg://localhost/test", jwt_secret_key="replace-with-a-long-random-secret")


if __name__ == "__main__":
    unittest.main()
