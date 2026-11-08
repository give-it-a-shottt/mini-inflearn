import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import { Breadcrumb, Page } from "../components/tl/Layout";
import { fetchCourses, type Course } from "../lib/api";
import { COURSE_TABS, courseMeta, matchesQuery, matchesTab, points, rating, type CourseTab } from "../lib/courseMeta";
import { useMe } from "../lib/hooks";

function readTab(value: unknown): CourseTab {
  return COURSE_TABS.some(({ id }) => id === value) ? (value as CourseTab) : "all";
}

// 강의 목록은 SSR: 서버(Next)가 FastAPI에서 강의를 받아 HTML에 담아 보낸다.
// 탭(?tab=)과 검색어(?q=)도 주소에 두어서, 링크를 공유하면 같은 화면이 열린다.
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const courses = await fetchCourses();
  const tab = readTab(context.query.tab);
  const query = typeof context.query.q === "string" ? context.query.q : "";
  return { props: { courses, tab, query } };
}

interface Props {
  courses: Course[];
  tab: CourseTab;
  query: string;
}

// 02 강의 목록 — 분야 탭 · 4칸 카드 그리드(모바일은 가로 한 줄 카드) · 수강 중 배지 · 포인트 안내
export default function Courses({ courses, tab, query }: Props) {
  // '수강 중' 배지는 로그인한 사람마다 달라서 브라우저에서 /me로 따로 받는다(CSR)
  const me = useMe();
  const enrolled = new Set(me.data?.enrolled_course_ids ?? []);
  const shown = courses.filter((course) => matchesTab(course, tab) && matchesQuery(course, query));
  const tabHref = (id: CourseTab) => ({
    pathname: "/courses",
    query: { ...(id === "all" ? {} : { tab: id }), ...(query ? { q: query } : {}) },
  });

  return (
    <Page>
      <Head>
        <title>강의 목록 | TechLearn</title>
      </Head>
      <main className="mx-auto flex w-full max-w-284 flex-1 flex-col gap-6 px-4 pt-6 pb-20 sm:pt-8">
        <Breadcrumb items={[{ label: "홈", href: "/" }, { label: "강의 목록" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2">
              <span lang="en" className="rounded-tl-tag bg-tl px-2 py-0.5 text-11 font-semibold text-white">
                ALL COURSES
              </span>
              <span className="text-13 text-tl-muted" aria-live="polite">
                총 {shown.length}개 강의
              </span>
            </p>
            <h1 className="text-24 font-semibold sm:text-32">{query ? `'${query}' 검색 결과` : "전체 강의"}</h1>
          </div>
          <nav aria-label="분야" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <ul className="flex gap-1">
              {COURSE_TABS.map(({ id, label }) => (
                <li key={id} className="shrink-0">
                  <Link
                    href={tabHref(id)}
                    aria-current={tab === id ? "page" : undefined}
                    className={`block rounded-xs px-3 py-1.5 text-13 font-medium ${tab === id ? "bg-tl-ink text-white" : "bg-tl-chip text-tl-ink hover:bg-tl-line"}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {shown.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4">
            {shown.map((course) => (
              <li key={course.id}>
                <CourseListCard course={course} enrolled={enrolled.has(course.id)} />
              </li>
            ))}
          </ul>
        ) : (
          // 02-1 빈 상태
          <div className="flex flex-col items-center gap-3 rounded-sm bg-white px-6 py-16 text-center">
            <p className="text-16 font-semibold">조건에 맞는 강의가 없어요</p>
            <p className="text-13 text-tl-muted">다른 검색어나 분야를 골라 보세요.</p>
            <Link href="/courses" className="rounded-xs bg-tl px-4 py-2 text-13 font-medium text-white hover:bg-tl/90">
              전체 강의 보기
            </Link>
          </div>
        )}

        <p className="flex items-start gap-2 rounded-xs bg-tl-bg px-4 py-3 text-13 break-keep text-tl-body">
          <img src="/tl/icon-info.svg" alt="" width={16} height={16} className="mt-0.5 shrink-0" />
          강의는 포인트로 신청해요. 신청한 강의는 카드에 &apos;수강 중&apos; 배지가 붙어요.
        </p>
      </main>
    </Page>
  );
}

// 강의 카드 — PC 는 위 썸네일 세로 카드, 모바일은 왼쪽 썸네일 가로 카드.
// 수강 중이면 썸네일 라벨과 가격 왼쪽 글자가 네이비 '수강 중'으로 바뀐다. 무료는 가격 자리에 '무료'.
function CourseListCard({ course, enrolled }: { course: Course; enrolled: boolean }) {
  const meta = courseMeta(course.id);
  const free = course.price === 0;
  return (
    <article className="group relative flex h-full overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:flex-col">
      <div className="relative w-24 shrink-0 self-start overflow-hidden bg-tl-chip max-sm:m-3 max-sm:aspect-video max-sm:rounded-xs sm:h-[153px] sm:w-full">
        <img src={meta.thumbnail} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        <span
          className={`absolute bottom-1 left-1 rounded-tl-tag px-1.5 py-px text-11 font-medium text-white backdrop-blur-[4px] sm:bottom-2.5 sm:left-2.5 sm:px-2 sm:py-0.5 ${enrolled ? "bg-tl" : "bg-tl-dark/85"}`}
        >
          {enrolled ? "수강 중" : meta.level}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-3 pr-3 sm:p-4">
        <p className="flex flex-wrap gap-1.5 pb-1.5 sm:pb-2">
          {meta.tags.map((tag) => (
            <span key={tag} lang="en" className="rounded-tl-tag bg-tl-chip px-2 py-0.5 text-12 text-tl-sub">
              {tag}
            </span>
          ))}
        </p>
        <h2 className="mb-1 truncate text-15 font-semibold text-tl-ink sm:mb-2 sm:line-clamp-2 sm:text-18 sm:whitespace-normal">
          {/* 카드 전체를 누르는 링크 */}
          <Link href={`/courses/${course.id}`} className="after:absolute after:inset-0 group-hover:text-tl">
            {course.title}
          </Link>
        </h2>
        <p className="text-12 text-tl-sub sm:mb-4 sm:text-13">멘토 {course.instructor}</p>
        <div className="mt-auto flex items-end justify-between gap-2 sm:-mx-4 sm:flex-col sm:items-stretch sm:gap-1 sm:bg-tl-bg/40 sm:px-4 sm:py-2">
          <p className="flex items-center gap-1 text-11 font-semibold">
            <img src="/tl/icon-star.svg" alt="" width={13.33} height={12.67} />
            <span className="text-tl-ink">{rating(meta.rating)}</span>
            <span className="text-tl-weak">
              (<span className="sm:hidden">{meta.students.toLocaleString("ko-KR")}</span>
              <span className="hidden sm:inline">{meta.students.toLocaleString("ko-KR")}명 수강</span>)
            </span>
          </p>
          <div className="flex items-end justify-between sm:min-h-[45px]">
            {enrolled ? (
              <span className="hidden pb-5 text-15 font-semibold text-tl sm:block">수강 중</span>
            ) : (
              !free && <span className="hidden pb-5 text-15 font-semibold text-tl-muted sm:block">포인트 결제</span>
            )}
            <span className={`ml-auto text-16 font-semibold sm:pt-4 sm:text-18 ${free ? "text-tl" : "text-tl-ink"}`}>
              {free ? "무료" : points(course.price)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
