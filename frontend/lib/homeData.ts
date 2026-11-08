// 메인 홈 홍보 데이터 — 문구·숫자는 피그마 「디자인 · 네이비」 시안 그대로다(DB와 상관없는 정적 화면).
// 홈의 인기 강좌는 원화 가격으로 보여 주는 홍보용 카드라, 누르면 포인트로 신청하는 강의 목록(/courses)으로 간다.

export type CategoryId = 'dev' | 'ai' | 'cloud' | 'design' | 'biz'
/** 인기 강좌 필터 탭 — 'all' 은 전체 */
export type Track = 'all' | 'backend' | 'frontend' | 'ai'

export interface Category {
  id: CategoryId
  name: string
  summary: string
  count: number
  icon: string
  /** 아이콘 원본 크기 — 48 칸 안에서 그대로 그린다 */
  iconSize: { width: number; height: number }
}

export const CATEGORIES: Category[] = [
  { id: 'dev', name: '개발·프로그래밍', summary: '웹, 모바일, 백엔드, DB', count: 420, icon: '/tl/cat-code.svg', iconSize: { width: 23.33, height: 14 } },
  { id: 'ai', name: 'AI·데이터', summary: 'LLM, 머신러닝, 데이터분석', count: 195, icon: '/tl/cat-ai.svg', iconSize: { width: 21, height: 21 } },
  { id: 'cloud', name: '클라우드·인프라', summary: 'AWS, DevOps, Kubernetes', count: 142, icon: '/tl/cat-cloud.svg', iconSize: { width: 25.67, height: 18.67 } },
  { id: 'design', name: '디자인·UI/UX', summary: '피그마, 프로덕트 디자인', count: 88, icon: '/tl/cat-design.svg', iconSize: { width: 22.17, height: 21 } },
  { id: 'biz', name: '기획·마케팅', summary: 'PM, 애널리틱스, 그로스', count: 112, icon: '/tl/cat-marketing.svg', iconSize: { width: 25.67, height: 19.83 } },
]

export interface Course {
  id: string
  title: string
  mentor: string
  level: '초급·입문' | '중급' | '중고급'
  tags: string[]
  track: Exclude<Track, 'all'>
  category: CategoryId
  rating: number
  students: number
  price: number
  /** 할인 전 가격. 없으면 정가 */
  originalPrice?: number
  image: string
}

export const COURSES: Course[] = [
  {
    id: 'fullstack-ts',
    title: '풀스택 TypeScript 프로젝트 완성: Next.js 14 & Prisma 실전',
    mentor: '강태우',
    level: '초급·입문',
    tags: ['TypeScript', 'Fullstack'],
    track: 'frontend',
    category: 'dev',
    rating: 4.9,
    students: 1240,
    price: 69300,
    originalPrice: 99000,
    image: '/tl/course-1.jpg',
  },
  {
    id: 'spring-cloud-msa',
    title: '실전 Spring Cloud로 마이크로서비스 완벽 구축 (MSA 실무)',
    mentor: '이영준',
    level: '중급',
    tags: ['Spring Boot 3', 'Kafka'],
    track: 'backend',
    category: 'dev',
    rating: 5.0,
    students: 3410,
    price: 100100,
    originalPrice: 143000,
    image: '/tl/course-2.jpg',
  },
  {
    id: 'langchain-agent',
    title: 'LangChain & Vector DB로 구현하는 기업형 LLM 멀티에이전트',
    mentor: '박민석',
    level: '중고급',
    tags: ['LangChain', 'RAG'],
    track: 'ai',
    category: 'ai',
    rating: 4.95,
    students: 890,
    price: 84000,
    originalPrice: 120000,
    image: '/tl/course-3.jpg',
  },
  {
    id: 'docker-actions',
    title: '개발자를 위한 무작정 시작하는 Docker & GitHub Actions',
    mentor: '정소연',
    level: '초급·입문',
    tags: ['Docker', 'CI/CD'],
    track: 'backend',
    category: 'cloud',
    rating: 4.88,
    students: 2110,
    price: 54600,
    originalPrice: 78000,
    image: '/tl/course-4.jpg',
  },
]

export const TRACKS: { id: Track; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'backend', label: '백엔드' },
  { id: 'frontend', label: '프론트엔드' },
  { id: 'ai', label: 'AI & LLM' },
]

export const TRENDING = ['Next.js', 'Spring Boot', 'Docker', 'AI Agent', 'LangChain']

export interface Roadmap {
  track: string
  title: string
  meta: string
  description: string
  steps: { title: string; detail: string }[]
  /** 앞에서부터 몇 단계를 진행 중으로 칠할지 */
  activeSteps: number
  cta: string
  tone: 'navy' | 'indigo'
}

export const ROADMAPS: Roadmap[] = [
  {
    track: '웹 개발 트랙',
    title: '풀스택 웹 개발자 로드맵',
    meta: '총 6개 코스 · 예상 24주 완주',
    description: '모던 자바스크립트 생태계(React, Next.js)부터 백엔드 API 설계, 클라우드 자동 배포까지 전 과정을 실무 프로젝트로 정복합니다.',
    steps: [
      { title: '모던 JS & TypeScript 기초/심화', detail: '비동기 처리와 타입 시스템 완벽 이해' },
      { title: 'React 19 & Next.js App Router 프로덕션', detail: '서버 컴포넌트와 최적화 렌더링 전략' },
      { title: '클라우드 인프라 연동 & 최종 포트폴리오', detail: 'AWS ECS, RDS 배포 및 성능 튜닝' },
    ],
    activeSteps: 2,
    cta: '풀스택 로드맵 전체 커리큘럼 보기',
    tone: 'navy',
  },
  {
    track: '인공지능 트랙',
    title: 'AI 서비스 엔지니어 로드맵',
    meta: '총 5개 코스 · 예상 20주 완주',
    description: '단순 프롬프트 작성을 넘어 LLM 오케스트레이션, 고성능 Vector DB 검색, 파인튜닝과 모니터링 환경을 아우르는 파이프라인을 구축합니다.',
    steps: [
      { title: 'Python 실전 & FastAPI 비동기 백엔드', detail: '대규모 AI 모델 서빙 구조 이해' },
      { title: 'LangChain & LlamaIndex 기반 RAG 구축', detail: '도메인 특화 검색 및 환각 완화 테크닉' },
      { title: 'LLM 경량화 서빙 (vLLM) & 배포 자동화', detail: '실제 엔터프라이즈 환경에서의 AI 서비스 운영' },
    ],
    activeSteps: 2,
    cta: 'AI 엔지니어 로드맵 전체 커리큘럼 보기',
    tone: 'indigo',
  },
]

export interface Review {
  title: string
  body: string
  name: string
  role: string
  tone: 'navy' | 'indigo' | 'gray'
}

export const REVIEWS: Review[] = [
  {
    title: '"비전공자 출신에서 유니콘 백엔드 엔지니어로"',
    body: '실무형 Spring 로드맵을 수강하며 코드 리뷰에서 지적받았던 예외 처리와 트랜잭션 분리 경험이 기술 면접에서 결정적인 강점이 되었습니다. 강의 자료의 깊이가 다릅니다.',
    name: '김현우',
    role: 'T사 백엔드 엔지니어 합격',
    tone: 'navy',
  },
  {
    title: '"실무에서 당장 쓰는 AI 워크플로우를 배웠습니다"',
    body: 'LangChain 강의를 듣고 일주일 만에 팀 내부 문서 검색 챗봇 PoC를 개발하여 전사 데모를 성공적으로 마쳤습니다. 단순 이론이 아닌 아키텍처 관점의 강의라 응용력이 확 늘었습니다.',
    name: '이수진',
    role: 'N사 데이터 사이언티스트',
    tone: 'indigo',
  },
  {
    title: '"3년 차 주니어의 번아웃을 구원해 준 커리큘럼"',
    body: '단순 기능 구현만 하다가 성능 최적화와 모니터링, 대규모 트래픽 병목 해결 강의를 접하고 기술적인 시야가 완전히 바뀌었습니다. 이직 연봉 협상도 만족스럽게 마무리했습니다.',
    name: '박찬영',
    role: 'K사 프론트엔드 리드',
    tone: 'gray',
  },
]

/** 할인율(%) — 정가가 없으면 0 */
export function discountRate(course: Pick<Course, 'price' | 'originalPrice'>) {
  return course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0
}

export const won = (value: number) => `₩${value.toLocaleString('ko-KR')}`

