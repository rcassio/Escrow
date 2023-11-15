const Escrow = artifacts.require("Escrow");

const assertError = async (promise, error) => {
  try {
    await promise;
  } catch (e) {
    assert(e.message.includes(error));
    return;
  }
  assert(false);
}

contract('Escrow', accounts => {
  let escrow = null;
  const [lawyer, payer, payee] = accounts;
  before( async () => {
    escrow = await Escrow.deployed();
  });

  it('Should deposit', async () => {
    await escrow.deposit({from: payer, value: 900});
    const escrowBalance = parseInt(await web3.eth.getBalance(escrow.address));
    assert(escrowBalance == 900);
  });

  it('Should NOT deposit if sender is not payer', async () => {
    assertError(
      escrow.deposit({from: accounts[5], value: 100}),
      'Sender must be the payer'
    );
  });

  it('Should NOT deposit if transfer exceed amount', async () => {
    assertError(
      escrow.deposit({from: payer, value: 1100}),
      'Cant send more than escrow amount'
    );
  });

  it('Should NOT release funds if full amount has not been received', async () => {
    assertError(
      escrow.release({from: lawyer}),
      'Cannot release funds before full amount is sent'
    );
  });

  it('Should NOT release funds if sender is not lawyer', async () => {
    await escrow.deposit({from: payer, value: 100});
    assertError(
      escrow.release({from: accounts[5]}),
      'Only lawyer can release funds'
    );
  });

  it('Should release funds', async () => {
    const balanceBefore = await escrow.balanceOf();
    console.log(parseInt(balanceBefore));
    await escrow.release({from: lawyer});
    const balanceAfter = await escrow.balanceOf();
    console.log(parseInt(balanceAfter));
    assert(parseInt(balanceAfter) === 0);
  });

});
