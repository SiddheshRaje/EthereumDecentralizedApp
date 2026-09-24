import React, { useEffect, useState } from "react";

const CURRENCIES = [
  { code: "usd", label: "USD", symbol: "$" },
  { code: "eur", label: "EUR", symbol: "€" },
  { code: "gbp", label: "GBP", symbol: "£" },
  { code: "inr", label: "INR", symbol: "₹" },
];

const formatFiat = (value) => (Number.isFinite(value) ? value.toFixed(2) : "");
const formatEth = (value) => (Number.isFinite(value) ? value.toFixed(6) : "");

const ExchangePage = () => {
  const [rates, setRates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [ethAmount, setEthAmount] = useState("1");
  const [fiatAmount, setFiatAmount] = useState("");

  const fetchRates = async () => {
    setIsLoading(true);
    setError("");

    try {
      const vsCurrencies = CURRENCIES.map((c) => c.code).join(",");
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${vsCurrencies}`,
      );

      if (!response.ok) throw new Error("Failed to fetch exchange rates.");

      const data = await response.json();
      if (!data.ethereum) throw new Error("Unexpected response from exchange rate API.");

      setRates(data.ethereum);
      setFiatAmount(formatFiat(parseFloat(ethAmount) * data.ethereum[currency]));
    } catch (err) {
      setError(err.message || "Unable to load exchange rates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleEthChange = (e) => {
    const { value } = e.target;
    setEthAmount(value);

    if (rates) setFiatAmount(formatFiat(parseFloat(value) * rates[currency]));
  };

  const handleFiatChange = (e) => {
    const { value } = e.target;
    setFiatAmount(value);

    if (rates) setEthAmount(formatEth(parseFloat(value) / rates[currency]));
  };

  const handleCurrencyChange = (e) => {
    const { value } = e.target;
    setCurrency(value);

    if (rates) setFiatAmount(formatFiat(parseFloat(ethAmount) * rates[value]));
  };

  const activeCurrency = CURRENCIES.find((c) => c.code === currency);

  return (
    <main className="gradient-bg-services flex min-h-[75vh] w-full flex-col items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="mb-2 text-center text-2xl font-semibold text-white sm:text-3xl">Exchange</h1>
      <p className="mb-8 text-center text-sm text-gray-400">Live ETH conversion rates, powered by CoinGecko</p>

      <div className="blue-glassmorphism w-full max-w-sm rounded-xl p-5 sm:p-8">
        {isLoading && <p className="text-white text-center">Loading rates...</p>}

        {!isLoading && error && (
          <div className="text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchRates}
              className="text-white border-[1px] p-2 px-6 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && rates && (
          <>
            <div className="flex justify-between items-center mb-6 white-glassmorphism rounded-lg p-3">
              <span className="text-gray-300 text-sm">1 ETH =</span>
              <span className="text-white font-semibold">
                {activeCurrency.symbol}
                {formatFiat(rates[currency])}
                {" "}
                {activeCurrency.label}
              </span>
            </div>

            <p id="eth-amount-label" className="mb-1 text-xs text-gray-400">ETH</p>
            <input
              id="eth-amount"
              aria-labelledby="eth-amount-label"
              type="number"
              min="0"
              value={ethAmount}
              onChange={handleEthChange}
              className="white-glassmorphism mb-4 min-h-[48px] w-full rounded-lg bg-transparent p-3 text-base text-white outline-none"
            />

            <div className="flex justify-center my-1">
              <span className="text-gray-400 text-xl">⇅</span>
            </div>

            <p id="fiat-amount-label" className="mb-1 text-xs text-gray-400">Amount</p>
            <div className="mb-2 flex w-full gap-2">
              <input
                id="fiat-amount"
                aria-labelledby="fiat-amount-label"
                type="number"
                min="0"
                value={fiatAmount}
                onChange={handleFiatChange}
                className="white-glassmorphism min-h-[48px] min-w-0 flex-1 rounded-lg bg-transparent p-3 text-base text-white outline-none"
              />
              <select
                aria-label="Currency"
                value={currency}
                onChange={handleCurrencyChange}
                className="white-glassmorphism min-h-[48px] w-24 flex-shrink-0 rounded-lg bg-[#232225] p-3 text-base text-white outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={fetchRates}
              className="mt-4 min-h-[48px] w-full cursor-pointer rounded-full border border-[#3d4f7c] px-5 py-3 font-semibold text-white hover:bg-[#3d4f7c]"
            >
              Refresh Rates
            </button>
          </>
        )}
      </div>
    </main>
  );
};

export default ExchangePage;
