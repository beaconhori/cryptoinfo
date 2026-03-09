import { fetchExchanges } from "@/lib/fetchExchanges";
import { fetchWallets } from "@/lib/fetchWallets";
import ExchangeList from "@/components/ExchangeList";

export const revalidate = 60; // 60秒ごとに再生成 (ISR)

export default async function Home() {
  const [exchanges, wallets] = await Promise.all([
    fetchExchanges(),
    fetchWallets(),
  ]);

  return <ExchangeList initialExchanges={exchanges} initialWallets={wallets} />;
}
