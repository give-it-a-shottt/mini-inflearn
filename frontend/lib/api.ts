// frontend/lib/api.ts — FastAPI 주소와 호출 함수를 한곳에서 관리한다.
// 값은 .env.local(내 컴퓨터) 또는 Vercel 설정 화면(배포)에서 들어온다.
// NEXT_PUBLIC_ 이 붙은 값은 브라우저 JS에도 박혀서 누구나 볼 수 있다 → 비밀번호는 절대 넣지 않는다.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type Me = {
  id: number;
  name: string;
  points: number;
  enrolled_course_ids: number[];
};

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

// "Authorization: Bearer <토큰>" 헤더. 서버는 이 헤더로 "누가 보낸 요청인지"를 안다.
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// POST /login — 이메일·비밀번호가 맞으면 JWT를 받아 저장한다.
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.detail ?? `로그인 실패: ${res.status}`);
  saveToken(body.access_token);
}

// GET /me — 내 포인트와 신청한 강의 목록 (토큰이 없거나 틀리면 401)
export async function fetchMe(): Promise<Me> {
  const res = await fetch(`${API_BASE_URL}/me`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("로그인이 필요해요");
  if (!res.ok) throw new Error(`내 정보 실패: ${res.status}`);
  return res.json();
}

// POST /enrollments — 수강신청. 실패하면 FastAPI가 보낸 detail 문구를 에러 메시지로 쓴다.
export async function enroll(courseId: number) {
  const res = await fetch(`${API_BASE_URL}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ course_id: courseId }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.detail ?? `신청 실패: ${res.status}`);
  return body as { id: number; course_id: number; points_left: number };
}
