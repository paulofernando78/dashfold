import { useState, useEffect } from "react";

import { WidgetBody, WidgetControls } from "@/components/ui/Widget";
import { MarketCard } from "./MarketCard";
import { Icon } from "@/components/ui/Icon";

async function fetchJson(url, options, marketName) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `${marketName}: erro ${response.status} ${response.statusText}`,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`${marketName}: resposta inválida`);
  }
}

function requireFiniteNumber(value, marketName) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`${marketName}: valor inválido`);
  }

  return number;
}

async function fetchBrapiIndex({ symbol, id, name, token, signal }) {
  if (!token) {
    throw new Error(`${name}: token da brapi não configurado`);
  }

  const data = await fetchJson(
    `https://brapi.dev/api/quote/${encodeURIComponent(symbol)}?range=1mo&interval=1d`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    },
    name,
  );

  const quote = data?.results?.[0];

  if (!quote) {
    throw new Error(`${name}: cotação não encontrada`);
  }

  const history = (quote.historicalDataPrice ?? [])
    .map(({ date, close }) => ({
      time: new Date(date * 1000).toISOString().slice(0, 10),
      value: Number(close),
    }))
    .filter(({ value }) => Number.isFinite(value))
    .sort((a, b) => a.time.localeCompare(b.time));

  return {
    category: "indexes",
    id,
    name,
    value: requireFiniteNumber(quote.regularMarketPrice, name),
    change: requireFiniteNumber(quote.regularMarketChangePercent, name),
    history,
  };
}

async function fetchDollar(signal) {
  const data = await fetchJson(
    "https://economia.awesomeapi.com.br/json/daily/USD-BRL/30",
    { signal },
    "Dólar",
  );
  const quote = data?.[0];

  if (!quote) {
    throw new Error("Dólar: cotação não encontrada");
  }

  const history = data
    .map(({ timestamp, bid }) => ({
      time: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
      value: Number(bid),
    }))
    .filter(({ value }) => Number.isFinite(value))
    .sort((a, b) => a.time.localeCompare(b.time));

  return {
    category: "currency",
    id: "dollar",
    name: "Dólar",
    value: requireFiniteNumber(quote.bid, "Dólar"),
    change: requireFiniteNumber(quote.pctChange, "Dólar"),
    history,
  };
}

async function fetchBitcoin(signal) {
  const data = await fetchJson(
    "https://economia.awesomeapi.com.br/json/daily/BTC-BRL/30",
    { signal },
    "Bitcoin",
  );

  const quote = data?.[0];

  if (!quote) {
    throw new Error("Bitcoin: cotação não encontrada");
  }

  const history = data
    .map(({ timestamp, bid }) => ({
      time: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
      value: Number(bid),
    }))
    .filter(({ value }) => Number.isFinite(value))
    .sort((a, b) => a.time.localeCompare(b.time));

  return {
    category: "crypto",
    id: "bitcoin",
    name: "Bitcoin",
    value: requireFiniteNumber(quote.bid, "Bitcoin"),
    change: requireFiniteNumber(quote.pctChange, "Bitcoin"),
    history,
  };
}

export function Markets({
  selectedMarketId = "ibovespa",
  onConfigChange,
  onDelete,
}) {
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadMarkets() {
      try {
        setIsLoading(true);
        setError("");

        const token = import.meta.env.VITE_BRAPI_TOKEN;
        const requests = await Promise.allSettled([
          fetchBrapiIndex({
            symbol: "^BVSP",
            id: "ibovespa",
            name: "Ibovespa",
            token,
            signal: controller.signal,
          }),
          fetchBrapiIndex({
            symbol: "^GSPC",
            id: "sp500",
            name: "S&P 500",
            token,
            signal: controller.signal,
          }),
          fetchDollar(controller.signal),
          fetchBitcoin(controller.signal),
        ]);

        if (!isActive) return;

        const loadedMarkets = requests
          .filter((request) => request.status === "fulfilled")
          .map((request) => request.value);

        const bitcoin = loadedMarkets.find((market) => market.id === "bitcoin");

        const dollar = loadedMarkets.find((market) => market.id === "dollar");

        const marketsWithConversions = loadedMarkets.map((market) => {
          if (market.id !== "bitcoin" || !bitcoin || !dollar) {
            return market;
          }

          return {
            ...market,
            usdValue: bitcoin.value / dollar.value,
          };
        });

        const requestErrors = requests
          .filter(
            (request) =>
              request.status === "rejected" &&
              request.reason?.name !== "AbortError",
          )
          .map((request) => request.reason?.message ?? "Erro desconhecido");

        setMarkets(marketsWithConversions);
        setError(requestErrors.join(" | "));
      } catch (requestError) {
        if (isActive && requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadMarkets();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  function formatValue(market) {
    if (market.id === "dollar" || market.id === "bitcoin") {
      return market.value?.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }

    return market.value?.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
    });
  }

  function formatUsdValue(value) {
    if (value == null) return "--";

    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "USD",
    });
  }

  function formatChange(change) {
    if (change == null) return "--";

    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  }

  const selectedMarket = markets.find(
    (market) => market.id === selectedMarketId,
  );

  return (
    <WidgetBody
      middlePosition="top"
      middle={
        isLoading ? (
          <span>Carregando...</span>
        ) : markets.length === 0 && error ? (
          <span className="text-red-400">{error}</span>
        ) : (
          <div
            className="
              flex
              flex-col
              gap-4
              min-h-0
              h-full
            "
          >
            <div className="
              relative
              "
            >
              <select
                value={selectedMarketId}
                onChange={(event) =>
                  onConfigChange?.({
                    selectedMarketId: event.target.value,
                  })
                }
                className="
                  appearance-none
                  block
                  w-full
                  min-h-10
                  px-3
                  pr-10
                  border
                  rounded
                  border-gray-500/80
                  bg-transparent
                  cursor-pointer
                  outline-none
                  touch-manipulation
                "
              >
                <option value="ibovespa">Ibovespa</option>
                <option value="sp500">S&P 500</option>
                <option value="dollar">Dólar</option>
                <option value="bitcoin">Bitcoin</option>
              </select>
              <Icon
                name="chevronDown"
                size={16}
                className="
                  pointer-events-none
                  absolute
                  right-2
                  top-1/2
                  -translate-y-1/2
                "
              />
            </div>

            {selectedMarket && (
              <MarketCard
                market={selectedMarket}
                formatValue={formatValue}
                formatUsdValue={formatUsdValue}
                formatChange={formatChange}
              />
            )}

            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
        )
      }
      bottom={
        <WidgetControls>
          <WidgetControls.Delete onClick={onDelete} />
        </WidgetControls>
      }
    />
  );
}
