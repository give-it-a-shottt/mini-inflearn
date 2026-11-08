# 트러블슈팅 기록

## 작성 규칙
- 에러 1건 = 기록 1건. 새 기록과 목차 행은 맨 위에 추가한다.
- 6칸은 문답으로 내가 직접 쓴 문장을 바탕으로 한다. 코치는 뜻을 바꾸지 않는 선에서 오타와 문장 흐름을 다듬고, 사실 오류는 `⚠️ 코치 정정:`으로 따로 짚는다.
- 에러 메시지 원문은 자르지 않고 코드 블록에 그대로 붙인다.
- 원인 영역: 프론트 / 백엔드 / DB / 네트워크 / 환경 중 하나.
- 면접에서 말할 만한 기록은 단계 회고 때 제목 옆에 `(사례 후보)`를 붙인다.

## 빈 템플릿

### TS-000. 제목
- 날짜: YYYY-MM-DD
- 단계: Phase N · 주제
- 원인 영역:
- 관련 파일·커밋:

**에러 메시지 원문**
```

```

**1. 증상**

**2. 내 가설**

**3. 확인 방법**

**4. 진짜 원인**

**5. 해결**

**6. 배운 원리**

---

## 목차

| 번호 | 제목 | 단계 | 원인 영역 |
|---|---|---|---|
| TS-010 | 목록의 Link href에 백틱과 `${}`를 빼서 주소가 /courses/%7Bcourse.id%7D가 되고 FastAPI 422 → 404 페이지 | Phase 1 · 목록→상세 이동(Link) | 프론트 |
| TS-009 | 없는 강의(/courses/999)를 열었는데 getServerSideProps가 FastAPI의 404를 확인하지 않아 빈 상세 페이지가 200으로 뜸 | Phase 1 · 강의 상세 SSR(동적 라우트 [id]) | 프론트 |
| TS-008 | SSR 페이지에서 FastAPI가 꺼져 있어 getServerSideProps의 fetch가 ECONNREFUSED로 실패해 Next.js가 500 반환 | Phase 1 · 강의 목록 SSR(getServerSideProps) | 환경 |
| TS-007 | 404 처리를 빼서 None이 응답 명단(CourseOut) 검사까지 가 ResponseValidationError(500) 발생 | Phase 1 · 강의 상세 조회(경로 파라미터·404) | 백엔드 |
| TS-006 | 응답 명단(CourseOut)에만 있는 필수 칸(level) 때문에 ResponseValidationError 발생 | Phase 1 · Pydantic 응답 모델(response_model) | 백엔드 |
| TS-005 | Docker Desktop이 꺼져 있어 DB 연결을 기다리다 API가 응답 없이 멈춤 | Phase 1 · Pydantic 응답 모델(response_model) | 환경 |
| TS-004 | 클래스에만 있고 테이블에는 없는 컬럼(level)을 조회해 UndefinedColumn 발생 | Phase 1 · SQLAlchemy ORM 전환 | 백엔드 |
| TS-003 | 가상환경을 활성화하지 않아 uvicorn 명령을 찾지 못함 | Phase 1 · SQLAlchemy ORM 전환 | 환경 |
| TS-002 | GENERATED ALWAYS 칸인 id에 값을 직접 넣어 INSERT 실패 | Phase 1 · FastAPI와 DB 연결 | 백엔드 |
| TS-001 | NULL 행이 남은 상태에서 NOT NULL 제약 추가 실패 | Phase 1 · SQL로 courses 테이블 만들기 | DB |

---

## 기록

### TS-010. 목록의 Link href에 백틱과 `${}`를 빼서 주소가 /courses/%7Bcourse.id%7D가 되고 FastAPI 422 → 404 페이지
- 날짜: 2026-11-04
- 단계: Phase 1 · 목록→상세 이동(Link) (고장 실험)
- 원인 영역: 프론트
- 관련 파일·커밋: `frontend/pages/courses.tsx` (href를 `` {`/courses/${course.id}`} `` → `"/courses/{course.id}"`로 바꿔 봄)

**에러 메시지 원문**
```
제목에 마우스를 올렸을 때 브라우저 왼쪽 아래 주소:
http://localhost:3000/courses/%7Bcourse.id%7D

FastAPI 터미널:
INFO:     127.0.0.1:50468 - "GET /orm/courses/%7Bcourse.id%7D HTTP/1.1" 422 Unprocessable Entity

브라우저 화면: 404 페이지
```

**1. 증상**
제목에 마우스를 올렸을 때는 화면에 별다른 반응이 없었지만, 왼쪽 아래 주소는 `/courses/%7Bcourse.id%7D`였다. 클릭하자 404 페이지가 나왔고, uvicorn 터미널에는 422 로그가 찍혀 있었다.

**2. 내 가설**
원인은 프론트라고 생각했다. 백엔드 로그에 422가 찍힌 걸 보고, 요청을 보내는 쪽 코드를 바로 확인했을 것 같다.

**3. 확인 방법**
제목에 마우스를 올렸을 때 보이는 주소를 확인한다. `/courses/1`이어야 할 주소가 `%7Bcourse.id%7D`로 보이면 프론트에서 주소를 잘못 만든 것이다.

**4. 진짜 원인**
페이지를 옮기는 주소(href)를 잘못 만들었다. 변수를 넣어 주소를 만들 때는 `${}`를 써야 하고, 그것도 쌍따옴표가 아니라 백틱으로 감싸야 한다. 둘 다 빠져서 `{course.id}`가 글자 그대로 주소에 들어갔다.

⚠️ 코치 정정: `{`와 `}`는 URL에 그대로 쓸 수 없는 글자라 브라우저가 `%7B`, `%7D`로 퍼센트 인코딩해서 보냈다. 이 글자가 [id].tsx의 `context.params.id`를 거쳐 FastAPI까지 가서 숫자가 아니라고 422로 거절됐고, [id].tsx의 400번대 처리(`notFound: true`)에 걸려 404 페이지가 떴다.

**5. 해결**
JSX 중괄호, 백틱, `${}`, 맨 앞 `/`를 모두 갖춘 형태로 되돌렸다.
```tsx
<Link href={`/courses/${course.id}`}>{course.title}</Link>
```
- `{ }`: JSX에서 "여기서부터는 JS로 계산해라"라는 표시다. 없으면 빌드 에러가 난다.
- 맨 앞 `/`: 루트부터 찾는 주소다. 없으면 지금 있는 위치 기준이 돼서, /courses/1 페이지에서 `courses/2`를 누르면 /courses/courses/2로 간다.

**6. 배운 원리**
늘 같은 주소는 쌍따옴표 문자열로 쓰면 되므로 중괄호가 필요 없다. 하지만 동적으로 바뀌는 주소는 중괄호 안에 백틱을 쓰고 `${}`로 값을 넣어야 한다. 그렇지 않으면 `${course.id}`가 값으로 바뀌지 않고 단순한 문자열로 인식된다.

---

### TS-009. 없는 강의(/courses/999)를 열었는데 getServerSideProps가 FastAPI의 404를 확인하지 않아 빈 상세 페이지가 200으로 뜸
- 날짜: 2026-11-03
- 단계: Phase 1 · 강의 상세 SSR(동적 라우트 [id]) (고장 실험)
- 원인 영역: 프론트
- 관련 파일·커밋: `frontend/pages/courses/[id].tsx` (DB에 없는 번호로 `localhost:3000/courses/999` 열기)

**에러 메시지 원문**
```
브라우저 화면:
강사:

가격: 원

Network 탭:
Request URL
http://localhost:3000/courses/999
Request method
GET
Status code
200 OK

FastAPI 터미널:
INFO:     127.0.0.1:53354 - "GET /orm/courses/999 HTTP/1.1" 404 Not Found

Next.js 터미널 (확인용 console.log(res.status, course) 추가 후):
404 { detail: '강의를 찾을 수 없습니다' }
 GET /_next/data/development/courses/999.json?id=999 200 in 54ms (next.js: 42ms, application-code: 12ms)
404 { detail: '강의를 찾을 수 없습니다' }
 GET /courses/999 200 in 16ms (next.js: 1.2ms, application-code: 15ms)
```

**1. 증상**
Network 탭에서는 200 OK라는 정상 응답이 왔고, 화면에는 "강사:", "가격: 원"만 출력됐다. 그런데 FastAPI 서버 터미널에는 `GET /orm/courses/999 HTTP/1.1" 404 Not Found`가 찍혔다.

**2. 내 가설**
원인은 프론트라고 생각했다. 백엔드는 강의가 없어서 404 에러를 보냈는데, 프론트는 브라우저에 어떻게든 응답을 해야 하니까 없는 번호의 결과를 그대로 200 OK로 넘겼을 것이다.

**3. 확인 방법**
프론트가 FastAPI에게 실제로 무엇을 받았는지 보려고, JSON으로 파싱한 `course`를 찍어 봤다(`console.log(res.status, course)`). `getServerSideProps`는 Next.js 서버에서 실행되므로 로그는 브라우저 콘솔이 아니라 `npm run dev` 터미널에서 확인했다. `404 { detail: '강의를 찾을 수 없습니다' }` 바로 아래에 `GET /courses/999 200`이 찍혀, 404를 받고도 브라우저에는 200을 보낸 것을 확인했다.

**4. 진짜 원인**
`fetch`로 백엔드에 요청을 보내 응답을 받은 뒤, 상태 코드를 확인하지 않고 `course` 값을 그대로 props로 넘겼다. 상태 코드가 404일 때 에러로 처리하는 부분이 없었기 때문에 컴포넌트는 "데이터가 왔네?" 하고 그 데이터(`{ detail: ... }`)로 화면을 그렸고, 브라우저에는 200으로 응답했다.

**5. 해결**
`getServerSideProps`에서 400번대와 500번대 응답을 따로 잡도록 고쳤다.

⚠️ 코치 정정: 별도의 에러 핸들러를 만든 것이 아니라, `getServerSideProps` 안 `fetch` 직후에 `if`문 2개로 상태 코드를 확인했다. 400번대는 `{ notFound: true }`를 돌려줘 404 페이지를 보여 주고, 500번대는 `throw`로 Next.js 500 에러를 낸다.

```tsx
if (res.status >= 400 && res.status < 500) {
  return { notFound: true };
}
if (!res.ok) {
  throw new Error(`FastAPI 응답 실패: ${res.status}`);
}
```
확인 결과 `/courses/1`은 200으로 정상 표시되고, `/courses/999`와 `/courses/abc`(FastAPI 422)는 404 페이지가 떴다.

**6. 배운 원리**
TS-008처럼 백엔드가 꺼져 있으면 응답이 아예 오지 않으니 `fetch`가 스스로 에러를 던진다. 하지만 404든 500이든 응답이 오기만 하면 `fetch`는 성공으로 본다. 그래서 응답이 왔을 때 상태 코드를 직접 확인해서 걸러야 한다. 이때 400번대(요청이 잘못됨)와 500번대(서버가 고장 남)를 나눠 처리해야 서버 잘못인지 클라이언트 요청 잘못인지 구분할 수 있다.

---

### TS-008. SSR 페이지에서 FastAPI가 꺼져 있어 getServerSideProps의 fetch가 ECONNREFUSED로 실패해 Next.js가 500 반환
- 날짜: 2026-11-02
- 단계: Phase 1 · 강의 목록 SSR(getServerSideProps) (고장 실험)
- 원인 영역: 환경
- 관련 파일·커밋: `frontend/pages/courses.tsx` (useEffect 방식을 `getServerSideProps`로 바꾼 뒤, 터미널 1의 uvicorn을 Ctrl+C로 끄고 `localhost:3000/courses` 새로고침)

**에러 메시지 원문**
```
GET / 200 in 129ms (next.js: 94ms, application-code: 35ms)
⨯ TypeError: fetch failed
    at async getServerSideProps (pages\courses.tsx:8:15)
   6 |
   7 | export async function getServerSideProps() {
>  8 |   const res = await fetch("http://localhost:8000/courses");
     |               ^
   9 |   const courses: Course[] = await res.json();
  10 |   return { props: { courses } };
  11 | } {
  [cause]: AggregateError: 
      at ignore-listed frames {
    code: 'ECONNREFUSED',
    [errors]: [
      Error: connect ECONNREFUSED ::1:8000
          at ignore-listed frames {
        errno: -4078,
        code: 'ECONNREFUSED',
        syscall: 'connect',
        address: '::1',
        port: 8000
      },
      Error: connect ECONNREFUSED 127.0.0.1:8000
          at ignore-listed frames {
        errno: -4078,
        code: 'ECONNREFUSED',
        syscall: 'connect',
        address: '127.0.0.1',
        port: 8000
      }
    ]
  }
}
⨯ TypeError: fetch failed
    at async getServerSideProps (pages\courses.tsx:8:15)
   6 |
   7 | export async function getServerSideProps() {
>  8 |   const res = await fetch("http://localhost:8000/courses");
     |               ^
   9 |   const courses: Course[] = await res.json();
  10 |   return { props: { courses } };
  11 | } {
  page: '/courses',
  [cause]: AggregateError: 
      at ignore-listed frames {
    code: 'ECONNREFUSED',
    [errors]: [
      Error: connect ECONNREFUSED ::1:8000
          at ignore-listed frames {
        errno: -4078,
        code: 'ECONNREFUSED',
        syscall: 'connect',
        address: '::1',
        port: 8000
      },
      Error: connect ECONNREFUSED 127.0.0.1:8000
          at ignore-listed frames {
        errno: -4078,
        code: 'ECONNREFUSED',
        syscall: 'connect',
        address: '127.0.0.1',
        port: 8000
      }
    ]
  }
}
 GET /courses 500 in 514ms (next.js: 391ms, application-code: 123ms)
[browser] Uncaught TypeError: fetch failed
    at async getServerSideProps (pages/courses.tsx:8:15)
   6 |
   7 | export async function getServerSideProps() {
>  8 |   const res = await fetch("http://localhost:8000/courses");
     |               ^
   9 |   const courses: Course[] = await res.json();
  10 |   return { props: { courses } };
  11 | }
```

**1. 증상**
요청이 실패했다는 `TypeError: fetch failed` 에러가 보였고, `GET /courses 500 in 514ms`가 찍혔다.

**2. 내 가설**
500번이니까 원인은 서버 쪽이라고 생각했다.

**3. 확인 방법**
`GET /courses 500` 줄이 어느 터미널에 찍혔는지 봤다. Next.js 터미널(`npm run dev`)이었으니, 500을 던진 건 프론트엔드 서버(Next.js) 쪽이다.

**4. 진짜 원인**
8000번 포트에 아예 연결이 되지 않아 `fetch`가 바로 에러를 던졌다. 타임아웃이 아니라 `ECONNREFUSED`였다. Next.js 서버가 데이터를 받아 오지 못해서 HTML을 그리지 못했고, 그래서 브라우저에 500을 보냈다.

**5. 해결**
지금 당장은 FastAPI 서버를 다시 켜면 된다. 다시 켜고 새로고침하니 목록이 정상적으로 떴다.

**6. 배운 원리**
SSR 방식으로 페이지를 열 때 500 에러가 나면, 먼저 `getServerSideProps`에서 데이터를 제대로 받았는지 로그를 찍어 확인하고, 제대로 못 받았다면 백엔드 서버를 확인한다.

---

### TS-007. 404 처리를 빼서 None이 응답 명단(CourseOut) 검사까지 가 ResponseValidationError(500) 발생
- 날짜: 2026-11-02
- 단계: Phase 1 · 강의 상세 조회(경로 파라미터·404) (고장 실험)
- 원인 영역: 백엔드
- 관련 파일·커밋: `backend/main.py` (`get_course_orm`의 `if course is None: raise HTTPException(404)` 두 줄을 주석 처리 → `/orm/courses/999` 호출)

**에러 메시지 원문**
```
$ curl -i http://localhost:8000/orm/courses/999
HTTP/1.1 500 Internal Server Error
date: Sun, 01 Nov 2026 23:50:26 GMT
server: uvicorn
content-length: 21
content-type: text/plain; charset=utf-8

Internal Server Error
```
```
Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 411, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\applications.py", line 1216, in __call__
    await super().__call__(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\telemetry\_asgi.py", line 151, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 91, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 149, in simple_response
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 676, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 2809, in app
    await route.handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 1328, in handle
    await super().handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 282, in handle
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 166, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 152, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 767, in app
    content = await serialize_response(
              ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 343, in serialize_response
    raise ResponseValidationError(
fastapi.exceptions.ResponseValidationError: 1 validation error:
  {'type': 'model_attributes_type', 'loc': ('response',), 'msg': 'Input should be a valid dictionary or object to extract fields from', 'input': None}

  File "C:\back_prac\mini-inflearn\backend\main.py", line 58, in get_course_orm
    GET /orm/courses/{course_id}
```

**1. 증상**
클라이언트(curl)에서 요청을 보내니 `500 Internal Server Error`가 보였다. 동시에 우리가 띄운 uvicorn 서버 터미널에 `ResponseValidationError`가 찍혔다. 내용은 `model_attributes_type`이었고 `input: None`, 즉 칸을 꺼낼 대상이 없다는 뜻으로 보였다.

**2. 내 가설**
500번대 응답이 왔으니 백엔드 쪽일 확률이 높다. DB는 이전 요청에서 정상적으로 답했으니 원인은 프론트나 DB가 아니라 백엔드일 것이다.

**3. 확인 방법**
서버 로그를 봤다. 에러는 우리가 만든 `get_course_orm`(`/orm/courses/{course_id}`)에서 났고, Traceback 바로 위에 `WHERE courses.id = %(pk_1)s::INTEGER`와 `{'pk_1': 999}` SQL 로그가 있었다. DB까지 요청은 정상적으로 갔다.
⚠️ 코치 정정: DB는 실패하지 않았다. 999번이 없다는 결과(0개)를 에러 없이 돌려줬고, 에러는 그 뒤 응답 단계(`serialize_response`)에서 났다.

**4. 진짜 원인**
`if course is None: raise HTTPException(404)` 부분이 없어져서, DB가 돌려준 `None`이 그대로 `return`까지 전달됐다. 그 `None`이 `response_model`(`CourseOut` 명단) 검사에 걸렸다. 명단은 `id`·`title` 같은 칸을 가진 객체를 기대하는데 `None`에는 꺼낼 칸이 없으니, 서버가 응답 직전에 에러를 냈다.

**5. 해결**
`return` 전에 `if course is None: raise HTTPException(404)`를 다시 넣어 `None`이 `return`까지 가지 않게 했다. `curl -i .../orm/courses/999`를 다시 보내니 `404 Not Found`와 `{"detail":"강의를 찾을 수 없습니다"}`가 돌아왔다.

**6. 배운 원리**
다른 엔드포인트에서도 `return` 전에 에러가 날 만한 상황이 있으면 `raise`로 알맞은 상태 코드를 미리 보낸다. 특히 조회 결과가 없는 `None`일 수 있다면 이번처럼 `raise`로 먼저 걸러야 한다.
⚠️ 코치 정정: 답변에서 "데코레이터"라고 한 것은 엔드포인트(경로 함수)를 말한 것이다. 데코레이터는 그 위에 붙은 `@app.get(...)` 한 줄만 가리킨다.

---

### TS-006. 응답 명단(CourseOut)에만 있는 필수 칸(level) 때문에 ResponseValidationError 발생
- 날짜: 2026-11-01
- 단계: Phase 1 · Pydantic 응답 모델(response_model) (고장 실험)
- 원인 영역: 백엔드
- 관련 파일·커밋: `backend/main.py` (`CourseOut`에 `level: str` 추가 → `/orm/courses` 호출)

**에러 메시지 원문**
```
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 411, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\applications.py", line 1216, in __call__
    await super().__call__(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\telemetry\_asgi.py", line 151, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 91, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 149, in simple_response
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 676, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 2809, in app
    await route.handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 1328, in handle
    await super().handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 282, in handle
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 166, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 152, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 767, in app
    content = await serialize_response(
              ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 343, in serialize_response
    raise ResponseValidationError(
fastapi.exceptions.ResponseValidationError: 4 validation errors:
  {'type': 'missing', 'loc': ('response', 0, 'level'), 'msg': 'Field required', 'input': <main.Course object at 0x0000020B70D92FC0>}
  {'type': 'missing', 'loc': ('response', 1, 'level'), 'msg': 'Field required', 'input': <main.Course object at 0x0000020B70D93020>}
  {'type': 'missing', 'loc': ('response', 2, 'level'), 'msg': 'Field required', 'input': <main.Course object at 0x0000020B70E84950>}
  {'type': 'missing', 'loc': ('response', 3, 'level'), 'msg': 'Field required', 'input': <main.Course object at 0x0000020B70E84980>}

  File "C:\back_prac\mini-inflearn\backend\main.py", line 52, in get_courses_orm
    GET /orm/courses
```

**1. 증상**
`curl`로 `/orm/courses`를 호출하자 `Internal Server Error`가 떴다.

**2. 내 가설**
보내야 하는 데이터(명단)에는 `level`이 있는데 `Course`에는 없으니, 파이썬 쪽에서 막았나 보다.

**3. 확인 방법**
에러 원문을 맨 아래부터 읽었다. TS-004와 달리 `psycopg`와 `[SQL: ...]`이 없었고, 대신 `serialize_response`, `ResponseValidationError`, `missing`, `Field required`가 있었다.

**4. 진짜 원인**
명단의 `level: str`은 "level은 반드시 문자열이어야 하고, 없으면 안 된다"는 뜻인데, `Course` 객체에는 `level`이 없었다.

**5. 해결**
`level: str | None = None`으로 바꿔서, 칸이 없으면 null로 채우게 했다. 이후 모든 강의에 `"level": null`이 나왔다. (실험이 끝난 뒤 `level` 줄은 지웠다.)

**6. 배운 원리**
응답으로 내보내야 하는 값(명단)과 실제 객체가 어긋나면, Pydantic 쪽에서 응답을 내보내기 전에 막는다.

---

### TS-005. Docker Desktop이 꺼져 있어 DB 연결을 기다리다 API가 응답 없이 멈춤
- 날짜: 2026-11-01
- 단계: Phase 1 · Pydantic 응답 모델(response_model)
- 원인 영역: 환경
- 관련 파일·커밋: `backend/main.py` (`/orm/courses`에 `response_model=list[CourseOut]` 추가 후 첫 실행)

**에러 메시지 원문**

서버 창 (요청이 멈춘 상태에서 Ctrl+C로 서버를 끔)
```
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 195, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 678, in run_until_complete
    self.run_forever()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 645, in run_forever
    self._run_once()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 1999, in _run_once
    handle._run()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\events.py", line 88, in _run
    self._context.run(self._callback, *self._args)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 89, in serve
    with self.capture_signals():
         ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\contextlib.py", line 144, in __exit__
    next(self.gen)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 349, in capture_signals
    signal.raise_signal(captured_signal)
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 157, in _on_sigint
    raise KeyboardInterrupt()
KeyboardInterrupt

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 411, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\applications.py", line 1216, in __call__
    await super().__call__(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\telemetry\_asgi.py", line 151, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 91, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 149, in simple_response
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 676, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 2809, in app
    await route.handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 1328, in handle
    await super().handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 282, in handle
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 166, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 152, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 745, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 374, in run_endpoint_function
    return await run_in_threadpool(
           ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\to_thread.py", line 65, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2706, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
asyncio.exceptions.CancelledError
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 195, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 678, in run_until_complete
    self.run_forever()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 645, in run_forever
    self._run_once()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 1999, in _run_once
    handle._run()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\events.py", line 88, in _run
    self._context.run(self._callback, *self._args)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 89, in serve
    with self.capture_signals():
         ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\contextlib.py", line 144, in __exit__
    next(self.gen)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 349, in capture_signals
    signal.raise_signal(captured_signal)
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 157, in _on_sigint
    raise KeyboardInterrupt()
KeyboardInterrupt

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 411, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\applications.py", line 1216, in __call__
    await super().__call__(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\telemetry\_asgi.py", line 151, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 91, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 149, in simple_response
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 676, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 2809, in app
    await route.handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 1328, in handle
    await super().handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 282, in handle
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 166, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 152, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 745, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 374, in run_endpoint_function
    return await run_in_threadpool(
           ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\to_thread.py", line 65, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2706, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
asyncio.exceptions.CancelledError
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 195, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 678, in run_until_complete
    self.run_forever()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 645, in run_forever
    self._run_once()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 1999, in _run_once
    handle._run()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\events.py", line 88, in _run
    self._context.run(self._callback, *self._args)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 89, in serve
    with self.capture_signals():
         ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\contextlib.py", line 144, in __exit__
    next(self.gen)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 349, in capture_signals
    signal.raise_signal(captured_signal)
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 157, in _on_sigint
    raise KeyboardInterrupt()
KeyboardInterrupt

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 411, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\applications.py", line 1216, in __call__
    await super().__call__(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\telemetry\_asgi.py", line 151, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 91, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 149, in simple_response
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 676, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 2809, in app
    await route.handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 1328, in handle
    await super().handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 282, in handle
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 166, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 152, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 745, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 374, in run_endpoint_function
    return await run_in_threadpool(
           ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\to_thread.py", line 65, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2706, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
asyncio.exceptions.CancelledError
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 195, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 678, in run_until_complete
    self.run_forever()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 645, in run_forever
    self._run_once()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 1999, in _run_once
    handle._run()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\events.py", line 88, in _run
    self._context.run(self._callback, *self._args)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 89, in serve
    with self.capture_signals():
         ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\contextlib.py", line 144, in __exit__
    next(self.gen)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 349, in capture_signals
    signal.raise_signal(captured_signal)
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 157, in _on_sigint
    raise KeyboardInterrupt()
KeyboardInterrupt

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 411, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\applications.py", line 1216, in __call__
    await super().__call__(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\telemetry\_asgi.py", line 151, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 91, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 149, in simple_response
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 676, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 2809, in app
    await route.handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 1328, in handle
    await super().handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 282, in handle
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 166, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 152, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 745, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 374, in run_endpoint_function
    return await run_in_threadpool(
           ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\to_thread.py", line 65, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2706, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
asyncio.exceptions.CancelledError
ERROR:    Traceback (most recent call last):
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 195, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 678, in run_until_complete
    self.run_forever()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 645, in run_forever
    self._run_once()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\base_events.py", line 1999, in _run_once
    handle._run()
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\events.py", line 88, in _run
    self._context.run(self._callback, *self._args)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 89, in serve
    with self.capture_signals():
         ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\contextlib.py", line 144, in __exit__
    next(self.gen)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\server.py", line 349, in capture_signals
    signal.raise_signal(captured_signal)
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\runners.py", line 157, in _on_sigint
    raise KeyboardInterrupt()
KeyboardInterrupt

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 661, in lifespan
    await receive()
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\telemetry\_runtime.py", line 214, in wrapped_receive
    message = await receive()
              ^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\lifespan\on.py", line 137, in receive
    return await self.receive_queue.get()
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ASUS\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\Lib\asyncio\queues.py", line 158, in get
    await getter
asyncio.exceptions.CancelledError
```

`docker ps` 결과
```
$ docker ps
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/containers/json": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**1. 증상**
`curl`로 `/orm/courses`를 호출했는데 아무것도 나오지 않고 계속 기다렸다. Ctrl+C로 서버를 끄자 처리 중이던 요청 4개가 `CancelledError`로 취소됐다.

**2. 내 가설**
DB 쪽 문제인 것 같다. `curl`로 백엔드에 직접 요청했으니 프론트는 관계없고, 요청이 `return`까지 오지 못했으니 `return` 뒤에 일하는 `response_model`도 원인이 아니다. 함수 안에서 바깥(DB 서버)에 말을 거는 줄은 `session.scalars(select(Course))` 하나뿐이다.

**3. 확인 방법**
Postgres를 띄워 둔 곳에서 DB가 실행 중인지 보려고 `docker ps`를 실행했다. Docker 엔진으로 가는 통로(`dockerDesktopLinuxEngine`)를 찾을 수 없다는 에러가 나왔다.

**4. 진짜 원인**
도커 컨테이너가 에러가 나 있었다.
⚠️ 코치 정정: `docker ps` 메시지는 컨테이너 하나가 아니라 Docker 엔진(Docker Desktop) 자체가 꺼져 있었다는 뜻이다. 그래서 Postgres가 떠 있지 않았고, 함수는 DB 연결을 기다리기만 했다.

**5. 해결**
Docker를 다시 시작했다. 이후 `/orm/courses`가 강의 목록 JSON을 정상적으로 돌려줬다.

**6. 배운 원리**
API가 에러 없이 응답만 멈추면, 다음부터는 DB부터 확인해야 한다.

---

### TS-004. 클래스에만 있고 테이블에는 없는 컬럼(level)을 조회해 UndefinedColumn 발생
- 날짜: 2026-10-27
- 단계: Phase 1 · SQLAlchemy ORM 전환 (고장 실험)
- 원인 영역: 백엔드
- 관련 파일·커밋: `backend/main.py` (`Course` 클래스에 `level: Mapped[str]` 추가 → `/orm/courses` 호출)

**에러 메시지 원문**
```
Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1958, in _exec_single_context
    self.dialect.do_execute(
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\default.py", line 1192, in do_execute
    cursor.execute(statement, parameters)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\psycopg\cursor.py", line 117, in execute
    raise ex.with_traceback(None)
psycopg.errors.UndefinedColumn: column courses.level does not exist
LINE 1: ...courses.title, courses.instructor, courses.price, courses.le...
                                                             ^

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 411, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\applications.py", line 1216, in __call__
    await super().__call__(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\telemetry\_asgi.py", line 151, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 91, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 149, in simple_response
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 676, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 2809, in app
    await route.handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 1328, in handle
    await super().handle(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\routing.py", line 282, in handle
    await self.app(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 166, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 152, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 745, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\routing.py", line 374, in run_endpoint_function
    return await run_in_threadpool(
           ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\to_thread.py", line 65, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2706, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 1100, in run
    result = context.run(func, *args)
             ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\fastapi\telemetry\_api.py", line 244, in _run_sync_endpoint
    return function(**arguments)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\main.py", line 47, in get_courses_orm
    courses = session.scalars(select(Course)).all()
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\orm\session.py", line 2594, in scalars
    return self._execute_internal(
           ^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\orm\session.py", line 2363, in _execute_internal
    compile_state_cls.orm_execute_statement(
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\orm\context.py", line 320, in orm_execute_statement
    result = conn.execute(
             ^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1463, in execute
    return meth(
           ^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\sql\elements.py", line 533, in _execute_on_connection
    return connection._execute_clauseelement(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1683, in _execute_clauseelement
    ret = self._execute_context(
          ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1837, in _execute_context
    return self._exec_single_context(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1977, in _exec_single_context
    self._handle_dbapi_exception(
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 2347, in _handle_dbapi_exception
    raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1958, in _exec_single_context
    self.dialect.do_execute(
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\default.py", line 1192, in do_execute
    cursor.execute(statement, parameters)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\psycopg\cursor.py", line 117, in execute
    raise ex.with_traceback(None)
sqlalchemy.exc.ProgrammingError: (psycopg.errors.UndefinedColumn) column courses.level does not exist
LINE 1: ...courses.title, courses.instructor, courses.price, courses.le...
                                                             ^
[SQL: SELECT courses.id, courses.title, courses.instructor, courses.price, courses.level 
FROM courses]
(Background on this error at: https://sqlalche.me/e/21/f405)
```

**1. 증상**
서버는 정상적으로 다시 켜졌지만, `/orm/courses`를 호출하자 브라우저에 `Internal Server Error`가 뜨고 터미널에 `UndefinedColumn` 에러가 찍혔다.

**2. 내 가설**
서버는 잘 뜨고 `/orm/courses`를 호출할 때 에러가 날 것이다. 해당 부분은 DB로 보내는 문장이기 때문이다.

**3. 확인 방법**
에러 맨 아래 두 부분을 나눠 읽었다. `UndefinedColumn ... does not exist` 줄은 DB가 "그런 컬럼은 없다"고 한 말이고, `[SQL: ...]` 줄은 ORM이 클래스를 보고 만들어 보낸 문장이다.

**4. 진짜 원인**
클래스에는 `level` 컬럼이 있지만 실제 테이블에는 없어서, 둘이 서로 맞지 않았다.

**5. 해결**
기준은 실제 테이블이고 `level`은 잘못 들어간 줄이었으므로, 클래스에서 `level` 줄을 지웠다.

**6. 배운 원리**
클래스는 자기 속성 이름의 오타(예: `Course.titel`)는 다 잡아 주지만, 클래스에 적힌 속성이 실제 테이블에 없는 경우까지는 잡지 못한다.

---

### TS-003. 가상환경을 활성화하지 않아 uvicorn 명령을 찾지 못함
- 날짜: 2026-10-27
- 단계: Phase 1 · SQLAlchemy ORM 전환 (서버 실행)
- 원인 영역: 환경
- 관련 파일·커밋: `backend/.venv` (Git Bash에서 `uvicorn main:app --reload` 실행)

**에러 메시지 원문**
```
bash: uvicorn: command not found
```

**1. 증상**
Git Bash에서 `uvicorn main:app --reload`를 실행하자 `bash: uvicorn: command not found`가 나왔다.

**2. 내 가설**
터미널이 uvicorn 프로그램이 어디에 설치되어 있는지 모르는 것 같다. (환경)

**3. 확인 방법**
`ls .venv/Scripts`로 확인해 보니 목록에 `uvicorn.exe`가 있었다. 설치는 제대로 되어 있었다.

**4. 진짜 원인**
가상환경을 활성화(activate)하지 않아서, 터미널이 `.venv/Scripts` 안의 uvicorn을 찾지 못했다.

**5. 해결**
`source .venv/Scripts/activate`로 가상환경을 켠 뒤 `uvicorn main:app --reload`를 실행했다. (또는 `uv run uvicorn main:app --reload`)

**6. 배운 원리**
`command not found`가 나오면 먼저 가상환경이 켜져 있는지, 인터프리터가 제대로 적용되어 있는지 확인한다.

---

### TS-002. GENERATED ALWAYS 칸인 id에 값을 직접 넣어 INSERT 실패
- 날짜: 2026-10-23
- 단계: Phase 1 · FastAPI와 DB 연결 (고장 실험)
- 원인 영역: 백엔드
- 관련 파일·커밋: `backend/db_test.py` (`INSERT INTO courses (id, title, instructor, price) VALUES (99, '고장실험', '나', 0);`)

**에러 메시지 원문**
```
Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1958, in _exec_single_context
    self.dialect.do_execute(
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\default.py", line 1192, in do_execute
    cursor.execute(statement, parameters)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\psycopg\cursor.py", line 117, in execute
    raise ex.with_traceback(None)
psycopg.errors.GeneratedAlways: cannot insert a non-DEFAULT value into column "id"
DETAIL:  Column "id" is an identity column defined as GENERATED ALWAYS.
HINT:  Use OVERRIDING SYSTEM VALUE to override.

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "C:\back_prac\mini-inflearn\backend\db_test.py", line 7, in <module>
    conn.execute(text(
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1463, in execute
    return meth(
           ^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\sql\elements.py", line 533, in _execute_on_connection
    return connection._execute_clauseelement(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1683, in _execute_clauseelement
    ret = self._execute_context(
          ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1837, in _execute_context
    return self._exec_single_context(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1977, in _exec_single_context
    self._handle_dbapi_exception(
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 2347, in _handle_dbapi_exception
    raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1958, in _exec_single_context
    self.dialect.do_execute(
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\sqlalchemy\engine\default.py", line 1192, in do_execute
    cursor.execute(statement, parameters)
  File "C:\back_prac\mini-inflearn\backend\.venv\Lib\site-packages\psycopg\cursor.py", line 117, in execute
    raise ex.with_traceback(None)
sqlalchemy.exc.ProgrammingError: (psycopg.errors.GeneratedAlways) cannot insert a non-DEFAULT value into column "id"
DETAIL:  Column "id" is an identity column defined as GENERATED ALWAYS.
HINT:  Use OVERRIDING SYSTEM VALUE to override.
[SQL: INSERT INTO courses (id, title, instructor, price) VALUES (99, '고장실험', '나', 0);]
(Background on this error at: https://sqlalche.me/e/21/f405)
```

**1. 증상**
기본값으로 채워지는 칸에 값을 직접 넣으려고 했다.
⚠️ 코치 정정: 단순 기본값(DEFAULT) 칸이었다면 직접 넣어도 된다. id는 `GENERATED ALWAYS AS IDENTITY`, 즉 항상 DB가 직접 만드는 칸이라 직접 넣은 값이 거부됐다.

**2. 내 가설**
백엔드. 넣을 수 없는 값을 넣으려고 했기 때문이다.

**3. 확인 방법**
psql에 접속해서 `\d courses`를 친다 (`docker compose exec db psql -U postgres`) → id 줄 Default 칸에 `generated always as identity` 확인

**4. 진짜 원인**
id 칸은 DB가 직접 값을 정하도록 정의돼 있는데, 코드에서 값을 정하려고 했다.

**5. 해결**
A. id를 빼고 DB에 맡긴다 (`INSERT INTO courses (title, instructor, price) VALUES (...)`)

**6. 배운 원리**
DB가 자동으로 정하는 값은 건드리지 말자.

---

### TS-001. NULL 행이 남은 상태에서 NOT NULL 제약 추가 실패
- 날짜: 2026-10-21
- 단계: Phase 1 · SQL로 courses 테이블 만들기 (고장 실험)
- 원인 영역: DB
- 관련 파일·커밋: psql에서 직접 실행 (`ALTER TABLE courses ALTER COLUMN title SET NOT NULL;`)

**에러 메시지 원문**
```
ERROR:  column "title" of relation "courses" contains null values
```

**1. 증상**
`column "title" of relation "courses" contains null values` 에러가 보였다.

**2. 내 가설**
기존 NULL 행은 상관없을 거라고 생각했다.

**3. 확인 방법**
(가) ALTER부터 일부러 실행해 봤다.

**4. 진짜 원인**
데이터 무결성 문제다. 제목이 없는 데이터가 있어서, 타입을 정해 두었는데도 응답 데이터가 다르게 와서 문제가 생긴다.
⚠️ 코치 정정: 뒤 문장은 제약을 허용했을 때 생길 결과이고, 에러의 직접 원인은 "title이 NULL인 4번 행이 이미 있는 상태에서 NOT NULL을 걸려고 했기 때문"이다.

**5. 해결**
DELETE로 4번 행을 먼저 지우고 ALTER 실행

**6. 배운 원리**
데이터 무결성을 지키려면, 제약 조건을 걸 때 기존 데이터도 그 조건에 맞는지 항상 확인해야 한다.

---
