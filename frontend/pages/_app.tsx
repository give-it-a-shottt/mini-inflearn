import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  // QueryClient = 서버에서 받아 온 데이터를 담아 두는 캐시 창고. 앱 전체에서 하나만 쓴다.
  // useState로 만들어야 화면이 다시 그려질 때마다 창고가 새로 생기지 않는다.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
