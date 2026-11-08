import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { clearToken, login } from "../lib/api";

// 로그인 화면: 성공하면 JWT가 localStorage에 저장되고, 이후 요청에 자동으로 붙는다.
// 테스트 계정: test@example.com / test1234
export default function Login() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      // 사람이 바뀌었으니 이전 사람의 "me" 캐시는 버린다.
      queryClient.removeQueries({ queryKey: ["me"] });
      router.push("/courses");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleLogout() {
    clearToken();
    queryClient.removeQueries({ queryKey: ["me"] });
    setError("로그아웃했어요");
  }

  return (
    <>
      <p><Link href="/courses">← 강의 목록</Link></p>
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" />
        </p>
        <p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" />
        </p>
        <button type="submit">로그인</button>{" "}
        <button type="button" onClick={handleLogout}>로그아웃</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </>
  );
}
