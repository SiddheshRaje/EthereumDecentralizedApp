import React, { useContext } from "react";
import { AiFillPlayCircle } from "react-icons/ai";
import { SiEthereum } from "react-icons/si";
import { BsExclamationTriangleFill, BsInfoCircle } from "react-icons/bs";
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";
import { Loader } from ".";

const Input = ({
  disabled,
  handleChange,
  name,
  placeholder,
  type,
  value,
}) => (
  <input
    aria-label={placeholder}
    disabled={disabled}
    min={type === "number" ? "0" : undefined}
    name={name}
    onChange={(event) => handleChange(event, name)}
    placeholder={placeholder}
    step="0.0001"
    type={type}
    value={value}
    className="mb-3 w-full rounded-lg px-4 py-3 outline-none bg-transparent text-white border-none text-sm white-glassmorphism disabled:cursor-not-allowed disabled:opacity-50"
  />
);

const walletButtonBase = "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 py-3 text-center text-base font-semibold text-white shadow-lg transition-colors disabled:cursor-wait disabled:opacity-60 sm:px-6";

const Welcome = () => {
  const {
    connectWallet,
    currentAccount,
    expectedNetworkName,
    formData,
    handleChange,
    hasWallet,
    isConnecting,
    isCorrectNetwork,
    isLoading,
    sendTransaction,
    switchNetwork,
    transactionStatus,
    walletError,
  } = useContext(TransactionContext);

  const canTransfer = Boolean(currentAccount && isCorrectNetwork && !isLoading);
  let transferButtonLabel = "Connect wallet to transfer";

  if (currentAccount) {
    transferButtonLabel = isCorrectNetwork
      ? "Transfer test ETH"
      : "Switch network to transfer";
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    sendTransaction();
  };

  const handleTransferButtonClick = () => {
    if (!currentAccount) {
      connectWallet();
    } else if (!isCorrectNetwork) {
      switchNetwork();
    }
  };

  return (
    <section className="home-hero w-full">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-14 px-5 pb-24 pt-[3px] sm:px-8 sm:pb-28 sm:pt-[11px] lg:grid-cols-2 lg:gap-20 lg:px-12 lg:pb-32 lg:pt-[19px]">
        <div className="flex w-full max-w-xl flex-col items-start lg:pt-1">
          <h1 className="text-3xl font-semibold leading-tight text-white text-gradient sm:text-6xl lg:text-7xl">
            Ethereum Decentralized
            <br />
            App
          </h1>
          <p className="mt-6 max-w-lg text-left text-base font-light leading-7 text-gray-200 sm:text-lg">
            Send test ETH safely through MetaMask on your local Hardhat network.
          </p>

          <div
            role="alert"
            aria-label="Local test network security warning"
            className="local-network-alert mt-8 w-full rounded-xl border-2 border-red-500 bg-[#2a1117] p-4 sm:p-5"
          >
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg sm:h-11 sm:w-11">
                <BsExclamationTriangleFill aria-hidden="true" fontSize={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-red-200 text-lg font-bold">
                    Security warning: local test network only
                  </h2>
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Chain ID 31337
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold leading-6 text-white">
                  Never send real ETH or other real funds to a Hardhat account.
                </p>
                <p className="mt-1 text-sm leading-6 text-red-100">
                  Hardhat accounts use public, well-known private keys. Anyone can control
                  them on a live network. Use these accounts only with local test ETH on
                  Hardhat Localhost.
                </p>
              </div>
            </div>
          </div>

          {!currentAccount && (
            <button
              type="button"
              disabled={isConnecting}
              onClick={connectWallet}
              className={`${walletButtonBase} mt-6 w-full bg-[#2952e3] hover:bg-[#2546bd] sm:w-auto`}
            >
              <AiFillPlayCircle aria-hidden="true" fontSize={20} />
              <span className="text-base font-semibold">
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
              </span>
            </button>
          )}

          {currentAccount && !isCorrectNetwork && (
            <button
              type="button"
              onClick={switchNetwork}
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-center font-semibold text-slate-950 shadow-lg transition-colors hover:bg-amber-600 sm:w-auto sm:px-6"
            >
              Switch to
              {" "}
              {expectedNetworkName}
            </button>
          )}

          {!hasWallet && (
            <p className="mt-4 text-amber-200 text-sm">
              MetaMask was not detected. Install the extension, then reload this page.
            </p>
          )}

          {walletError && (
            <p role="alert" className="mt-4 w-full rounded-lg bg-red-500/10 border border-red-400/40 p-3 text-red-200 text-sm">
              {walletError}
            </p>
          )}

          {transactionStatus && (
            <p aria-live="polite" className="mt-4 w-full rounded-lg bg-emerald-500/10 border border-emerald-400/40 p-3 text-emerald-200 text-sm">
              {transactionStatus}
            </p>
          )}
        </div>

        <div className="flex w-full max-w-md flex-col justify-self-center lg:justify-self-end">
          <div className="ethereum-wallet-card w-full rounded-2xl p-5 sm:rounded-3xl sm:p-6">
            <div className="relative z-10 flex h-full w-full flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/10 shadow-lg sm:h-12 sm:w-12">
                    <SiEthereum aria-hidden="true" fontSize={25} color="#fff" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Test wallet
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">Ethereum</p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2 rounded-full bg-black/20 px-2.5 py-1.5 text-xs font-semibold text-white sm:px-3">
                  <span className={isCorrectNetwork ? "h-2 w-2 rounded-full bg-emerald-300" : "h-2 w-2 rounded-full bg-red-300"} />
                  <span className="hidden sm:inline">
                    {currentAccount && isCorrectNetwork ? "Connected" : "Action required"}
                  </span>
                  <span className="sm:hidden">
                    {currentAccount && isCorrectNetwork ? "On" : "Action"}
                  </span>
                </div>
              </div>

              <div className="ethereum-card-chip" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/60">
                    Wallet address
                  </p>
                  <p className="mt-1 text-base font-semibold tracking-wide text-white sm:text-lg">
                    {currentAccount ? shortenAddress(currentAccount) : "Not connected"}
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    {currentAccount && isCorrectNetwork ? expectedNetworkName : "Local network required"}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <BsInfoCircle aria-hidden="true" fontSize={17} color="#fff" />
                  <span className="mt-2 rounded bg-black/20 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Local only
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="blue-glassmorphism mt-3 flex w-full flex-col items-stretch rounded-2xl p-4 shadow-xl sm:p-5"
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Send test ETH</h2>
              <p className="mt-1 text-sm text-gray-400">
                Transactions are limited to Hardhat Localhost.
              </p>
            </div>

            <Input
              disabled={!canTransfer}
              handleChange={handleChange}
              name="addressTo"
              placeholder="Receiver address"
              type="text"
              value={formData.addressTo}
            />
            <Input
              disabled={!canTransfer}
              handleChange={handleChange}
              name="amount"
              placeholder="Test ETH amount"
              type="number"
              value={formData.amount}
            />
            <Input
              disabled={!canTransfer}
              handleChange={handleChange}
              name="keyword"
              placeholder="Keyword"
              type="text"
              value={formData.keyword}
            />
            <Input
              disabled={!canTransfer}
              handleChange={handleChange}
              name="message"
              placeholder="Message"
              type="text"
              value={formData.message}
            />

            <div className="h-[1px] w-full bg-gray-400 my-2" />

            {isLoading ? (
              <Loader />
            ) : (
              <button
                type={canTransfer ? "submit" : "button"}
                disabled={isLoading || isConnecting}
                onClick={canTransfer ? undefined : handleTransferButtonClick}
                className={`${walletButtonBase} mt-3 w-full ${
                  canTransfer
                    ? "border border-[#5369a1] hover:bg-[#3d4f7c]"
                    : "bg-[#2952e3] hover:bg-[#2546bd]"
                }`}
              >
                {!currentAccount && <AiFillPlayCircle aria-hidden="true" fontSize={20} />}
                {transferButtonLabel}
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
