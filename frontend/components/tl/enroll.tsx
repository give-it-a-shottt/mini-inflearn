import { useEffect, useRef } from "react";
import type { Course } from "../../lib/api";
import { courseMeta, points } from "../../lib/courseMeta";
import type { Toast } from "../../lib/hooks";

// 수강신청 확인 모달과 응답 토스트 — 상태는 lib/hooks.ts 의 useEnroll 이 들고 있다.

interface EnrollModalProps {
  course: Course;
  myPoints: number;
  /** 신청 후 잔여 · 모자란 포인트 — useEnroll 이 계산한 값을 그대로 받는다 */
  remaining: number;
  shortBy: number;
  onCancel: () => void;
  onConfirm: () => void;
}

// 03-2 / 03-3 수강신청 확인 모달 — 기본 · 포인트 부족 · 무료 3상태.
// 포인트가 부족하면 '신청하기'를 막는다(시안 03-3). 그래도 최종 판단은 서버가 한다(400).
export function EnrollModal({ course, myPoints, remaining, shortBy, onCancel, onConfirm }: EnrollModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const meta = courseMeta(course.id);
  const free = course.price === 0;
  const short = shortBy > 0;

  // showModal 로 열어야 배경이 막히고 Esc · 포커스 가두기를 브라우저가 해 준다.
  // 열 때 주 버튼에 포커스를 두고, 닫히면 모달을 연 버튼으로 포커스를 돌려준다.
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    primaryRef.current?.focus();
    return () => {
      dialog?.close();
      opener?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="tl-enroll-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="m-auto w-[calc(100%-32px)] max-w-110 rounded-sm bg-white p-6 text-tl-ink shadow-[0_25px_50px_rgba(0,0,0,0.25)] backdrop:bg-tl-ink/50 sm:p-8"
    >
      <div className="flex items-center justify-between">
        <h2 id="tl-enroll-title" className="text-20 font-semibold">
          수강신청 확인
        </h2>
        <button type="button" onClick={onCancel} aria-label="닫기" className="rounded-xs p-0.5 hover:bg-tl-chip">
          <img src="/tl/icon-x.svg" alt="" width={20} height={20} />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <img src={meta.cover ?? meta.thumbnail} alt="" className="h-[54px] w-24 shrink-0 rounded-xs object-cover" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="flex gap-1">
            {meta.tags[0] && (
              <span lang="en" className="rounded-tl-tag bg-tl-chip px-2 py-0.5 text-12 text-tl-body">
                {meta.tags[0]}
              </span>
            )}
            {free && (
              <span lang="en" className="rounded-tl-tag bg-tl px-2 py-0.5 text-11 font-semibold text-white">
                FREE
              </span>
            )}
          </p>
          <p className="text-15 font-medium break-keep">{course.title}</p>
        </div>
      </div>

      <dl className="mt-5 flex flex-col gap-2.5 rounded-xs bg-tl-bg p-4 text-13">
        <div className="flex justify-between text-tl-body">
          <dt>보유 포인트</dt>
          <dd className="font-medium">{points(myPoints)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-tl-body">차감 포인트</dt>
          <dd className={`font-medium ${free ? "text-tl" : "text-tl-ink"}`}>{free ? "무료 (0 P)" : `- ${points(course.price)}`}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-tl-chip pt-2.5 font-semibold">
          <dt>신청 후 잔여 포인트</dt>
          <dd className={`text-18 ${short ? "text-tl-sale" : "text-tl"}`}>{points(remaining)}</dd>
        </div>
      </dl>

      {short && (
        <p role="alert" className="mt-3 flex items-center gap-2 rounded-xs bg-status-error-soft px-4 py-2.5 text-13 break-keep text-tl-sale">
          <img src="/tl/toast-error.svg" alt="" width={16} height={16} className="shrink-0 rounded-full bg-tl-sale" />
          포인트가 {points(shortBy)} 부족해요. 무료 강의나 더 저렴한 강의를 둘러보세요.
        </p>
      )}
      {free && <p className="mt-3 text-12 text-tl-muted">무료 강의예요. 포인트가 차감되지 않아요.</p>}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-12 w-31 shrink-0 rounded-xs border border-tl-chip bg-white text-15 font-semibold hover:bg-tl-bg"
        >
          취소
        </button>
        <button
          ref={primaryRef}
          type="button"
          onClick={() => !short && onConfirm()}
          aria-disabled={short}
          className="h-12 flex-1 rounded-xs bg-tl text-15 font-semibold text-white shadow-[0_4px_6px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] hover:bg-tl/90 aria-disabled:cursor-not-allowed aria-disabled:bg-tl-chip aria-disabled:text-disabled aria-disabled:shadow-none"
        >
          {short ? "포인트가 부족해요" : "신청하기"}
        </button>
      </div>
    </dialog>
  );
}

const TOAST_STYLE = {
  success: { bg: "bg-tl-ink", icon: "/tl/toast-check.svg" },
  warning: { bg: "bg-tl-ink", icon: "/tl/toast-alert.svg" },
  error: { bg: "bg-tl-sale", icon: "/tl/toast-error.svg" },
} satisfies Record<Toast["tone"], { bg: string; icon: string }>;

const TOAST_MS = 3500;

/** 화면 아래 가운데에 잠깐 뜨는 서버 응답 알림. 모바일은 하단 신청 바 위로 띄운다 */
export function EnrollToast({ toast, onDone }: { toast: Toast | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(onDone, TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast, onDone]);

  return (
    <div
      role={toast?.tone === "success" ? "status" : "alert"}
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 lg:bottom-8"
    >
      {toast && (
        <p
          className={`pointer-events-auto flex items-center gap-2.5 rounded-sm px-4 py-3 text-14 font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${TOAST_STYLE[toast.tone].bg}`}
        >
          <img src={TOAST_STYLE[toast.tone].icon} alt="" width={18} height={18} />
          {toast.message}
        </p>
      )}
    </div>
  );
}
