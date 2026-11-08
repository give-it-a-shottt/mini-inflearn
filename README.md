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
| `/login` | 로그인·로그아웃. 받은 JWT를 localStorage에 저장한다. |
| `GET /orm/courses`, `GET /orm/courses/{id}` | 강의 목록·상세. 응답 모델(`CourseOut`)로 내보낼 칸만 거른다. |
| `POST /signup` | 가입(50,000P 지급) + JWT 발급. 201 / 409(이미 가입한 이메일) |
| `POST /login` | 이메일·비밀번호 확인 후 JWT 발급. 200 / 401 |
| `GET /me` | 로그인한 유저의 포인트와 신청한 강의 id 목록. 토큰 필요 |
| `POST /enrollments` | 수강신청. 201 / 400(포인트 부족) / 401(토큰 없음·위조·만료) / 404(없는 강의) / 409(이미 신청) |

테스트 계정: `test@example.com` / `test1234` (기존 테스트유저 id 1, 50,000P)

## 로그인(JWT)에서 지킨 것

HTTP 요청에는 원래 "누가 보냈는지"가 없다. 로그인할 때 서버가 "너는 N번 유저"라고 적고 **서명한** 표(JWT)를 주고, 브라우저는 이후 요청마다 `Authorization: Bearer <토큰>` 헤더로 그 표를 보여 준다.

```
로그인    브라우저 ── POST /login {email, password} ──▶ 서버: DB의 비밀번호 해시와 대조
          브라우저 ◀── JWT { sub: "1", exp } + 서명 ── 서버: 비밀키로 서명
신청      브라우저 ── POST /enrollments + Authorization: Bearer <JWT> ──▶ 서버: 서명·만료 검증 → sub로 유저 결정
```

| 막는 것 | 방법 | 위치 |
|---|---|---|
| 남의 `user_id`로 바꿔치기한 토큰 | 서명 검증. 내용을 고치면 서버가 비밀키로 다시 계산한 서명과 달라져 401 | `get_current_user_id` |
| 요청 body에 `user_id`를 넣어 남의 포인트로 신청 | `user_id`는 body가 아니라 검증된 토큰에서만 꺼낸다 | `enroll(body, user_id: CurrentUserId)` |
| 토큰이 새면 영원히 쓰이는 문제 | `exp`로 유효기간 1시간 | `create_access_token` |
| DB가 털리면 비밀번호도 털리는 문제 | 원문 대신 PBKDF2(소금 + 60만 번) 해시만 저장 | `hash_password` |
| 가입 여부가 로그인 에러로 새는 문제 | 이메일 없음·비밀번호 틀림을 같은 401 문구로 응답 | `login` |

- JWT는 **암호화가 아니라 서명**이다. 내용은 누구나 base64로 풀어 읽을 수 있으므로 비밀번호·개인정보는 넣지 않는다.
- 비밀키(`JWT_SECRET`)는 서버 환경변수에만 있다. 이 값이 새면 누구나 아무 유저의 진짜 토큰을 만들 수 있다.
- 토큰을 localStorage에 두면 구현이 단순한 대신, 페이지에 악성 스크립트가 들어오면(XSS) 토큰을 읽어 갈 수 있다. 실서비스에서는 `HttpOnly` 쿠키 + 짧은 access token + refresh token 조합을 검토한다.

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
cp .env.example .env          # DATABASE_URL을 로컬 DB 주소로, JWT_SECRET을 무작위 값으로 채운다
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
| 백엔드 (Render) | `JWT_SECRET` | 무작위 긴 문자열 | 로컬과 **다른** 무작위 긴 문자열 |
| 프론트 (Vercel) | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | `https://mini-inflearn-api.onrender.com` |

- `NEXT_PUBLIC_`로 시작하는 값은 빌드할 때 브라우저 JS에 박혀 누구나 볼 수 있다. 비밀값은 넣지 않는다.
- Neon이 주는 `postgresql://` 주소는 코드에서 `postgresql+psycopg://`로 바꿔 쓴다(설치한 드라이버가 psycopg 3이기 때문).

## 폴더

```
mini-inflearn/
├── docker-compose.yml       로컬 PostgreSQL
├── troubleshooting.md       에러 기록 (TS-001 ~ )
├── backend/
│   ├── main.py              FastAPI 앱 (모델, API, 수강신청 트랜잭션, JWT 로그인)
│   ├── schema.sql           테이블 + 기본 데이터 (로컬·Neon 공용)
│   ├── race_enroll.py       동시 신청 실험
│   ├── requirements.txt     Render 설치 목록
│   └── .env.example
└── frontend/
    ├── lib/api.ts           API 주소와 호출 함수
    ├── pages/_app.tsx       QueryClientProvider
    └── pages/courses.tsx, pages/courses/[id].tsx, pages/login.tsx
```

## 다음에 할 것

- 토큰 보관을 localStorage에서 HttpOnly 쿠키로 옮기고 refresh token 추가
- 프론트 회원가입 화면 (지금은 `/docs`에서 `POST /signup`으로 가입)
- 스키마 변경 관리(Alembic 마이그레이션). 지금은 `schema.sql`을 직접 실행한다.
- 범위 밖으로 둔 것: 동영상 업로드, 실제 결제, 리뷰·Q&A, 진도율
