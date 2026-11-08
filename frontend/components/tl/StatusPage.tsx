import Head from "next/head";
import { Page } from "./Layout";

// 10 · 11 — 404 · 500 안내 화면 공통 틀. 아이콘 칸 · 상태 배지 · 제목 · 설명 · 버튼.
export function StatusPage({
  icon,
  badge,
  title,
  description,
  children,
}: {
  icon: string;
  badge: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Page>
      <Head>
        <title>{`${title} | TechLearn`}</title>
      </Head>
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-20 text-center">
        <span className="flex size-18 items-center justify-center rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <img src={icon} alt="" width={32} height={32} />
        </span>
        <p lang="en" className="mt-6 rounded-tl-tag bg-tl px-2 py-0.5 text-11 font-semibold text-white">
          {badge}
        </p>
        <h1 className="mt-3 text-24 font-semibold break-keep sm:text-32">{title}</h1>
        <p className="mt-3 text-14 break-keep text-tl-body sm:text-16">{description}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">{children}</div>
      </main>
    </Page>
  );
}

export const primaryButton =
  "flex h-12 items-center justify-center rounded-xs bg-tl px-5 text-15 font-semibold text-white shadow-[0_4px_6px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] hover:bg-tl/90";
export const secondaryButton =
  "flex h-12 items-center justify-center rounded-xs border border-tl-chip bg-white px-5 text-15 font-semibold text-tl-ink hover:bg-tl-bg";
