# Smart contracts

This directory contains the local-only Hardhat workspace and the `Transactions` contract.

For the complete startup and MetaMask instructions, see the [project README](../README.md).

```bash
npm install
npm test
npm run node
```

With the node running, deploy from another terminal:

```bash
npm run deploy:local
```

The deployment script refuses non-local chain IDs and updates the frontend ABI and contract address automatically.
