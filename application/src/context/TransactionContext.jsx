import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ethers } from "ethers";
import {
  contractABI,
  contractAddress,
  expectedChainIdHex,
  expectedNetworkName,
  localNetwork,
} from "../utils/constants";

export const TransactionContext = createContext();

const MAX_TRANSACTIONS = 50;
const EMPTY_FORM = {
  addressTo: "",
  amount: "",
  keyword: "",
  message: "",
};

const getEthereum = () => (
  typeof window !== "undefined" ? window.ethereum : undefined
);

const normalizeChainId = (chainId) => {
  if (!chainId) return "";
  return chainId.toLowerCase();
};

const getErrorMessage = (error, fallback) => {
  if (error?.code === 4001) return "The MetaMask request was rejected.";
  return error?.data?.message
    || error?.error?.message
    || error?.message
    || fallback;
};

const createProvider = () => {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask is not installed.");
  return new ethers.providers.Web3Provider(ethereum, "any");
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [currentAccount, setCurrentAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  const hasWallet = Boolean(getEthereum());
  const isCorrectNetwork = normalizeChainId(chainId) === expectedChainIdHex;

  const handleChange = useCallback((event, name) => {
    setFormData((previous) => ({
      ...previous,
      [name]: event.target.value,
    }));
  }, []);

  const loadTransactions = useCallback(async (providerOverride) => {
    const ethereum = getEthereum();
    if (!ethereum || !contractAddress) {
      setTransactions([]);
      if (!contractAddress) {
        setTransactionsError("The local contract is not deployed. Run npm run deploy:local first.");
      }
      return;
    }

    setIsTransactionsLoading(true);
    setTransactionsError("");

    try {
      const provider = providerOverride || createProvider();
      const network = await provider.getNetwork();

      if (network.chainId !== Number.parseInt(expectedChainIdHex, 16)) {
        setTransactions([]);
        return;
      }

      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        throw new Error(
          "No transaction contract was found. The local node may have restarted; deploy the contract again.",
        );
      }

      const transactionsContract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider,
      );
      const availableTransactions = await transactionsContract.getLatestTransactions(
        MAX_TRANSACTIONS,
      );

      setTransactions(
        availableTransactions.map((transaction, index) => ({
          id: [
            transaction.sender,
            transaction.receiver,
            transaction.timestamp.toString(),
            index,
          ].join("-"),
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000,
          ).toLocaleString(),
          timestampValue: transaction.timestamp.toNumber(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: ethers.utils.formatEther(transaction.amount),
        })),
      );
    } catch (error) {
      setTransactions([]);
      setTransactionsError(
        getErrorMessage(error, "Unable to load the latest transactions."),
      );
    } finally {
      setIsTransactionsLoading(false);
    }
  }, []);

  const syncWallet = useCallback(async (accountsOverride) => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
      const accounts = accountsOverride
        || await ethereum.request({ method: "eth_accounts" });
      const nextChainId = normalizeChainId(
        await ethereum.request({ method: "eth_chainId" }),
      );
      const account = accounts[0] || "";

      setCurrentAccount(account);
      setChainId(nextChainId);
      setWalletError("");

      if (account && nextChainId === expectedChainIdHex) {
        await loadTransactions(createProvider());
      } else {
        setTransactions([]);
        setTransactionsError("");
      }
    } catch (error) {
      setWalletError(getErrorMessage(error, "Unable to read the wallet state."));
    }
  }, [loadTransactions]);

  const switchNetwork = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setWalletError("Install MetaMask to connect a wallet.");
      return false;
    }

    setWalletError("");

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: expectedChainIdHex }],
      });
    } catch (switchError) {
      if (switchError.code !== 4902) {
        setWalletError(
          getErrorMessage(switchError, "Unable to switch the MetaMask network."),
        );
        return false;
      }

      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [localNetwork],
        });
      } catch (addError) {
        setWalletError(
          getErrorMessage(addError, "Unable to add the local network to MetaMask."),
        );
        return false;
      }
    }

    await syncWallet();
    return true;
  }, [syncWallet]);

  const connectWallet = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setWalletError("Install MetaMask to connect a wallet.");
      return;
    }

    setIsConnecting(true);
    setWalletError("");

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const activeChainId = normalizeChainId(
        await ethereum.request({ method: "eth_chainId" }),
      );

      if (activeChainId !== expectedChainIdHex) {
        const switched = await switchNetwork();
        if (!switched) return;
      }

      await syncWallet(accounts);
    } catch (error) {
      setWalletError(getErrorMessage(error, "Unable to connect MetaMask."));
    } finally {
      setIsConnecting(false);
    }
  }, [switchNetwork, syncWallet]);

  const sendTransaction = useCallback(async () => {
    const ethereum = getEthereum();
    const {
      addressTo,
      amount,
      keyword,
      message,
    } = formData;

    setWalletError("");
    setTransactionStatus("");

    if (!ethereum) {
      setWalletError("Install MetaMask to send a transaction.");
      return;
    }
    if (!currentAccount) {
      setWalletError("Connect MetaMask before sending a transaction.");
      return;
    }
    if (!isCorrectNetwork) {
      setWalletError(`Switch MetaMask to ${expectedNetworkName} before sending.`);
      return;
    }
    if (!ethers.utils.isAddress(addressTo)) {
      setWalletError("Enter a valid Ethereum receiver address.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setWalletError("Enter an ETH amount greater than zero.");
      return;
    }
    if (!keyword.trim() || !message.trim()) {
      setWalletError("Enter both a keyword and a message.");
      return;
    }
    if (!contractAddress) {
      setWalletError("Deploy the local contract before sending a transaction.");
      return;
    }

    setIsLoading(true);

    try {
      const provider = createProvider();
      const signer = provider.getSigner();
      const transactionsContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      const parsedAmount = ethers.utils.parseEther(amount);

      setTransactionStatus("Confirm the transfer in MetaMask.");
      const transaction = await transactionsContract.addToBlockchain(
        addressTo,
        message.trim(),
        keyword.trim(),
        { value: parsedAmount },
      );

      setTransactionStatus("Waiting for the local network to confirm the transfer...");
      await transaction.wait();
      setFormData(EMPTY_FORM);
      setTransactionStatus("Transfer confirmed. The latest transactions are up to date.");
      await loadTransactions(provider);
    } catch (error) {
      setWalletError(getErrorMessage(error, "The transaction could not be completed."));
      setTransactionStatus("");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentAccount,
    formData,
    isCorrectNetwork,
    loadTransactions,
  ]);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return undefined;

    const handleAccountsChanged = (accounts) => {
      syncWallet(accounts);
    };
    const handleChainChanged = () => {
      syncWallet();
    };

    syncWallet();
    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [syncWallet]);

  useEffect(() => {
    if (!currentAccount || !isCorrectNetwork || !contractAddress) return undefined;

    const provider = createProvider();
    const transactionsContract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider,
    );
    const refresh = () => loadTransactions(provider);
    const refreshInterval = window.setInterval(refresh, 15000);

    transactionsContract.on("Transfer", refresh);

    return () => {
      window.clearInterval(refreshInterval);
      transactionsContract.off("Transfer", refresh);
    };
  }, [currentAccount, isCorrectNetwork, loadTransactions]);

  const value = useMemo(() => ({
    chainId,
    connectWallet,
    currentAccount,
    expectedNetworkName,
    formData,
    handleChange,
    hasWallet,
    isConnecting,
    isCorrectNetwork,
    isLoading,
    isTransactionsLoading,
    loadTransactions,
    sendTransaction,
    switchNetwork,
    transactionStatus,
    transactions,
    transactionsError,
    walletError,
  }), [
    chainId,
    connectWallet,
    currentAccount,
    formData,
    handleChange,
    hasWallet,
    isConnecting,
    isCorrectNetwork,
    isLoading,
    isTransactionsLoading,
    loadTransactions,
    sendTransaction,
    switchNetwork,
    transactionStatus,
    transactions,
    transactionsError,
    walletError,
  ]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
