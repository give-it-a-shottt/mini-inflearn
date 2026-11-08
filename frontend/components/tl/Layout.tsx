import Link from "next/link";
import { useState } from "react";
import { useCourseSearch, useLogout, useMe } from "../../lib/hooks";
import { points } from "../../lib/courseMeta";

// TechLearn 공통 조각 — 로고 · 헤더 · 푸터 · 섹션 머리말 · 위치 표시

export function Logo({ size = "md" }: { size?: "md" | "sm" | "lg" }) {
  const box = { sm: "size-7 text-16 rounded-xs", md: "size-8 text-18 rounded-xs", lg: "size-10 text-20 rounded-sm" }[size];
  const word = { sm: "text-18", md: "text-22", lg: "text-22" }[size];
  return (
    <span className="flex items-center gap-1">
      <span aria-hidden="true" className={`flex items-center justify-center bg-tl font-semibold text-white ${box}`}>
        TL
      </span>
      <span lang="en" className={`font-semibold text-tl-ink ${word}`}>
        Tech<span className="text-tl">Learn</span>
      </span>
    </span>
  );
}

const NAV = [
  { label: "강의 탐색", href: "/courses" },
  { label: "로드맵", href: "/#roadmap" },
  { label: "커뮤니티" },
  { label: "멘토링" },
];

function NavItem({ label, href, className }: { label: string; href?: string; className: string }) {
  return href ? (
    <Link href={href} className={`${className} hover:text-tl`}>
      {label}
    </Link>
  ) : (
    <span aria-disabled="true" className={className}>
      {label}
      <span className="ml-1 text-11 text-tl-weak">준비 중</span>
    </span>
  );
}

/** 헤더 오른쪽 — 로그인했으면 이름 · 포인트 · 로그아웃, 아니면 로그인 링크 */
function Account() {
  const me = useMe();
  const logout = useLogout();
  // 서버 렌더와 첫 화면에서는 아직 모른다 → 자리만 비워 둔다(깜빡임 대신 빈칸)
  if (me.data === undefined) return <span className="h-8 w-20" aria-hidden="true" />;
  if (me.data === null)
    return (
      <Link href="/login" className="flex items-center gap-2 text-13 font-medium text-tl-sub hover:text-tl">
        로그인
        <span className="flex size-8 items-center justify-center rounded-md bg-tl">
          <img src="/tl/icon-user.svg" alt="" width={12} height={12} />
        </span>
      </Link>
    );
  return (
    <div className="flex items-center gap-3">
      <p className="hidden flex-col items-end leading-tight sm:flex">
        <span className="text-13 text-tl-sub">{me.data.name}님</span>
        <span className="text-12 font-semibold text-tl">{points(me.data.points)}</span>
      </p>
      <button type="button" onClick={logout} className="rounded-xs px-2 py-1 text-13 text-tl-sub hover:bg-tl-chip">
        로그아웃
      </button>
    </div>
  );
}

// 64 높이, 흰 반투명 + 블러로 스크롤 중에도 위에 붙는다. 모바일은 로고 · 검색 · 계정 · 메뉴(≡)만 남기고,
// 메뉴를 누르면 헤더 아래로 메뉴 목록이 펼쳐진다(시안 01-M).
// 커뮤니티 · 멘토링은 이번 범위 밖이라 누르지 않는 표시만 둔다. 장바구니는 기능이 없어 뺐다.
export function Header() {
  const { query, setQuery, submit } = useCourseSearch();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header
      className="sticky top-0 z-20 bg-white/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-[6px]"
      onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
    >
      <div className="mx-auto flex h-16 max-w-320 items-center justify-between gap-6 px-4 lg:gap-[75px] lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="TechLearn 홈">
            <Logo />
          </Link>
          <nav aria-label="메뉴" className="hidden items-center gap-6 lg:flex">
            {NAV.map(({ label, href }) => (
              <NavItem key={label} label={label} href={href} className="text-15 text-tl-sub" />
            ))}
          </nav>
        </div>

        <form role="search" onSubmit={submit} className="relative hidden max-w-112 flex-1 md:block">
          <img src="/tl/icon-search-sm.svg" alt="" width={15} height={15} className="pointer-events-none absolute top-[12.5px] left-[14.5px]" />
          <label htmlFor="tl-header-search" className="sr-only">
            강의 검색
          </label>
          <input
            id="tl-header-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="배우고 싶은 기술, 강의 검색..."
            className="h-10 w-full rounded-xs bg-tl-bg pr-4 pl-10 text-13 text-tl-ink outline-none placeholder:text-tl-weak focus-visible:ring-2 focus-visible:ring-tl"
          />
        </form>

        <div className="flex items-center gap-4">
          <Link href="/courses" aria-label="강의 검색" className="p-1 md:hidden">
            <img src="/tl/icon-search-sm.svg" alt="" width={15} height={15} />
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-tl-line sm:block" />
          <Account />
          <button
            type="button"
            aria-label="메뉴"
            aria-expanded={menuOpen}
            aria-controls="tl-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-xs p-0.5 hover:bg-tl-chip lg:hidden"
          >
            <img src="/tl/icon-menu.svg" alt="" width={22} height={22} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="tl-mobile-menu" aria-label="메뉴" className="border-t border-tl-line bg-white px-4 py-2 lg:hidden">
          <ul className="flex flex-col">
            {NAV.map(({ label, href }) => (
              <li key={label}>
                <NavItem label={label} href={href} className="block py-3 text-15 text-tl-sub" />
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

const FOOTER_LINKS = [
  { title: "강의 & 학습", items: ["전체 강의", "추천 로드맵", "무료 강의", "수료증 검증"] },
  { title: "커뮤니티", items: ["질문 & 답변", "기술 블로그", "1:1 멘토링", "스터디 모임"] },
  { title: "고객지원", items: ["자주 묻는 질문", "수강료 환불 규정", "지식공유자 참여", "기업 B2B 교육"] },
];

const SOCIALS = [
  { src: "/tl/social-1.svg", width: 15, height: 12 },
  { src: "/tl/social-2.svg", width: 15, height: 9 },
  { src: "/tl/social-3.svg", width: 15, height: 15 },
];

export function Footer() {
  return (
    <footer className="bg-tl-bg">
      <div className="mx-auto flex max-w-320 flex-col gap-6 p-4 sm:p-8">
        <div className="grid grid-cols-3 gap-6 lg:grid-cols-5">
          <div className="col-span-3 flex flex-col gap-2 lg:col-span-2">
            <Logo size="sm" />
            <p className="max-w-96 text-13 break-keep text-tl-sub">
              개발자 실무 교육부터 취업·이직 커리어 성장까지 함께하는 대한민국 대표 테크 교육 플랫폼입니다.
            </p>
            <div className="flex gap-2 pt-2" aria-hidden="true">
              {SOCIALS.map(({ src, width, height }) => (
                <span key={src} className="flex size-8 items-center justify-center rounded-xs bg-tl-line">
                  <img src={src} alt="" width={width} height={height} />
                </span>
              ))}
            </div>
          </div>
          {FOOTER_LINKS.map(({ title, items }) => (
            <div key={title} className="flex flex-col gap-2">
              <h2 className="text-15 font-medium text-tl-ink">{title}</h2>
              <ul className="flex flex-col gap-1 text-13 text-tl-sub">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 rounded-xs bg-tl-line/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 시안의 회사 정보 자리 — 실제 회사처럼 보이지 않게 학습 프로젝트임을 적는다 */}
          <p className="text-13 break-keep text-tl-sub">
            © 2026 TechLearn — 개인 학습 프로젝트입니다. 포인트는 체험용이며 실제 결제가 이루어지지 않습니다.
          </p>
          <p className="flex gap-4 text-11 text-tl-sub">
            <span>이용약관</span>
            <span className="font-medium text-tl-ink">개인정보처리방침</span>
            <span>운영정책</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

/** 섹션 머리말 — 작은 영문 라벨 + 32 제목 */
export function SectionTitle({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div className="flex flex-col gap-px pt-[3px]">
      <p lang="en" className="text-13 font-semibold text-tl uppercase">
        {eyebrow}
      </p>
      <h2 id={id} className="text-24 font-semibold text-tl-ink sm:text-32">
        {title}
      </h2>
    </div>
  );
}

/** 위치 표시 — '홈 › 강의 목록'. 마지막 칸이 지금 화면이다 */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="현재 위치">
      <ol className="flex items-center gap-1.5 text-13">
        {items.map(({ label, href }, i) => {
          const last = i === items.length - 1;
          return (
            <li key={label} className="flex items-center gap-1.5">
              {i > 0 && <img src="/tl/icon-chev-sm.svg" alt="" width={12} height={12} />}
              {last || !href ? (
                <span aria-current={last ? "page" : undefined} className={last ? "font-medium text-tl-ink" : "text-tl-muted"}>
                  {label}
                </span>
              ) : (
                <Link href={href} className="text-tl-muted hover:text-tl">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** 헤더 · 본문 · 푸터 틀. bg는 화면마다 다른 바탕색 */
export function Page({ children, className = "bg-tl-bg-alt" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-svh flex-col font-sans text-tl-ink ${className}`}>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
