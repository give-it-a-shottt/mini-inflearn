import { useState } from "react";
import { AuthCard, Field, FormError, PasswordField, SubmitButton, SwitchLink, useAuthSubmit, useNextPath } from "../components/tl/AuthCard";
import { signup } from "../lib/api";

// 06-1 회원가입 — 가입하면 50,000 P를 받고 바로 로그인된 상태가 된다(서버가 토큰을 같이 준다).
export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { submit, error, pending } = useAuthSubmit(() => signup(name.trim(), email, password));
  const next = useNextPath();

  return (
    <AuthCard
      pageTitle="회원가입"
      title="TechLearn 회원가입"
      description="가입하면 체험용 50,000 P를 드려요. 바로 강의를 신청해 보세요."
      footer={
        <>
          <p className="text-tl-sub">이미 회원이신가요?</p>
          <SwitchLink href={`/login?next=${encodeURIComponent(next)}`}>로그인하기</SwitchLink>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field
          id="tl-name"
          label="이름"
          icon={{ src: "/tl/icon-user-14.svg", width: 14, height: 14 }}
          value={name}
          onChange={setName}
          placeholder="홍길동"
          autoComplete="name"
          maxLength={20}
        />
        <Field
          id="tl-email"
          label="이메일"
          type="email"
          icon={{ src: "/tl/icon-mail.svg", width: 16.67, height: 13.33 }}
          value={email}
          onChange={setEmail}
          placeholder="example@techlearn.io"
          autoComplete="email"
        />
        <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />
        <FormError message={error} />
        <SubmitButton pending={pending}>가입하고 시작하기</SubmitButton>
      </form>
    </AuthCard>
  );
}
