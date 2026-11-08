# backend/main.py
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from sqlalchemy import ForeignKey, create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

load_dotenv()                                   # ㄹ. .env 파일을 읽어 환경변수로 등록
DATABASE_URL = os.getenv("DATABASE_URL")        # ㄷ. 환경변수에서 값 꺼내기
if DATABASE_URL is None:
    raise RuntimeError("DATABASE_URL 환경변수가 없습니다 (.env 또는 배포 설정 화면 확인)")
# Neon 같은 클라우드는 postgresql:// 로 주는데, SQLAlchemy는 그러면 설치 안 된 psycopg2를 찾는다.
# 우리가 설치한 psycopg(3) 드라이버를 쓰도록 앞부분을 바꿔 준다.
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)  # ㄱ. 그 값으로 DB 연결

# JWT 서명(도장)에 쓰는 비밀키. 서버 .env에만 두고 토큰 안에는 절대 넣지 않는다.
# 이 값이 새면 누구나 아무 user_id로 진짜 도장이 찍힌 토큰을 만들 수 있다.
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET 환경변수가 없습니다 (.env 또는 배포 설정 화면 확인)")
JWT_ALGORITHM = "HS256"                 # 비밀키 하나로 도장 찍기·확인을 둘 다 하는 방식
ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # 토큰이 새도 1시간 뒤엔 못 쓰게 유효기간을 둔다


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
    email: Mapped[str | None] = mapped_column(unique=True)
    # 비밀번호 원문은 저장하지 않는다. 한 방향으로만 섞은 값(해시)만 저장한다.
    password_hash: Mapped[str | None]


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


class SignupIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── 비밀번호 해시 ───────────────────────────────────────────────────
# PBKDF2: 비밀번호 + 소금(salt, 유저마다 다른 무작위 값)을 60만 번 섞는다.
# DB가 통째로 털려도 원래 비밀번호를 거꾸로 알아내기 매우 어렵게 만들기 위해서다.
PBKDF2_ITERATIONS = 600_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    _, iterations, salt_hex, digest_hex = stored.split("$")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(),
                                 bytes.fromhex(salt_hex), int(iterations))
    # 같은 방법으로 다시 섞어서 저장된 값과 비교한다. compare_digest는 비교 시간으로 힌트가 새지 않게 해 준다.
    return hmac.compare_digest(digest.hex(), digest_hex)


# ── JWT ─────────────────────────────────────────────────────────────
# JWT = 헤더.내용.서명. 내용은 누구나 읽을 수 있고(암호화 X), 서명은 비밀키가 있어야만 만들 수 있다.
# 그래서 내용(sub)을 고치면 서버가 다시 계산한 서명과 달라져 위조가 들통난다.
def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),                                    # 누구의 토큰인지
        "exp": datetime.now(timezone.utc) + ACCESS_TOKEN_EXPIRES,  # 언제까지 유효한지
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# 요청 헤더 "Authorization: Bearer <토큰>" 에서 토큰을 꺼내 준다. 헤더가 없으면 401.
bearer = HTTPBearer()


def get_current_user_id(
    cred: Annotated[HTTPAuthorizationCredentials, Depends(bearer)],
) -> int:
    try:
        # 서명 검증 + 유효기간(exp) 검사를 한 번에 한다. 하나라도 틀리면 예외.
        payload = jwt.decode(cred.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="토큰이 유효하지 않습니다. 다시 로그인해 주세요",
                            headers={"WWW-Authenticate": "Bearer"})
    return int(payload["sub"])


# 엔드포인트에서 `user_id: CurrentUserId` 라고만 쓰면 FastAPI가 위 함수를 먼저 실행해 값을 넣어 준다.
CurrentUserId = Annotated[int, Depends(get_current_user_id)]


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


@app.post("/signup", response_model=TokenOut, status_code=201)
def signup(body: SignupIn):
    with Session(engine) as session, session.begin():
        # 가입 축하 포인트 50,000P. email은 UNIQUE라 중복 가입은 DB가 막는다.
        user = User(name=body.name, email=body.email, points=50000,
                    password_hash=hash_password(body.password))
        session.add(user)
        try:
            session.flush()
        except IntegrityError:
            raise HTTPException(status_code=409, detail="이미 가입한 이메일입니다")
        return TokenOut(access_token=create_access_token(user.id))


@app.post("/login", response_model=TokenOut)
def login(body: LoginIn):
    with Session(engine) as session:
        user = session.scalars(select(User).where(User.email == body.email)).first()
    # 이메일이 없는지, 비밀번호가 틀렸는지 구분해 알려 주지 않는다(가입 여부가 새지 않게).
    if user is None or user.password_hash is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")
    return TokenOut(access_token=create_access_token(user.id))


@app.get("/me", response_model=MeOut)
def get_me(user_id: CurrentUserId):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if user is None:  # 토큰은 진짜인데 그 사이 유저가 지워진 경우
            raise HTTPException(status_code=401, detail="존재하지 않는 사용자입니다")
        course_ids = session.scalars(
            select(Enrollment.course_id).where(Enrollment.user_id == user_id)
        ).all()
        return MeOut(id=user.id, name=user.name, points=user.points,
                     enrolled_course_ids=list(course_ids))


@app.post("/enrollments", response_model=EnrollOut, status_code=201)
def enroll(body: EnrollIn, user_id: CurrentUserId):
    # user_id는 요청 body가 아니라 서명이 검증된 토큰에서 온다 → 남의 포인트로 신청할 수 없다.
    # session.begin(): 블록이 정상으로 끝나면 COMMIT, 중간에 예외가 나면 전부 ROLLBACK
    with Session(engine) as session, session.begin():
        course = session.get(Course, body.course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다")

        # SELECT ... FOR UPDATE: 이 유저 행에 자물쇠를 건다.
        # 같은 유저의 다른 신청은 이 트랜잭션이 COMMIT/ROLLBACK 될 때까지 여기서 기다린다.
        user = session.get(User, user_id, with_for_update=True)
        if user is None:
            raise HTTPException(status_code=401, detail="존재하지 않는 사용자입니다")

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
