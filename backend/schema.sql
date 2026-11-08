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
