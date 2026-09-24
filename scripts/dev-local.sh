#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHAIN_LOG="${PROJECT_ROOT}/smart_contract/hardhat-node.log"
CHAIN_PID=""

rpc_chain_id() {
  curl --silent --max-time 2 \
    --request POST \
    --header 'Content-Type: application/json' \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    http://127.0.0.1:8545
}

cleanup() {
  if [[ -n "${CHAIN_PID}" ]] && kill -0 "${CHAIN_PID}" 2>/dev/null; then
    kill "${CHAIN_PID}"
    wait "${CHAIN_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

if rpc_chain_id | grep --quiet '"result":"0x7a69"'; then
  echo "Using the existing Hardhat node at http://127.0.0.1:8545"
else
  if rpc_chain_id | grep --quiet '"result"'; then
    echo "Port 8545 is already serving a different Ethereum network."
    echo "Stop that process before starting this local project."
    exit 1
  fi

  echo "Starting Hardhat node. Account details are written to ${CHAIN_LOG}"
  npm run node --prefix "${PROJECT_ROOT}/smart_contract" >"${CHAIN_LOG}" 2>&1 &
  CHAIN_PID=$!

  for _ in {1..30}; do
    if rpc_chain_id | grep --quiet '"result":"0x7a69"'; then
      break
    fi

    if ! kill -0 "${CHAIN_PID}" 2>/dev/null; then
      echo "Hardhat stopped unexpectedly. See ${CHAIN_LOG}"
      exit 1
    fi

    sleep 1
  done

  if ! rpc_chain_id | grep --quiet '"result":"0x7a69"'; then
    echo "Hardhat did not become ready. See ${CHAIN_LOG}"
    exit 1
  fi
fi

echo "Deploying a fresh Transactions contract..."
npm run deploy:local --prefix "${PROJECT_ROOT}/smart_contract"

echo "Starting the web application..."
npm run dev --prefix "${PROJECT_ROOT}/application" -- --host 0.0.0.0
