import type { GetServerSidePropsContext } from "next";
import { API_BASE_URL } from "../../lib/api";

type Course = {
  id: number;
  title: string;
  instructor: string;
  price: number;
};

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
  return (
    <>
      <h1>{course.title}</h1>
      <p>강사: {course.instructor}</p>
      <p>가격: {course.price}원</p>
    </>
  );
}
