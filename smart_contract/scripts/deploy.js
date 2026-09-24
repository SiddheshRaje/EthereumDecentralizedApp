const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

const LOCAL_CHAIN_ID = 31337;

const main = async () => {
  const network = await hre.ethers.provider.getNetwork();

  if (network.chainId !== LOCAL_CHAIN_ID) {
    throw new Error(
      'Refusing to deploy: expected local chain '
        + LOCAL_CHAIN_ID
        + ', received '
        + network.chainId
        + '.',
    );
  }

  const transactionsFactory = await hre.ethers.getContractFactory('Transactions');
  const transactionsContract = await transactionsFactory.deploy();

  await transactionsContract.deployed();

  const artifact = await hre.artifacts.readArtifact('Transactions');
  const frontendUtils = path.resolve(__dirname, '../../application/src/utils');

  fs.writeFileSync(
    path.join(frontendUtils, 'Transactions.json'),
    JSON.stringify({ abi: artifact.abi }, null, 2) + '\n',
  );
  fs.writeFileSync(
    path.join(frontendUtils, 'deployment.json'),
    JSON.stringify({
      address: transactionsContract.address,
      chainId: network.chainId,
      network: 'Hardhat Localhost',
    }, null, 2) + '\n',
  );

  console.log('Transactions deployed to ' + transactionsContract.address);
  console.log('Frontend ABI and deployment settings updated.');
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
};

runMain();
