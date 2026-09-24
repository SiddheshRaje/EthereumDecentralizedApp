# Cognitensor local Ethereum dApp

This project runs on a local Hardhat blockchain and uses MetaMask to send test ETH. It is intentionally locked to chain ID **31337**. The frontend refuses transfers on Ethereum mainnet or another live network.

## Start everything

Install the dependencies once:

```bash
npm run setup
```

Start the local blockchain, deploy the contract, and launch the frontend:

```bash
npm run dev:local
```

Open the URL printed by Vite, normally <http://localhost:3000>.

The startup script creates a fresh contract deployment and writes its address and ABI to the frontend. Keep this terminal open while using the dApp.

## Connect MetaMask

1. Select **Connect MetaMask** in the web app.
2. Approve the account connection.
3. Approve adding or switching to **Hardhat Localhost** when MetaMask asks.
4. Import one of the development accounts shown in `smart_contract/hardhat-node.log` if the startup script launched the node. If you ran `npm run chain` yourself, use the account shown in that terminal.

MetaMask requires one initial user approval. On later visits, the app restores an already authorized account with `eth_accounts`, loads up to 50 recent transfers immediately, and keeps the list current through contract events and periodic refreshes.

## Test-account warning

Hardhat prints this warning when it starts:

> Any funds sent to them on Mainnet or any other live network WILL BE LOST.

This is expected. Hardhat's accounts use public, well-known private keys and contain only local test ETH. Never send real ETH to these addresses, and never use their private keys on a live network. The application enforces the local chain ID before enabling transfers.

## Useful commands

```bash
npm test             # contract tests, then frontend production build
npm run chain         # local blockchain only
npm run deploy:local  # deploy while the local blockchain is running
npm run app           # frontend only
```

Restarting the Hardhat node clears local blockchain history. Run `npm run deploy:local` after every restart, or use `npm run dev:local`, which does this automatically.
