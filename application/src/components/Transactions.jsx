import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";

const TransactionsCard = ({
  addressFrom,
  addressTo,
  amount,
  currentAccount,
  keyword,
  message,
  timestamp,
}) => {
  const normalizedAccount = currentAccount.toLowerCase();
  const isSender = addressFrom.toLowerCase() === normalizedAccount;
  const isReceiver = addressTo.toLowerCase() === normalizedAccount;

  return (
    <article className="flex min-w-0 w-full flex-col rounded-xl border border-white/10 bg-[#181918] p-5 hover:shadow-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="max-w-full truncate rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
          {keyword || "transfer"}
        </span>
        {(isSender || isReceiver) && (
          <span className="text-xs text-emerald-300">
            {isSender ? "Sent by you" : "Received by you"}
          </span>
        )}
      </div>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-gray-500">From</dt>
          <dd className="text-white" title={addressFrom}>{shortenAddress(addressFrom)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">To</dt>
          <dd className="text-white" title={addressTo}>{shortenAddress(addressTo)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Amount</dt>
          <dd className="text-white font-semibold">{amount} test ETH</dd>
        </div>
        {message && (
          <div>
            <dt className="text-gray-500">Message</dt>
            <dd className="text-white break-words">{message}</dd>
          </div>
        )}
      </dl>

      <time className="text-[#37c7da] text-xs font-semibold mt-5" dateTime={timestamp}>
        {timestamp}
      </time>
    </article>
  );
};

const Transactions = () => {
  const {
    currentAccount,
    isCorrectNetwork,
    isTransactionsLoading,
    loadTransactions,
    transactions,
    transactionsError,
  } = useContext(TransactionContext);

  let content;

  if (!currentAccount) {
    content = (
      <p className="text-gray-400 text-center mt-8">
        Connect MetaMask to load the latest contract transactions.
      </p>
    );
  } else if (!isCorrectNetwork) {
    content = (
      <p className="text-amber-200 text-center mt-8">
        Switch to the local Hardhat network to view its transaction history.
      </p>
    );
  } else if (isTransactionsLoading) {
    content = <p className="text-gray-300 text-center mt-8">Loading latest transactions...</p>;
  } else if (transactionsError) {
    content = (
      <div className="text-center mt-8">
        <p role="alert" className="text-red-300">{transactionsError}</p>
        <button
          type="button"
          onClick={() => loadTransactions()}
          className="mt-4 text-white border border-[#3d4f7c] px-5 py-2 rounded-full hover:bg-[#3d4f7c]"
        >
          Try again
        </button>
      </div>
    );
  } else if (transactions.length === 0) {
    content = (
      <p className="text-gray-400 text-center mt-8">
        No transfers yet. Your first confirmed transfer will appear here automatically.
      </p>
    );
  } else {
    content = (
      <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {transactions.map((transaction) => (
          <TransactionsCard
            key={transaction.id}
            currentAccount={currentAccount}
            {...transaction}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="flex w-full justify-center items-center 1xl:px-20 gradient-bg-transactions">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-24 pt-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <h2 className="text-center text-2xl text-white sm:text-3xl">Latest Transactions</h2>
          {currentAccount && isCorrectNetwork && (
            <button
              type="button"
              disabled={isTransactionsLoading}
              onClick={() => loadTransactions()}
              className="text-sm text-blue-200 border border-blue-300/30 px-4 py-2 rounded-full hover:bg-blue-400/10 disabled:opacity-50"
            >
              Refresh
            </button>
          )}
        </div>
        {content}
      </div>
    </section>
  );
};

export default Transactions;
