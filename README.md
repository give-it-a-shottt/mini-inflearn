# 미니 인프런

강의 목록·상세를 보고, 포인트로 수강신청을 하는 작은 온라인 강의 서비스.
Next.js · FastAPI · PostgreSQL을 처음부터 직접 만들며 "요청이 화면에서 DB까지 어떻게 흘러가는지"를 익히기 위한 학습 프로젝트다.

- 서비스: https://mini-inflearn.vercel.app/courses
- API: https://mini-inflearn-api.onrender.com/orm/courses
  (Render 무료 플랜이라 15분 동안 요청이 없으면 잠든다. 첫 요청은 30~50초 걸릴 수 있다.)

## 구조

```
브라우저 ──> Vercel (Next.js, Pages Router)  ──SSR fetch──┐
   │                                                    ▼
   └──── 수강신청 버튼 (TanStack Query) ──────>  Render (FastAPI) ──> Neon (PostgreSQL)
```

| 영역 | 기술 |
|---|---|
| 프론트 | Next.js (Pages Router) + TypeScript, TanStack Query |
| 백엔드 | FastAPI, SQLAlchemy 2.0 (동기), Pydantic |
| DB | PostgreSQL 16 (로컬 Docker) / Neon (배포) |
| 배포 | Vercel (프론트), Render (백엔드), Neon (DB) |

## 기능

| 화면 / API | 내용 |
|---|---|
| `/courses` | 강의 목록. `getServerSideProps`로 서버에서 그려서 보낸다(SSR). |
| `/courses/[id]` | 강의 상세(SSR) + 내 포인트 + 수강신청 버튼. 없는 강의는 404 페이지. |
| `GET /orm/courses`, `GET /orm/courses/{id}` | 강의 목록·상세. 응답 모델(`CourseOut`)로 내보낼 칸만 거른다. |
| `GET /me` | 테스트 유저의 포인트와 신청한 강의 id 목록 |
| `POST /enrollments` | 수강신청. 201 / 400(포인트 부족) / 404(없는 강의) / 409(이미 신청) |

로그인(JWT)은 범위 밖이라 고정 테스트 유저 1명(id 1, 50,000P)으로 대신한다.

## 수강신청에서 지킨 것

수강신청은 "포인트 차감"과 "신청 기록" 두 가지를 바꾼다. 여기서 생길 수 있는 문제를 한 겹씩 막았다.

| 막는 것 | 방법 | 위치 |
|---|---|---|
| 포인트만 빠지고 기록은 없는 상태 | 트랜잭션(`session.begin()`): 둘 다 성공해야 COMMIT, 하나라도 실패하면 전부 ROLLBACK | `backend/main.py` `enroll` |
| 같은 강의 중복 신청 (버튼 연타, 동시 요청) | `UNIQUE (user_id, course_id)` → 위반 시 409 | `backend/schema.sql` |
| 포인트가 음수가 되는 버그 | `CHECK (points >= 0)` | `backend/schema.sql` |
| 서로 다른 강의 동시 신청 시 갱신 손실 | 유저 행 잠금 `SELECT ... FOR UPDATE` (`with_for_update=True`) | `backend/main.py` `enroll` |
| 신청 후 화면의 포인트가 옛 값으로 남음 | 성공 시 `invalidateQueries(["me"])`로 캐시 무효화 | `frontend/pages/courses/[id].tsx` |

갱신 손실은 실제로 재현해서 확인했다. 35,000P로 33,000원·3,000원 강의를 동시에 신청하면, 잠금이 없을 때는 둘 다 성공하고 3,000P만 빠졌다. 잠금을 건 뒤에는 두 번째 요청이 400(포인트 부족)으로 막혔다. 자세한 기록은 [troubleshooting.md](troubleshooting.md)의 TS-011에 있다.

```bash
# 재현 스크립트 (백엔드 서버가 켜져 있어야 함)
cd backend && uv run python race_enroll.py 1 2   # 서로 다른 강의 동시 신청
cd backend && uv run python race_enroll.py 1 1   # 같은 강의 동시에 두 번
```

## 로컬에서 실행하기

필요한 것: Docker Desktop, [uv](https://docs.astral.sh/uv/), Node.js

```bash
# 1. DB (PostgreSQL 16, 5433 포트)
docker compose up -d
docker compose exec -T db psql -U postgres < backend/schema.sql   # 테이블 + 기본 데이터

# 2. 백엔드 (http://localhost:8000, 문서: /docs)
cd backend
cp .env.example .env          # DATABASE_URL을 로컬 DB 주소로 채운다
uv sync
uv run uvicorn main:app --port 8000

# 3. 프론트 (http://localhost:3000/courses)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## 환경변수

비밀번호와 장소마다 다른 주소는 코드에 적지 않고 환경변수로 받는다. `.env*` 파일은 Git에 올라가지 않고, 견본(`.env.example`)만 올라간다.

| 어디 | 변수 | 로컬 값 | 배포 값 |
|---|---|---|---|
| 백엔드 (Render) | `DATABASE_URL` | `postgresql+psycopg://postgres:...@localhost:5433/postgres` | Neon 주소 |
| 백엔드 (Render) | `FRONTEND_ORIGINS` | `http://localhost:3000` | `http://localhost:3000,https://mini-inflearn.vercel.app` |
| 프론트 (Vercel) | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | `https://mini-inflearn-api.onrender.com` |

- `NEXT_PUBLIC_`로 시작하는 값은 빌드할 때 브라우저 JS에 박혀 누구나 볼 수 있다. 비밀값은 넣지 않는다.
- Neon이 주는 `postgresql://` 주소는 코드에서 `postgresql+psycopg://`로 바꿔 쓴다(설치한 드라이버가 psycopg 3이기 때문).

## 폴더

```
mini-inflearn/
├── docker-compose.yml       로컬 PostgreSQL
├── troubleshooting.md       에러 기록 (TS-001 ~ )
├── backend/
│   ├── main.py              FastAPI 앱 (모델, API, 수강신청 트랜잭션)
│   ├── schema.sql           테이블 + 기본 데이터 (로컬·Neon 공용)
│   ├── race_enroll.py       동시 신청 실험
│   ├── requirements.txt     Render 설치 목록
│   └── .env.example
└── frontend/
    ├── lib/api.ts           API 주소와 호출 함수
    ├── pages/_app.tsx       QueryClientProvider
    └── pages/courses.tsx, pages/courses/[id].tsx
```

## 다음에 할 것

- 로그인(JWT): 고정 테스트 유저를 실제 유저로 바꾸기
- 스키마 변경 관리(Alembic 마이그레이션). 지금은 `schema.sql`을 직접 실행한다.
- 범위 밖으로 둔 것: 동영상 업로드, 실제 결제, 리뷰·Q&A, 진도율
