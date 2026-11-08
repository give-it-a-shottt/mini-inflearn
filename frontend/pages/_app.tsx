import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { wakeApi } from "../lib/api";

export default function App({ Component, pageProps }: AppProps) {
  // QueryClient = 서버에서 받아 온 데이터를 담아 두는 캐시 창고. 앱 전체에서 하나만 쓴다.
  // useState로 만들어야 화면이 다시 그려질 때마다 창고가 새로 생기지 않는다.
  const [queryClient] = useState(() => new QueryClient());

  // 처음 들어온 순간 API 서버를 미리 깨운다. 사람이 홈을 둘러보는 동안 깨어나서,
  // 강의 목록 · 로그인으로 넘어갈 때 50초씩 기다리지 않게. _app은 페이지를 옮겨도 다시 안 붙어서 한 번만 실행된다.
  useEffect(() => {
    wakeApi();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
