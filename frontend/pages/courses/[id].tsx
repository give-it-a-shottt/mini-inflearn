import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { API_BASE_URL, enroll, fetchMe } from "../../lib/api";

type Course = {
  id: number;
  title: string;
  instructor: string;
  price: number;
};

// 강의 정보는 그대로 SSR: 서버에서 미리 받아 HTML에 담아 보낸다.
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params?.id;
  const res = await fetch(`${API_BASE_URL}/orm/courses/${id}`);
  if (res.status >= 400 && res.status < 500) {
    return { notFound: true };
  }
  if (!res.ok) {
    throw new Error(`FastAPI 응답 실패: ${res.status}`);
  }
  const course: Course = await res.json();
  return { props: { course } };
}

export default function CourseDetail({ course }: { course: Course }) {
  const queryClient = useQueryClient();

  // 읽기(useQuery): "me"라는 이름표로 내 정보를 캐시에 담아 둔다. 브라우저에서 호출한다.
  // retry: false → 로그인 안 했을 때(401) 같은 실패를 3번 다시 시도하지 않는다.
  const me = useQuery({ queryKey: ["me"], queryFn: fetchMe, retry: false });

  // 쓰기(useMutation): 버튼을 누를 때만 실행된다.
  const mutation = useMutation({
    mutationFn: () => enroll(course.id),
    // 성공하면 "me" 캐시가 낡았다고 표시 → TanStack Query가 /me를 다시 불러 화면을 갱신한다.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  const enrolled = me.data?.enrolled_course_ids.includes(course.id) ?? false;

  return (
    <>
      <p><Link href="/courses">← 강의 목록</Link></p>
      <h1>{course.title}</h1>
      <p>강사: {course.instructor}</p>
      <p>가격: {course.price.toLocaleString()}원</p>

      <hr />
      {me.isPending && <p>내 정보 불러오는 중...</p>}
      {me.isError && (
        <p>
          내 정보를 불러오지 못했어요: {me.error.message} · <Link href="/login">로그인하기</Link>
        </p>
      )}
      {me.data && (
        <p>
          {me.data.name}님의 포인트: <b>{me.data.points.toLocaleString()}P</b>
        </p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={!me.data || enrolled || mutation.isPending}
      >
        {enrolled ? "신청 완료" : mutation.isPending ? "신청 중..." : "수강신청"}
      </button>

      {mutation.isError && <p style={{ color: "crimson" }}>{mutation.error.message}</p>}
      {mutation.isSuccess && <p>신청했어요! 남은 포인트: {mutation.data.points_left.toLocaleString()}P</p>}
    </>
  );
}
