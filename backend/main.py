# backend/main.py
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from sqlalchemy import ForeignKey, create_engine, select
from sqlalchemy.exc import IntegrityError
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


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    points: Mapped[int]


class Enrollment(Base):
    __tablename__ = "enrollments"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    created_at: Mapped[datetime] = mapped_column(server_default="now()")


class CourseOut(BaseModel):
    id: int
    title: str
    instructor: str
    price: int


class MeOut(BaseModel):
    id: int
    name: str
    points: int
    enrolled_course_ids: list[int]


class EnrollIn(BaseModel):
    course_id: int


class EnrollOut(BaseModel):
    id: int
    course_id: int
    points_left: int


# 로그인(JWT)은 범위 밖이라 고정 테스트 유저 1명으로 대신한다.
TEST_USER_ID = 1


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


@app.get("/me", response_model=MeOut)
def get_me():
    with Session(engine) as session:
        user = session.get(User, TEST_USER_ID)
        course_ids = session.scalars(
            select(Enrollment.course_id).where(Enrollment.user_id == TEST_USER_ID)
        ).all()
        return MeOut(id=user.id, name=user.name, points=user.points,
                     enrolled_course_ids=list(course_ids))


@app.post("/enrollments", response_model=EnrollOut, status_code=201)
def enroll(body: EnrollIn):
    # session.begin(): 블록이 정상으로 끝나면 COMMIT, 중간에 예외가 나면 전부 ROLLBACK
    with Session(engine) as session, session.begin():
        course = session.get(Course, body.course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다")

        # SELECT ... FOR UPDATE: 이 유저 행에 자물쇠를 건다.
        # 같은 유저의 다른 신청은 이 트랜잭션이 COMMIT/ROLLBACK 될 때까지 여기서 기다린다.
        user = session.get(User, TEST_USER_ID, with_for_update=True)

        if user.points < course.price:
            raise HTTPException(status_code=400, detail="포인트가 부족합니다")

        user.points -= course.price                       # 1) 포인트 차감
        enrollment = Enrollment(user_id=user.id, course_id=course.id)
        session.add(enrollment)                           # 2) 신청 기록
        try:
            session.flush()  # 지금 바로 SQL을 보내 UNIQUE 위반을 여기서 잡는다
        except IntegrityError:
            raise HTTPException(status_code=409, detail="이미 신청한 강의입니다")

        return EnrollOut(id=enrollment.id, course_id=course.id, points_left=user.points)
