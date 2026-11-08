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

// GET /me — 내 포인트와 신청한 강의 목록
export async function fetchMe(): Promise<Me> {
  const res = await fetch(`${API_BASE_URL}/me`);
  if (!res.ok) throw new Error(`내 정보 실패: ${res.status}`);
  return res.json();
}

// POST /enrollments — 수강신청. 실패하면 FastAPI가 보낸 detail 문구를 에러 메시지로 쓴다.
export async function enroll(courseId: number) {
  const res = await fetch(`${API_BASE_URL}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course_id: courseId }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.detail ?? `신청 실패: ${res.status}`);
  return body as { id: number; course_id: number; points_left: number };
}
