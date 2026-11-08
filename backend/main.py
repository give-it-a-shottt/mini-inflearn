# backend/main.py
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

load_dotenv()                                   # ㄹ. .env 파일을 읽어 환경변수로 등록
DATABASE_URL = os.getenv("DATABASE_URL")        # ㄷ. 환경변수에서 값 꺼내기
engine = create_engine(DATABASE_URL, echo=True)  # ㄱ. 그 값으로 DB 연결


class Base(DeclarativeBase):
    pass


class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    instructor: Mapped[str]
    price: Mapped[int]


class CourseOut(BaseModel):
    id: int
    title: str
    instructor: str
    price: int


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # 허용할 프론트 주소. 여러 개면 쉼표로 구분 (예: http://localhost:3000,https://xxx.vercel.app)
    allow_origins=os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/orm/courses", response_model=list[CourseOut])
def get_courses_orm():
    with Session(engine) as session:
        courses = session.scalars(select(Course)).all()
    return courses


@app.get("/orm/courses/{course_id}", response_model=CourseOut)
def get_course_orm(course_id: int):
    with Session(engine) as session:
        course = session.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다")
    return course
