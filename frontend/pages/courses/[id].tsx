import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EnrollModal, EnrollToast } from "../../components/tl/enroll";
import { Breadcrumb, Page } from "../../components/tl/Layout";
import { fetchCourse, type Course } from "../../lib/api";
import { AREA_LABEL, courseMeta, lessonCount, points, rating, totalLength, type CourseMeta } from "../../lib/courseMeta";
import { useEnroll, type EnrollState } from "../../lib/hooks";

// 강의 정보는 SSR: 서버에서 미리 받아 HTML에 담아 보낸다. 없는 강의면 404 페이지(pages/404.tsx).
// 서버가 5xx를 주면 fetchCourse가 던지고, Next가 500 페이지(pages/500.tsx)를 보여 준다.
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const course = await fetchCourse(String(context.params?.id));
  if (!course) return { notFound: true };
  return { props: { course } };
}

// 03 강의 상세 — 왼쪽 본문(요약 · 소개 · 커리큘럼), 오른쪽 따라오는 수강신청 카드.
// 모바일은 카드 대신 위에 썸네일 · 포인트 요약, 화면 아래에 붙는 신청 바를 둔다.
// 강의가 바뀌면 신청 상태(모달 · 토스트)를 새로 시작하도록 key를 준다.
export default function CourseDetailPage({ course }: { course: Course }) {
  return <CourseDetail key={course.id} course={course} />;
}

function CourseDetail({ course }: { course: Course }) {
  const enroll = useEnroll(course);
  const meta = courseMeta(course.id);
  const curriculumMeta = `${meta.curriculum.length}개 섹션 · ${lessonCount(meta)}강`;

  return (
    // 모바일은 아래 고정 신청 바 높이만큼 끝을 띄워 푸터 안내가 가려지지 않게 한다
    <Page className="bg-tl-bg-alt max-lg:pb-24">
      <Head>
        <title>{`${course.title} | TechLearn`}</title>
      </Head>
      <main className="mx-auto flex w-full max-w-284 flex-1 gap-8 px-4 pt-6 pb-20 sm:pt-8">
        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-6">
          <Breadcrumb
            items={[
              { label: "강의 목록", href: "/courses" },
              { label: AREA_LABEL[course.area] ?? AREA_LABEL.etc, href: course.area === "etc" ? undefined : `/courses?tab=${course.area}` },
            ]}
          />

          {/* 모바일 — 카드 대신 맨 위에 큰 썸네일 */}
          <img src={meta.cover ?? meta.thumbnail} alt="" className="aspect-video w-full rounded-sm object-cover lg:hidden" />

          <section aria-labelledby="tl-lecture-title" className="rounded-sm bg-tl-bg p-5 sm:p-8">
            <p className="flex flex-wrap gap-1.5">
              {meta.isNew && (
                <span lang="en" className="rounded-tl-tag bg-tl px-2 py-0.5 text-11 font-semibold text-white">
                  NEW
                </span>
              )}
              {[...meta.tags, meta.level].map((chip) => (
                <span key={chip} className="rounded-tl-tag bg-white px-2 py-0.5 text-12 text-tl-body">
                  {chip}
                </span>
              ))}
            </p>
            <h1 id="tl-lecture-title" className="mt-3 text-22 font-semibold break-keep sm:text-32">
              {course.title}
            </h1>
            <p className="mt-3 text-14 break-keep text-tl-body sm:text-15">{meta.summary}</p>
            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-13 text-tl-body">
              <span className="flex items-center gap-1">
                <img src="/tl/icon-star-14.svg" alt="" width={14} height={14} />
                <span className="font-semibold text-tl-ink">{rating(meta.rating)}</span>
                <span className="text-tl-muted">({meta.students.toLocaleString("ko-KR")}명 수강)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <img src="/tl/icon-user-14.svg" alt="" width={14} height={14} />
                멘토 {course.instructor}
              </span>
              <span className="flex items-center gap-1.5">
                <img src="/tl/icon-list.svg" alt="" width={14} height={14} />
                {curriculumMeta}
              </span>
            </p>
          </section>

          {/* 모바일 — 포인트 요약 (PC 는 오른쪽 카드에 있다) */}
          <MobilePoints enroll={enroll} curriculumMeta={curriculumMeta} />

          <section aria-labelledby="tl-intro-title" className="flex flex-col gap-3 rounded-sm bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-6">
            <h2 id="tl-intro-title" className="text-20 font-semibold">
              강의 소개
            </h2>
            <p className="text-14 break-keep text-tl-body">{meta.intro}</p>
            <div className="flex flex-col gap-2 rounded-xs bg-tl-bg p-4">
              <h3 className="text-14 font-semibold">이런 걸 배워요</h3>
              <ul className="flex flex-col gap-2">
                {meta.learn.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-14 break-keep text-tl-body">
                    <img src="/tl/icon-checkc.svg" alt="" width={16} height={16} className="mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Curriculum meta={meta} summary={`${curriculumMeta} · 총 ${totalLength(meta)}`} />
        </div>

        <aside aria-label="수강신청" className="hidden w-90 shrink-0 pt-[37px] lg:block">
          <div className="sticky top-24">
            <EnrollCard course={course} meta={meta} enroll={enroll} curriculumMeta={curriculumMeta} />
          </div>
        </aside>
      </main>

      <MobileEnrollBar course={course} enroll={enroll} />

      {enroll.confirming && (
        <EnrollModal
          course={course}
          myPoints={enroll.myPoints}
          remaining={enroll.remaining}
          shortBy={enroll.shortBy}
          onCancel={enroll.cancel}
          onConfirm={enroll.submit}
        />
      )}
      <EnrollToast toast={enroll.toast} onDone={enroll.clearToast} />
    </Page>
  );
}

type Enroll = ReturnType<typeof useEnroll>;

// 버튼 문구 — 시안 03-1의 4상태(신청 가능 · 신청 중 · 수강 중 · 포인트 부족) + 로그인 전 · 확인 중
const BUTTON_LABEL: Record<EnrollState, string> = {
  loading: "내 정보 확인 중...",
  login: "로그인하고 수강신청",
  available: "수강신청 하기",
  pending: "신청 처리 중...",
  enrolled: "수강 중인 강의입니다",
  short: "수강신청 하기",
};

const PRIMARY = "bg-tl text-white shadow-[0_4px_6px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] hover:bg-tl/90";
const BUTTON_STYLE: Record<EnrollState, string> = {
  loading: "bg-tl-chip text-disabled",
  login: PRIMARY,
  available: PRIMARY,
  pending: "bg-tl/80 text-white",
  enrolled: "bg-tl-chip text-disabled",
  short: PRIMARY,
};

function EnrollButton({ course, enroll, className = "" }: { course: Course; enroll: Enroll; className?: string }) {
  const { state } = enroll;
  const base = `flex h-12 items-center justify-center gap-2 rounded-xs text-15 font-semibold ${BUTTON_STYLE[state]} ${className}`;
  // 로그인 전이면 로그인 화면으로 보내고, 로그인하면 이 강의로 돌아오게 한다
  if (state === "login")
    return (
      <Link href={{ pathname: "/login", query: { next: `/courses/${course.id}` } }} className={base}>
        {BUTTON_LABEL.login}
      </Link>
    );
  return (
    <button
      type="button"
      onClick={enroll.open}
      // 신청 중에는 눌러도 아무 일이 없게 — 중복 요청 방지. 비활성이어도 포커스는 받아 상태를 읽을 수 있게 aria-disabled
      aria-disabled={state === "pending" || state === "enrolled" || state === "loading"}
      aria-busy={state === "pending"}
      className={`${base} aria-disabled:cursor-not-allowed`}
    >
      {state === "pending" && <img src="/tl/icon-loader.svg" alt="" width={18} height={18} className="animate-spin motion-reduce:animate-none" />}
      {BUTTON_LABEL[state]}
    </button>
  );
}

/** 버튼 아래 한 줄 안내 — 상태마다 다르다 */
function EnrollHint({ enroll }: { enroll: Enroll }) {
  const text: Record<EnrollState, string> = {
    loading: "",
    login: "체험용 계정: test@example.com / test1234",
    available: "신청하면 강의 목록에 '수강 중' 배지가 붙어요.",
    pending: "처리 중에는 버튼을 다시 누를 수 없어요.",
    enrolled: "",
    short: `포인트가 ${points(enroll.shortBy)} 부족해요.`,
  };
  if (enroll.state === "enrolled")
    return (
      <Link href="/courses" className="flex items-center justify-center gap-1 text-13 font-semibold text-tl hover:underline">
        다른 강의 둘러보기
        <img src="/tl/icon-chev-navy.svg" alt="" width={12} height={12} />
      </Link>
    );
  if (!text[enroll.state]) return null;
  return (
    <p className={`text-center text-12 break-keep ${enroll.state === "short" ? "font-medium text-tl-sale" : "text-tl-muted"}`}>
      {text[enroll.state]}
    </p>
  );
}

/** 내 포인트 · 신청 후 잔여 (수강 중이면 신청일 · 커리큘럼, 로그인 전이면 안내) */
function PointRows({ enroll, curriculumMeta }: { enroll: Enroll; curriculumMeta: string }) {
  if (enroll.state === "login" || enroll.state === "loading")
    return <p className="text-13 text-tl-body">로그인하면 내 포인트와 신청 후 잔여 포인트를 볼 수 있어요.</p>;
  if (enroll.enrolledAt)
    return (
      <dl className="flex flex-col gap-2 text-13 text-tl-body">
        <div className="flex justify-between">
          <dt>신청일</dt>
          <dd className="font-medium">{enroll.enrolledAt}</dd>
        </div>
        <div className="flex justify-between">
          <dt>커리큘럼</dt>
          <dd className="font-medium">{curriculumMeta}</dd>
        </div>
      </dl>
    );
  return (
    <dl className="flex flex-col gap-2 text-13">
      <div className="flex justify-between">
        <dt className="text-tl-body">내 포인트</dt>
        <dd className="font-medium">{points(enroll.myPoints)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-tl-body">신청 후 잔여</dt>
        <dd className={`font-semibold ${enroll.shortBy > 0 ? "text-tl-sale" : "text-tl"}`}>{points(enroll.remaining)}</dd>
      </div>
    </dl>
  );
}

function Price({ course, enrolled }: { course: Course; enrolled: boolean }) {
  return (
    <div className="flex items-end justify-between">
      <p className="flex flex-col gap-1 font-semibold">
        <span className="text-13 text-tl-muted">수강료</span>
        <span className={`text-28 ${course.price === 0 ? "text-tl" : ""}`}>{course.price === 0 ? "무료" : points(course.price)}</span>
      </p>
      {enrolled && (
        <span lang="en" className="mb-2 rounded-tl-tag bg-tl px-2 py-0.5 text-11 font-semibold text-white">
          ENROLLED
        </span>
      )}
    </div>
  );
}

function EnrollCard({ course, meta, enroll, curriculumMeta }: { course: Course; meta: CourseMeta; enroll: Enroll; curriculumMeta: string }) {
  return (
    <div className="overflow-hidden rounded-sm bg-white shadow-[0_20px_25px_rgba(222,227,232,0.4),0_8px_10px_rgba(222,227,232,0.4)]">
      <img src={meta.cover ?? meta.thumbnail} alt="" className="h-[203px] w-full object-cover" />
      <div className="flex flex-col p-6">
        <Price course={course} enrolled={enroll.state === "enrolled"} />
        <hr className="mt-5 mb-4 border-tl-chip" />
        <PointRows enroll={enroll} curriculumMeta={curriculumMeta} />
        <EnrollButton course={course} enroll={enroll} className="mt-5 w-full" />
        <div className="mt-3">
          <EnrollHint enroll={enroll} />
        </div>
        <p className="mt-4 flex justify-between border-t border-tl-chip pt-3 text-11 text-tl-muted">
          <span className="flex items-center gap-1">
            <img src="/tl/icon-clock.svg" alt="" width={12} height={12} />
            수강 기한: 무제한
          </span>
          <span className="flex items-center gap-1">
            <img src="/tl/icon-award.svg" alt="" width={12} height={12} />
            수료증 발급 가능
          </span>
        </p>
      </div>
    </div>
  );
}

function MobilePoints({ enroll, curriculumMeta }: { enroll: Enroll; curriculumMeta: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-sm bg-tl-bg p-4 lg:hidden">
      <PointRows enroll={enroll} curriculumMeta={curriculumMeta} />
      {(enroll.state === "short" || enroll.state === "login") && <EnrollHint enroll={enroll} />}
    </div>
  );
}

// 모바일 하단 고정 바 — 수강료와 신청 버튼
function MobileEnrollBar({ course, enroll }: { course: Course; enroll: Enroll }) {
  const showRemaining = enroll.state === "available" || enroll.state === "short";
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
      <p className="flex flex-col font-semibold">
        <span className="text-11 text-tl-muted">수강료</span>
        <span className="text-20">{course.price === 0 ? "무료" : points(course.price)}</span>
        {showRemaining && (
          <span className={`text-11 ${enroll.shortBy > 0 ? "text-tl-sale" : "text-tl"}`}>잔여 {points(enroll.remaining)}</span>
        )}
      </p>
      <EnrollButton course={course} enroll={enroll} className="flex-1 px-4" />
    </div>
  );
}

// 커리큘럼 — 섹션마다 접고 펼친다. PC 는 모두 펼친 채로, 모바일은 첫 섹션만 펼친 채로 시작한다.
// 화면 폭은 브라우저에서만 알 수 있어서, 서버 렌더는 "첫 섹션만"으로 그리고 브라우저에서 PC면 모두 편다.
function Curriculum({ meta, summary }: { meta: CourseMeta; summary: string }) {
  const [openAll, setOpenAll] = useState(false);
  useEffect(() => {
    // 화면 폭(브라우저에만 있는 값)에 맞춰 한 번 펼친다 — 서버 렌더와 첫 화면이 같아야 해서 effect에서 한다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenAll(window.matchMedia("(min-width: 1024px)").matches);
  }, []);
  if (meta.curriculum.length === 0) return null;
  return (
    <section aria-labelledby="tl-curriculum-title" className="flex flex-col gap-4 rounded-sm bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="tl-curriculum-title" className="text-20 font-semibold">
          커리큘럼
        </h2>
        <p className="text-13 text-tl-muted">{summary}</p>
      </div>
      {meta.curriculum.map((section, i) => (
        <details key={`${section.title}-${openAll}`} open={openAll || i === 0} className="group/section">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-xs bg-tl-bg px-4 py-2.5 text-14 font-semibold [&::-webkit-details-marker]:hidden">
            섹션 {i + 1}. {section.title}
            <span className="flex items-center gap-1 text-12 font-medium text-tl-muted">
              {section.lessons.length}강
              <img src="/tl/icon-chev-navy.svg" alt="" width={12} height={12} className="rotate-90 transition-transform group-open/section:-rotate-90" />
            </span>
          </summary>
          <ol>
            {section.lessons.map((lesson, j) => (
              <li key={lesson.title} className="flex items-center gap-2.5 border-b border-tl-chip px-4 py-3 last:border-b-0">
                <img src="/tl/icon-play.svg" alt="" width={16} height={16} />
                <span className="flex-1 text-14 text-tl-body">
                  {j + 1}. {lesson.title}
                </span>
                <span className="text-12 text-tl-muted">{lesson.length}</span>
              </li>
            ))}
          </ol>
        </details>
      ))}
    </section>
  );
}
