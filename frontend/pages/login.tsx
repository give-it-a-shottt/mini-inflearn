import { useState } from "react";
import {
  AuthCard,
  Field,
  FormError,
  PasswordField,
  SubmitButton,
  SwitchLink,
  TEST_ACCOUNT,
  TestAccountBanner,
  useAuthSubmit,
  useNextPath,
} from "../components/tl/AuthCard";
import { login } from "../lib/api";

// 06 로그인 — 성공하면 JWT가 localStorage에 저장되고, 이후 요청에 자동으로 붙는다.
// ?next=/courses/3 처럼 오면 로그인 뒤 그 강의로 돌아간다.
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { submit, error, pending } = useAuthSubmit(() => login(email, password));
  const next = useNextPath();

  return (
    <AuthCard
      pageTitle="로그인"
      title="성장을 돕는 TechLearn에 오신 것을 환영합니다"
      description="로그인하고 내 포인트와 수강 중인 강의를 바로 확인하세요."
      footer={
        <>
          <p className="text-tl-sub">아직 TechLearn 회원이 아니신가요?</p>
          <SwitchLink href={`/signup?next=${encodeURIComponent(next)}`}>30초 만에 간편 회원가입하기</SwitchLink>
        </>
      }
    >
      <TestAccountBanner
        onUse={() => {
          setEmail(TEST_ACCOUNT.email);
          setPassword(TEST_ACCOUNT.password);
        }}
      />
      <form onSubmit={submit} className="flex flex-col gap-4">
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
        <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
        <FormError message={error} />
        <SubmitButton pending={pending}>로그인</SubmitButton>
      </form>
    </AuthCard>
  );
}
