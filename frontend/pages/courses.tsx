import Link from "next/link";
import { API_BASE_URL } from "../lib/api";

type Course = {
  id: number;
  title: string;
  price: number;
};

export async function getServerSideProps() {
  const res = await fetch(`${API_BASE_URL}/orm/courses`);
  if (!res.ok) {
    throw new Error(`강의 목록 실패: ${res.status}`);
  }
  const courses: Course[] = await res.json();
  return { props: { courses } };
}

export default function Courses({ courses }: { courses: Course[] }) {
  return (
    <>
      <p><Link href="/login">로그인 / 로그아웃</Link></p>
      <h1>강의 목록</h1>
      <ol>
        {courses.map((course) => (
          <li key={course.id}>
            <Link href={`/courses/${course.id}`}>{course.title}</Link>
          </li>
        ))}
      </ol>
    </>
  );
}
