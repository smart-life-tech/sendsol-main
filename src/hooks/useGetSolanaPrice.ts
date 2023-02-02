import { useEffect, useState } from "react";

const SOLANA_PRICE_API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

export const useGetSolanaPrice = (): number | null => {
  const [solInUsd, setSolInUsd] = useState<null | number>(null);

  useEffect(() => {
    (async () => {
      const response = await fetch(SOLANA_PRICE_API_URL);
      const solPrice =
        (((await response.json()) as any)?.solana?.usd as number) || 0;
      setSolInUsd(solPrice);
    })();
  }, [setSolInUsd]);

  return solInUsd;
};
