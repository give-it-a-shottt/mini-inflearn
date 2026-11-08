// frontend/lib/api.ts — FastAPI 주소와 호출 함수를 한곳에서 관리한다.
// 값은 .env.local(내 컴퓨터) 또는 Vercel 설정 화면(배포)에서 들어온다.
// NEXT_PUBLIC_ 이 붙은 값은 브라우저 JS에도 박혀서 누구나 볼 수 있다 → 비밀번호는 절대 넣지 않는다.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type CourseArea = "frontend" | "backend" | "database" | "etc";

// GET /orm/courses 응답 한 칸. 썸네일·커리큘럼 같은 보여 주기용 정보는 lib/courseMeta.ts에 있다.
export type Course = {
  id: number;
  title: string;
  instructor: string;
  price: number;
  area: CourseArea;
};

export type Me = {
  id: number;
  name: string;
  points: number;
  enrolled_course_ids: number[];
  enrollments: { course_id: number; enrolled_at: string }[];
};

// 상태 코드를 들고 다니는 에러 — 화면이 400·401·409마다 다른 안내를 띄울 수 있게
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function readError(res: Response, fallback: string) {
  const body = await res.json().catch(() => ({}));
  return new ApiError(res.status, body.detail ?? `${fallback}: ${res.status}`);
}

// ── 서버 깨우기 ─────────────────────────────────────────────────────
// Render 무료 서버와 Neon DB는 쉬면 잠든다. 결과는 쓰지 않고 "툭 건드리기"만 한다.
// 실패해도(잠든 서버가 늦게 답해도) 화면에 영향을 주지 않게 오류를 삼킨다.
export function wakeApi() {
  fetch(`${API_BASE_URL}/health`).catch(() => {});
}

// ── 강의 (getServerSideProps에서 서버가 부른다) ───────────────────────
export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE_URL}/orm/courses`);
  if (!res.ok) throw await readError(res, "강의 목록 실패");
  return res.json();
}

/** 없는 강의면 null — 화면이 404 페이지로 바꾼다 */
export async function fetchCourse(id: string): Promise<Course | null> {
  const res = await fetch(`${API_BASE_URL}/orm/courses/${encodeURIComponent(id)}`);
  if (res.status === 404 || res.status === 422) return null;
  if (!res.ok) throw await readError(res, "강의 상세 실패");
  return res.json();
}

// ── 토큰 보관 ───────────────────────────────────────────────────────
// 로그인하면 서버가 준 JWT를 브라우저 localStorage에 넣어 두고, 요청마다 꺼내 붙인다.
// localStorage는 브라우저에만 있으므로 getServerSideProps(서버)에서는 쓸 수 없다.
const TOKEN_KEY = "access_token";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// "Authorization: Bearer <토큰>" 헤더. 서버는 이 헤더로 "누가 보낸 요청인지"를 안다.
function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function postAuth(path: string, body: object) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await readError(res, "요청 실패");
  const { access_token } = await res.json();
  saveToken(access_token);
}

// POST /login — 이메일·비밀번호가 맞으면 JWT를 받아 저장한다.
export function login(email: string, password: string) {
  return postAuth("/login", { email, password });
}

// POST /signup — 가입하면 바로 로그인된 상태가 된다(서버가 토큰을 같이 준다).
export function signup(name: string, email: string, password: string) {
  return postAuth("/signup", { name, email, password });
}

// GET /me — 내 포인트와 신청한 강의. 로그인 안 했거나 토큰이 만료됐으면 null.
export async function fetchMe(): Promise<Me | null> {
  if (!getToken()) return null;
  const res = await fetch(`${API_BASE_URL}/me`, { headers: authHeaders() });
  if (res.status === 401) {
    clearToken(); // 만료·위조된 토큰은 버린다
    return null;
  }
  if (!res.ok) throw await readError(res, "내 정보 실패");
  return res.json();
}

// POST /enrollments — 수강신청. 실패하면 상태 코드와 FastAPI의 detail을 담은 ApiError를 던진다.
export async function enroll(courseId: number) {
  const res = await fetch(`${API_BASE_URL}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ course_id: courseId }),
  });
  if (!res.ok) throw await readError(res, "신청 실패");
  return (await res.json()) as { id: number; course_id: number; points_left: number };
}
