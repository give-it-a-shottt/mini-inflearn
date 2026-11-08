import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { ApiError, clearToken, enroll, fetchMe, type Course } from "./api";
import { formatDate } from "./courseMeta";

/** 로그인한 나. data가 null이면 로그아웃 상태, undefined면 아직 확인 중(첫 렌더 · 서버 렌더) */
export function useMe() {
  // retry: false → 실패를 3번 다시 시도하지 않는다. 401은 fetchMe가 null로 바꿔 준다.
  return useQuery({ queryKey: ["me"], queryFn: fetchMe, retry: false });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    clearToken();
    // 사람이 바뀌었으니 이전 사람의 캐시를 비우고 "로그아웃 상태"로 둔다.
    queryClient.setQueryData(["me"], null);
  };
}

/** 검색어를 받아 강의 목록으로 보낸다 — 헤더와 홈 히어로가 같이 쓴다 */
export function useCourseSearch(initial = "") {
  const router = useRouter();
  const [query, setQuery] = useState(initial);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    router.push({ pathname: "/courses", query: q ? { q } : {} });
  };
  return { query, setQuery, submit };
}

// 수강신청 흐름 — 버튼 → 확인 모달(포인트 차감 계산) → 서버 응답 → 토스트.
// 버튼 상태는 상세 카드와 모바일 하단 바가 같이 쓴다.
// 포인트 부족은 화면에서 먼저 알려 주지만(사전 안내), 최종 판단은 서버가 내린다(400).
export type EnrollState = "loading" | "login" | "available" | "pending" | "enrolled" | "short";

export interface Toast {
  tone: "success" | "warning" | "error";
  message: string;
}

// 서버 응답 코드 → 토스트 (시안 03-1 '서버 응답 토스트')
const TOAST_BY_STATUS: Record<number, Toast> = {
  201: { tone: "success", message: "수강신청이 완료되었어요!" },
  409: { tone: "warning", message: "이미 신청한 강의예요." },
  400: { tone: "error", message: "포인트가 부족해요." },
  401: { tone: "error", message: "로그인이 만료됐어요. 다시 로그인해 주세요." },
  404: { tone: "error", message: "강의를 찾지 못했어요." },
  500: { tone: "error", message: "신청하지 못했어요. 잠시 후 다시 시도해 주세요." },
};

export function useEnroll(course: Course) {
  const queryClient = useQueryClient();
  const me = useMe();
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // 토스트 타이머가 렌더마다 다시 시작되지 않게 같은 함수를 넘긴다
  const clearToast = useCallback(() => setToast(null), []);

  const mutation = useMutation({
    mutationFn: () => enroll(course.id),
    onSuccess: () => setToast(TOAST_BY_STATUS[201]),
    onError: (error) => {
      const status = error instanceof ApiError && TOAST_BY_STATUS[error.status] ? error.status : 500;
      if (status === 401) clearToken();
      setToast(TOAST_BY_STATUS[status]);
    },
    // 성공이든 실패든 "me" 캐시를 낡았다고 표시 → 서버의 진짜 포인트 · 신청 목록으로 다시 그린다.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  // 같은 요청이 두 번 나가지 않게 — isPending은 다음 렌더에야 바뀌어서 ref로 바로 막는다
  const inFlight = useRef(false);

  const myPoints = me.data?.points ?? 0;
  const enrollment = me.data?.enrollments.find((e) => e.course_id === course.id);
  const remaining = myPoints - course.price;
  /** 모자란 포인트. 충분하면 0 */
  const shortBy = Math.max(0, -remaining);

  let state: EnrollState;
  if (me.data === undefined) state = "loading";
  else if (me.data === null) state = "login";
  else if (enrollment) state = "enrolled";
  else if (mutation.isPending) state = "pending";
  else if (shortBy > 0) state = "short";
  else state = "available";

  const submit = () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setConfirming(false);
    mutation.mutate(undefined, {
      onSettled: () => {
        inFlight.current = false;
      },
    });
  };

  return {
    state,
    myPoints,
    remaining,
    shortBy,
    enrolledAt: enrollment ? formatDate(enrollment.enrolled_at) : null,
    /** 신청 가능 · 포인트 부족일 때 모달을 연다. 그 밖의 상태에서는 열지 않는다 */
    open: () => (state === "available" || state === "short") && setConfirming(true),
    confirming,
    cancel: () => setConfirming(false),
    submit,
    toast,
    clearToast,
  };
}
