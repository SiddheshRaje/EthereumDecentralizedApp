const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Transactions', function () {
  let transactions;
  let sender;
  let receiver;

  beforeEach(async function () {
    [sender, receiver] = await ethers.getSigners();
    const Transactions = await ethers.getContractFactory('Transactions');
    transactions = await Transactions.deploy();
    await transactions.deployed();
  });

  it('sends ETH and records the transfer atomically', async function () {
    const amount = ethers.utils.parseEther('1');
    const balanceBefore = await receiver.getBalance();

    await expect(
      transactions.addToBlockchain(receiver.address, 'Local test', 'test', { value: amount }),
    ).to.emit(transactions, 'Transfer');

    expect(await receiver.getBalance()).to.equal(balanceBefore.add(amount));
    expect(await transactions.getTransactionCount()).to.equal(1);

    const latest = await transactions.getLatestTransactions(10);
    expect(latest).to.have.length(1);
    expect(latest[0].sender).to.equal(sender.address);
    expect(latest[0].receiver).to.equal(receiver.address);
    expect(latest[0].amount).to.equal(amount);
    expect(latest[0].message).to.equal('Local test');
    expect(latest[0].keyword).to.equal('test');
  });

  it('returns newest transfers first and respects the limit', async function () {
    await transactions.addToBlockchain(receiver.address, 'First', 'one', {
      value: ethers.utils.parseEther('0.1'),
    });
    await transactions.addToBlockchain(receiver.address, 'Second', 'two', {
      value: ethers.utils.parseEther('0.2'),
    });

    const latest = await transactions.getLatestTransactions(1);
    expect(latest).to.have.length(1);
    expect(latest[0].message).to.equal('Second');
  });

  it('rejects zero-value and zero-address transfers', async function () {
    await expect(
      transactions.addToBlockchain(receiver.address, 'No value', 'zero'),
    ).to.be.revertedWith('Amount must be greater than zero');

    await expect(
      transactions.addToBlockchain(
        ethers.constants.AddressZero,
        'No receiver',
        'zero-address',
        { value: 1 },
      ),
    ).to.be.revertedWith('Receiver cannot be the zero address');
  });
});
