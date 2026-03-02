import { fetchExchanges } from "@/lib/fetchExchanges";
import ExchangeList from "@/components/ExchangeList";

export const revalidate = 60; // 60秒ごとに再生成 (ISR)

export default async function Home() {
  const exchanges = await fetchExchanges();

  return <ExchangeList initialExchanges={exchanges} />;
}
