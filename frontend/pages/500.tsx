import Link from "next/link";
import { primaryButton, secondaryButton, StatusPage } from "../components/tl/StatusPage";

// 11. 500 — 서버(FastAPI · DB)가 응답하지 못했을 때. Render 무료 서버가 잠들었다 깨는 중일 때도 여기로 올 수 있다.
export default function ServerError() {
  return (
    <StatusPage
      icon="/tl/icon-server.svg"
      badge="500 SERVER ERROR"
      title="일시적인 서버 오류가 발생했어요"
      description="잠시 후 다시 시도해 주세요. 문제가 계속되면 홈으로 이동해 주세요."
    >
      <button type="button" onClick={() => window.location.reload()} className={primaryButton}>
        다시 시도하기
      </button>
      <Link href="/" className={secondaryButton}>
        홈으로
      </Link>
    </StatusPage>
  );
}
