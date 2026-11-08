import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Logo, Page } from "./Layout";

// 06 간편 로그인 · 06-1 회원가입 카드 — 시안의 이메일 로그인 부분만 옮겼다.
// 카카오 · 구글 · 깃허브 버튼과 쿠폰 배너는 실제로 동작하지 않아서 빼고, 그 자리에 체험용 계정 안내를 둔다.

export const TEST_ACCOUNT = { email: "test@example.com", password: "test1234" };

/** 로그인 뒤 돌아갈 주소 — 우리 사이트 안의 경로(/...)만 받는다. '//다른사이트' 같은 바깥 주소로 튕기지 않게 */
export function useNextPath() {
  const { query } = useRouter();
  const next = typeof query.next === "string" ? query.next : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/courses";
}

/** 제출하면 onSubmit(성공 시 토큰 저장까지)을 부르고, 성공하면 이전 사람의 캐시를 비우고 next로 보낸다 */
export function useAuthSubmit(onSubmit: () => Promise<void>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const next = useNextPath();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    try {
      await onSubmit();
      // 사람이 바뀌었으니 이전 "me" 캐시는 버린다 → 다음 화면이 새 토큰으로 /me를 다시 부른다
      queryClient.removeQueries({ queryKey: ["me"] });
      await router.push(next);
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  };
  return { submit, error, pending };
}

export function AuthCard({
  pageTitle,
  title,
  description,
  children,
  footer,
}: {
  pageTitle: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <Page>
      <Head>
        <title>{`${pageTitle} | TechLearn`}</title>
      </Head>
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-16">
        <div className="relative w-full max-w-115">
          {/* 은은한 네이비 빛 두 덩이 — 장식 */}
          <div aria-hidden="true" className="absolute -top-10 -left-10 size-44 rounded-md bg-tl/10 blur-[32px]" />
          <div aria-hidden="true" className="absolute -right-10 -bottom-10 size-44 rounded-md bg-tl-indigo-soft/15 blur-[32px]" />
          <div className="relative flex flex-col gap-6 rounded-sm bg-white p-6 shadow-[0_20px_25px_-5px_rgba(222,227,233,0.4),0_8px_10px_-6px_rgba(222,227,233,0.4)] sm:p-10">
            <div className="flex flex-col items-center gap-1 text-center">
              <Logo size="lg" />
              <h1 className="pt-1 text-18 font-semibold break-keep">{title}</h1>
              <p className="text-13 break-keep text-tl-sub">{description}</p>
            </div>
            {children}
            <div className="flex flex-col items-center gap-1.5 rounded-xs bg-tl-bg/60 p-4 text-center text-13">{footer}</div>
          </div>
        </div>
      </main>
    </Page>
  );
}

/** 체험용 계정 안내 — 누르면 입력칸을 채운다(시안의 웰컴 쿠폰 배너 자리) */
export function TestAccountBanner({ onUse }: { onUse: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xs bg-tl-bg p-2">
      <p className="flex items-center gap-1 text-11">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-tl/20">
          <img src="/tl/icon-gift.svg" alt="" width={15} height={14.25} />
        </span>
        <span className="font-medium">
          체험용 계정 <span className="font-normal text-tl">{TEST_ACCOUNT.email}</span> / {TEST_ACCOUNT.password}
        </span>
      </p>
      <button type="button" onClick={onUse} className="shrink-0 rounded-md bg-tl px-2 py-0.5 text-[10px] font-medium text-white hover:bg-tl/90">
        채우기
      </button>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  icon: { src: string; width: number; height: number };
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
  autoComplete: string;
  maxLength?: number;
};

/** 아이콘이 왼쪽에 붙은 입력칸 (44 높이, 옅은 파랑 바탕) */
export function Field({ id, label, icon, value, onChange, type = "text", placeholder, autoComplete, maxLength }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-13 font-medium">
        {label}
      </label>
      <div className="relative">
        <img src={icon.src} alt="" width={icon.width} height={icon.height} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2" />
        <input
          id={id}
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className="h-11 w-full rounded-xs bg-tl-bg pr-4 pl-11 text-13 text-tl-ink outline-none placeholder:text-tl-weak focus-visible:ring-2 focus-visible:ring-tl"
        />
      </div>
    </div>
  );
}

/** 비밀번호 입력칸 — 오른쪽 버튼으로 보이기 · 숨기기 */
export function PasswordField({ value, onChange, autoComplete }: { value: string; onChange: (value: string) => void; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="tl-password" className="text-13 font-medium">
        비밀번호
      </label>
      <div className="relative">
        <img src="/tl/icon-lock.svg" alt="" width={13.33} height={17.5} className="pointer-events-none absolute top-1/2 left-[17px] -translate-y-1/2" />
        <input
          id="tl-password"
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="비밀번호"
          autoComplete={autoComplete}
          className="h-11 w-full rounded-xs bg-tl-bg px-11 text-13 text-tl-ink outline-none placeholder:text-tl-weak focus-visible:ring-2 focus-visible:ring-tl"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          aria-pressed={visible}
          className="absolute top-2 right-3 rounded-xs p-1 hover:bg-tl-chip"
        >
          <img src="/tl/icon-eye-off.svg" alt="" width={18.33} height={16.5} />
        </button>
      </div>
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      aria-busy={pending}
      aria-disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-1 rounded-xs bg-tl text-15 font-medium text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-tl/90 aria-disabled:bg-tl/80"
    >
      {pending ? "잠시만요..." : children}
      {!pending && <img src="/tl/icon-arrow-right-login.svg" alt="" width={13.33} height={13.33} />}
    </button>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xs bg-status-error-soft px-4 py-2.5 text-13 break-keep text-tl-sale">
      {message}
    </p>
  );
}

export function SwitchLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-1 font-medium text-tl hover:underline">
      {children}
      <img src="/tl/icon-chev-signup.svg" alt="" width={4.93} height={8} />
    </Link>
  );
}
