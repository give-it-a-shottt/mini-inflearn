-- backend/schema.sql — 빈 DB(로컬·클라우드)에 테이블과 기본 데이터를 만드는 파일
-- 실행: psql "$DATABASE_URL" -f schema.sql   (DATABASE_URL은 postgresql:// 로 시작하는 주소)

CREATE TABLE IF NOT EXISTS courses (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title      VARCHAR(50) NOT NULL,
    instructor VARCHAR(20) NOT NULL,
    price      INTEGER     NOT NULL
);

INSERT INTO courses (title, instructor, price)
SELECT * FROM (VALUES
    ('파이썬',      '클로드',  33000),
    ('파이썬입문',  '클로드',   3000),
    ('파이썬입문2', '클로드2', 313000)
) AS seed(title, instructor, price)
WHERE NOT EXISTS (SELECT 1 FROM courses);

-- ── Phase 2: 수강신청 ─────────────────────────────────────────────
-- 유저: 로그인 대신 고정 테스트 유저 1명. 포인트는 0 미만이 될 수 없다(CHECK).
CREATE TABLE IF NOT EXISTS users (
    id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name   VARCHAR(20) NOT NULL,
    points INTEGER     NOT NULL DEFAULT 0 CHECK (points >= 0)
);

-- 수강신청: 누가(user_id) 어떤 강의(course_id)를 신청했나.
-- UNIQUE (user_id, course_id) → 같은 유저가 같은 강의를 두 번 신청하면 DB가 거부한다.
CREATE TABLE IF NOT EXISTS enrollments (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    INTEGER     NOT NULL REFERENCES users(id),
    course_id  INTEGER     NOT NULL REFERENCES courses(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, course_id)
);

-- 테스트 유저: 50,000P → 33,000 + 3,000 강의는 살 수 있고 313,000 강의는 포인트 부족
INSERT INTO users (name, points)
SELECT '테스트유저', 50000
WHERE NOT EXISTS (SELECT 1 FROM users);

-- ── 로그인(JWT) ───────────────────────────────────────────────────
-- 기존 users 테이블에 로그인용 칸을 추가한다. 비밀번호는 원문 대신 해시만 저장한다.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email         VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(200);

-- 기존 테스트유저(1번)에게 로그인 정보를 준다: test@example.com / test1234
-- (아래 해시는 main.py의 hash_password("test1234")로 만든 값)
UPDATE users
SET email = 'test@example.com',
    password_hash = 'pbkdf2_sha256$600000$5b86a6a546b63593fb46eb2712f9ce9f$0ac8bd28e3893d83611058ed35ffc8fe661070c2e571308aa20126a3556a8243'
WHERE id = 1 AND email IS NULL;
