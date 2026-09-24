import abi from "./Transactions.json";
import deployment from "./deployment.json";

export const contractABI = abi.abi;
export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || deployment.address;
export const expectedChainId = Number(
  import.meta.env.VITE_CHAIN_ID || deployment.chainId || 31337,
);
export const expectedChainIdHex = `0x${expectedChainId.toString(16)}`;
export const expectedNetworkName = deployment.network || "Hardhat Localhost";
export const localNetwork = {
  chainId: expectedChainIdHex,
  chainName: expectedNetworkName,
  nativeCurrency: {
    name: "Test Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545"],
};
