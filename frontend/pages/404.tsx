import Link from "next/link";
import { primaryButton, StatusPage } from "../components/tl/StatusPage";

// 10. 404 — 없는 주소, 없는 강의(getServerSideProps가 notFound를 돌려줄 때)
export default function NotFound() {
  return (
    <StatusPage
      icon="/tl/icon-compass.svg"
      badge="404 NOT FOUND"
      title="찾으시는 강의가 없어요"
      description="주소가 잘못되었거나 삭제된 강의입니다."
    >
      <Link href="/courses" className={primaryButton}>
        강의 목록으로 돌아가기
      </Link>
    </StatusPage>
  );
}
