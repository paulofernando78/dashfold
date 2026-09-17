import { MarketLineChart } from "./MarketLineChart";

export function MarketCard({
  market,
  formatValue,
  formatUsdValue,
  formatChange,
}) {
  return (
    <div
      className={`
        flex-1
        flex
        flex-col
        gap-2
        min-h-0
      `}
    >
      {/* <span>{market.name}</span> */}

      <div className="flex gap-2">
        {market.id === "bitcoin" && (
          <span>{formatUsdValue(market.usdValue)}</span>
        )}

        <span>{formatValue(market)}</span>

        <span
          className={`
            
            ${market.change >= 0 ? "text-green-400" : "text-red-400"}
          `}
        >
          {formatChange(market.change)}
        </span>
      </div>

      {market.history?.length > 0 && (
        <MarketLineChart data={market.history} className="min-h-0 flex-1" />
      )}
    </div>
  );
}
