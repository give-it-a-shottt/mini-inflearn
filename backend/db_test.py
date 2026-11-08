# backend/db_test.py — DB 연결 확인용 (읽기 전용)
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"), echo=True)

with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM courses ORDER BY id;"))
    for row in result.mappings():
        print(dict(row))
