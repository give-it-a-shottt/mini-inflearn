import type { Course, CourseArea } from "./api";

// 강의마다 "보여 주기만 하는" 정보 — 썸네일 · 태그 · 평점 · 소개 · 커리큘럼.
// 제목 · 강사 · 가격 · 분야처럼 신청과 돈에 걸린 값은 DB(courses 테이블)가 정본이고, 여기서는 DB id로 짝지어 꾸밈만 붙인다.
// 내용은 피그마 「디자인 · 네이비」 시안의 강의 8개 그대로다.

export type CourseTab = "all" | "frontend" | "backend" | "database" | "free";

export const COURSE_TABS: { id: CourseTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "frontend", label: "프론트엔드" },
  { id: "backend", label: "백엔드" },
  { id: "database", label: "데이터베이스" },
  { id: "free", label: "무료" },
];

export const AREA_LABEL: Record<CourseArea, string> = {
  frontend: "프론트엔드",
  backend: "백엔드",
  database: "데이터베이스",
  etc: "개발 기본기",
};

export interface CurriculumSection {
  title: string;
  /** 강 제목과 길이('12:40') */
  lessons: { title: string; length: string }[];
}

export interface CourseMeta {
  level: string;
  tags: string[];
  rating: number;
  students: number;
  thumbnail: string;
  /** 상세 화면 큰 썸네일. 없으면 thumbnail */
  cover?: string;
  isNew?: boolean;
  summary: string;
  intro: string;
  learn: string[];
  curriculum: CurriculumSection[];
}

const COURSE_META: Record<number, CourseMeta> = {
  1: {
    level: '초급·입문',
    tags: ['Next.js', 'SSR'],
    rating: 4.9,
    students: 1240,
    thumbnail: '/tl/course-4.jpg',
    cover: '/tl/detail-nextjs.jpg',
    isNew: true,
    summary: 'SSR과 데이터 패칭, API 연동까지. 강의 목록과 상세 페이지를 직접 만들며 Next.js의 렌더링 흐름을 이해합니다.',
    intro:
      'Pages Router의 파일 기반 라우팅부터 getServerSideProps로 데이터를 받아 화면을 그리는 과정까지, 실제 서비스처럼 동작하는 강의 목록 사이트를 만들어 봅니다. 서버에서 HTML을 만들어 보내는 SSR이 왜 첫 화면을 빠르게 만드는지 직접 확인해요.',
    learn: ['pages 폴더 구조와 동적 라우트 [id].tsx', 'getServerSideProps로 SSR 데이터 받아오기', '404 · 500 오류 페이지 직접 만들기'],
    curriculum: [
      {
        title: '페이지 라우터 이해하기',
        lessons: [
          { title: 'pages 폴더와 라우팅 규칙', length: '12:40' },
          { title: '동적 라우트와 useRouter', length: '15:10' },
          { title: 'Link로 페이지 이동하기', length: '09:25' },
          { title: '레이아웃 컴포넌트 만들기', length: '18:00' },
        ],
      },
      {
        title: '서버에서 데이터 그리기',
        lessons: [
          { title: 'CSR과 SSR의 차이', length: '14:30' },
          { title: 'getServerSideProps 기본', length: '21:05' },
          { title: 'API 오류를 404·500으로 바꾸기', length: '16:45' },
          { title: '로딩 없이 보이는 첫 화면', length: '11:20' },
        ],
      },
      {
        title: '강의 목록 사이트 완성',
        lessons: [
          { title: '강의 카드 그리드 만들기', length: '24:10' },
          { title: '상세 페이지와 커리큘럼', length: '19:35' },
          { title: '빈 상태 화면 디자인', length: '10:50' },
          { title: '배포 전에 점검할 것', length: '08:15' },
        ],
      },
    ],
  },
  2: {
    level: '초급·입문',
    tags: ['FastAPI', 'Python'],
    rating: 4.8,
    students: 2310,
    thumbnail: '/tl/lec-fastapi.jpg',
    summary: '라우터와 스키마, 의존성 주입까지. 강의 목록 API를 직접 설계하며 REST 응답 형식을 익힙니다.',
    intro:
      'Pydantic 스키마로 요청과 응답을 정의하고, 라우터를 나눠 강의 목록 API를 만듭니다. 잘못된 요청에 422와 404를 어떻게 돌려주는지, DB 세션을 요청마다 열고 닫는 의존성 주입이 왜 필요한지 함께 봐요.',
    learn: ['Pydantic 스키마로 요청·응답 정의하기', 'APIRouter로 라우터 나누기', 'Depends로 DB 세션 주입하기'],
    curriculum: [
      {
        title: 'FastAPI 첫걸음',
        lessons: [
          { title: '설치와 첫 엔드포인트', length: '08:30' },
          { title: '경로·쿼리 파라미터', length: '12:15' },
          { title: '자동 문서(/docs) 읽기', length: '06:40' },
        ],
      },
      {
        title: '스키마와 검증',
        lessons: [
          { title: 'Pydantic 모델 만들기', length: '14:20' },
          { title: '422 응답이 나오는 이유', length: '10:05' },
          { title: '응답 모델로 필드 숨기기', length: '09:50' },
        ],
      },
      {
        title: '강의 API 완성',
        lessons: [
          { title: 'APIRouter로 나누기', length: '11:35' },
          { title: 'Depends와 DB 세션', length: '17:10' },
          { title: '404 · 409 오류 응답 정리', length: '13:25' },
        ],
      },
    ],
  },
  3: {
    level: '중급',
    tags: ['PostgreSQL', 'Transaction'],
    rating: 5.0,
    students: 890,
    thumbnail: '/tl/lec-postgres.jpg',
    summary: '두 사람이 동시에 신청하면 어떻게 될까? 격리 수준과 잠금으로 포인트 차감을 안전하게 만듭니다.',
    intro:
      '수강신청처럼 포인트를 빼고 기록을 남기는 작업은 중간에 실패하면 둘 다 없던 일이 되어야 합니다. 트랜잭션과 격리 수준, SELECT ... FOR UPDATE로 동시에 들어온 요청을 정리하는 방법을 실습해요.',
    learn: ['트랜잭션과 롤백이 필요한 순간', '격리 수준별로 보이는 데이터 차이', 'SELECT … FOR UPDATE로 동시 신청 막기'],
    curriculum: [
      {
        title: '트랜잭션 기본',
        lessons: [
          { title: 'BEGIN · COMMIT · ROLLBACK', length: '13:10' },
          { title: '중간에 실패하면 생기는 일', length: '11:45' },
          { title: '제약 조건으로 지키기', length: '12:30' },
        ],
      },
      {
        title: '동시성 문제',
        lessons: [
          { title: '격리 수준 네 가지', length: '18:20' },
          { title: '잃어버린 갱신 재현하기', length: '16:05' },
          { title: '행 잠금과 FOR UPDATE', length: '19:40' },
        ],
      },
      {
        title: '수강신청 API에 적용',
        lessons: [
          { title: '포인트 차감과 신청 기록', length: '21:15' },
          { title: '중복 신청 막기(UNIQUE)', length: '12:50' },
          { title: '실패를 409로 돌려주기', length: '10:35' },
        ],
      },
    ],
  },
  4: {
    level: '중급',
    tags: ['Docker', 'CI/CD'],
    rating: 4.88,
    students: 1105,
    thumbnail: '/tl/lec-docker.jpg',
    summary: '이미지 빌드부터 푸시하면 자동으로 테스트·배포되는 파이프라인까지 한 번에 만듭니다.',
    intro:
      'Dockerfile로 앱을 이미지로 만들고, docker compose로 DB와 함께 띄워 봅니다. 마지막에는 GitHub Actions로 푸시할 때마다 테스트를 돌리고 배포까지 이어지는 흐름을 완성해요.',
    learn: ['Dockerfile과 멀티 스테이지 빌드', 'docker compose로 앱과 DB 함께 띄우기', 'GitHub Actions로 테스트·배포 자동화'],
    curriculum: [
      {
        title: '컨테이너 이해하기',
        lessons: [
          { title: '이미지와 컨테이너', length: '10:20' },
          { title: 'Dockerfile 작성', length: '15:45' },
          { title: '멀티 스테이지 빌드', length: '12:10' },
        ],
      },
      {
        title: '여러 서비스 함께 띄우기',
        lessons: [
          { title: 'docker compose 기본', length: '14:00' },
          { title: '환경 변수와 비밀값', length: '11:25' },
          { title: '볼륨으로 데이터 지키기', length: '09:40' },
        ],
      },
      {
        title: 'CI/CD 파이프라인',
        lessons: [
          { title: 'Actions 워크플로 구조', length: '13:30' },
          { title: '푸시마다 테스트 돌리기', length: '16:15' },
          { title: '이미지 푸시와 배포', length: '18:50' },
        ],
      },
    ],
  },
  5: {
    level: '중급',
    tags: ['TanStack Query', 'React'],
    rating: 4.95,
    students: 760,
    thumbnail: '/tl/lec-tanstack.jpg',
    summary: '로딩·에러·캐시를 직접 관리하던 코드를 useQuery와 useMutation으로 정리합니다.',
    intro:
      '서버에서 받은 데이터는 화면 상태와 다르게 다뤄야 합니다. 쿼리 키로 캐시를 나누고, 수강신청 같은 변경 요청 뒤에 목록을 다시 불러오는 무효화 흐름과 버튼의 처리 중 상태를 만들어 봐요.',
    learn: ['쿼리 키와 캐시가 동작하는 방식', 'useMutation의 처리 중·성공·실패 상태', '변경 후 invalidateQueries로 목록 갱신'],
    curriculum: [
      {
        title: '서버 상태란',
        lessons: [
          { title: 'useEffect 패칭의 한계', length: '11:20' },
          { title: 'useQuery 첫 사용', length: '13:45' },
          { title: '쿼리 키 설계', length: '10:30' },
        ],
      },
      {
        title: '변경 요청 다루기',
        lessons: [
          { title: 'useMutation 상태 4가지', length: '15:10' },
          { title: '중복 클릭 막기', length: '08:55' },
          { title: '오류 응답별 토스트', length: '12:40' },
        ],
      },
      {
        title: '캐시 갱신',
        lessons: [
          { title: 'invalidateQueries', length: '14:05' },
          { title: '낙관적 업데이트', length: '17:30' },
          { title: 'staleTime과 gcTime', length: '11:15' },
        ],
      },
    ],
  },
  6: {
    level: '초급·입문',
    tags: ['TypeScript', 'Basic'],
    rating: 4.9,
    students: 3020,
    thumbnail: '/tl/lec-typescript.jpg',
    summary: '타입 선언부터 제네릭까지, 실무 코드를 읽는 데 필요한 문법만 골라 익힙니다.',
    intro:
      '자바스크립트에 타입을 붙이면 무엇이 달라지는지부터 시작합니다. 인터페이스와 유니언 타입으로 API 응답을 표현하고, 제네릭으로 재사용할 수 있는 함수를 만드는 데까지 가요.',
    learn: ['기본 타입과 타입 추론', '인터페이스와 유니언 타입', '제네릭으로 재사용 가능한 함수 만들기'],
    curriculum: [
      {
        title: '타입 기초',
        lessons: [
          { title: '타입을 쓰는 이유', length: '07:50' },
          { title: '기본 타입과 추론', length: '12:25' },
          { title: '함수 타입', length: '10:15' },
        ],
      },
      {
        title: '객체 다루기',
        lessons: [
          { title: '인터페이스와 type', length: '13:40' },
          { title: '유니언과 좁히기', length: '15:05' },
          { title: 'API 응답 타입 만들기', length: '11:30' },
        ],
      },
      {
        title: '한 단계 더',
        lessons: [
          { title: '제네릭 기본', length: '14:20' },
          { title: '유틸리티 타입', length: '12:10' },
          { title: '자주 보는 오류 읽기', length: '09:45' },
        ],
      },
    ],
  },
  7: {
    level: '초급·입문',
    tags: ['HTTP', 'REST'],
    rating: 4.87,
    students: 1480,
    thumbnail: '/tl/lec-http.jpg',
    summary: '브라우저와 서버가 주고받는 메시지를 뜯어보고, 상황에 맞는 상태 코드를 고르는 법을 익힙니다.',
    intro:
      '요청 메서드와 헤더, 본문이 각각 무슨 역할을 하는지 개발자 도구로 직접 확인합니다. 201 · 400 · 401 · 404 · 409 · 500을 언제 쓰는지 실제 API 예시로 정리해요.',
    learn: ['요청·응답 메시지 구조', '상태 코드를 고르는 기준', 'REST 리소스 주소 설계'],
    curriculum: [
      {
        title: 'HTTP 메시지',
        lessons: [
          { title: '요청과 응답의 생김새', length: '10:40' },
          { title: '메서드와 멱등성', length: '12:55' },
          { title: '헤더 읽기', length: '09:20' },
        ],
      },
      {
        title: '상태 코드',
        lessons: [
          { title: '2xx와 3xx', length: '08:45' },
          { title: '4xx — 누구의 잘못인가', length: '14:10' },
          { title: '5xx와 재시도', length: '10:25' },
        ],
      },
      {
        title: 'REST 설계',
        lessons: [
          { title: '리소스 주소 짓기', length: '13:15' },
          { title: '오류 응답 형식 통일', length: '11:50' },
          { title: '문서로 계약 남기기', length: '09:35' },
        ],
      },
    ],
  },
  8: {
    level: '중급',
    tags: ['Git', 'Collaboration'],
    rating: 4.92,
    students: 640,
    thumbnail: '/tl/lec-git.jpg',
    summary: '브랜치를 나누고 PR로 리뷰받는 흐름을, 충돌 해결과 커밋 메시지 규칙까지 함께 익힙니다.',
    intro:
      '혼자 쓰던 Git을 팀에서 쓰면 무엇이 달라질까요? 기능 브랜치와 PR, 리뷰 코멘트를 주고받는 흐름을 따라가며 충돌을 풀고 기록을 깔끔하게 남기는 방법을 연습해요.',
    learn: ['기능 브랜치와 main 보호', 'PR 작성과 리뷰 코멘트 다루기', '충돌 해결과 커밋 메시지 규칙'],
    curriculum: [
      {
        title: '브랜치 전략',
        lessons: [
          { title: '브랜치가 필요한 이유', length: '09:10' },
          { title: 'Git Flow와 trunk 기반', length: '13:35' },
          { title: 'main 보호 규칙', length: '08:20' },
        ],
      },
      {
        title: 'PR과 리뷰',
        lessons: [
          { title: '읽히는 PR 쓰기', length: '12:45' },
          { title: '리뷰 코멘트 주고받기', length: '11:30' },
          { title: '리뷰 반영과 재요청', length: '10:05' },
        ],
      },
      {
        title: '기록 정리',
        lessons: [
          { title: '충돌 해결하기', length: '15:20' },
          { title: 'rebase와 merge', length: '14:15' },
          { title: '커밋 메시지 규칙', length: '08:40' },
        ],
      },
    ],
  },
};

/** DB에 새 강의가 생겨도 화면이 깨지지 않게 쓰는 기본값 */
const FALLBACK_META: CourseMeta = {
  level: "초급·입문",
  tags: [],
  rating: 0,
  students: 0,
  thumbnail: "/tl/course-1.jpg",
  summary: "",
  intro: "",
  learn: [],
  curriculum: [],
};

export function courseMeta(id: number): CourseMeta {
  return COURSE_META[id] ?? FALLBACK_META;
}

export function matchesTab(course: Course, tab: CourseTab) {
  if (tab === "all") return true;
  if (tab === "free") return course.price === 0;
  return course.area === tab;
}

/** 검색어가 제목 · 태그 · 강사 중 하나에 들어 있으면 보인다(대소문자 무시) */
export function matchesQuery(course: Course, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [course.title, course.instructor, ...courseMeta(course.id).tags].some((text) =>
    text.toLowerCase().includes(q),
  );
}

export function lessonCount(meta: CourseMeta) {
  return meta.curriculum.reduce((sum, section) => sum + section.lessons.length, 0);
}

/** 강 길이를 모두 더해 '3시간 1분' 처럼 */
export function totalLength(meta: CourseMeta) {
  const seconds = meta.curriculum
    .flatMap((section) => section.lessons)
    .reduce((sum, { length }) => {
      const [m, s] = length.split(":").map(Number);
      return sum + m * 60 + s;
    }, 0);
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}시간 ${minutes % 60}분` : `${minutes}분`;
}

export const points = (value: number) => `${value.toLocaleString("ko-KR")} P`;

/** 평점 — 5 는 '5.0' 처럼 소수 한 자리는 남긴다 */
export const rating = (value: number) => (Number.isInteger(value * 10) ? value.toFixed(1) : String(value));

/** ISO 날짜 → '2026.11.08' */
export function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}
