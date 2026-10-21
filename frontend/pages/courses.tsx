import { useEffect, useState } from "react";

type Course = {
  id: number;
  title: string;
  price: number;
};
export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    fetch("http://localhost:8000/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data));
  }, []);
  return (
    <>
      <h1>강의 목록</h1>
      <ol>
        {courses.map((course) => (
          <li key={course.id}>{course.title}</li>
        ))}
      </ol>
    </>
  );
}
