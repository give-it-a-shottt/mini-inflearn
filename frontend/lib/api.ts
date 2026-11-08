// frontend/lib/api.ts — FastAPI 주소를 한곳에서 관리한다.
// 값은 .env.local(내 컴퓨터) 또는 Vercel 설정 화면(배포)에서 들어온다.
// NEXT_PUBLIC_ 이 붙은 값은 브라우저 JS에도 박혀서 누구나 볼 수 있다 → 비밀번호는 절대 넣지 않는다.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
