const InvestorListMock = artifacts.require('InvestorListMock');
const exceptions = require('./exceptions');

let accounts;
let inst;

contract('InvestorList', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  });

  describe('investorCount', async () => {
    it('returns the length of the list', async () => {
      let count = await inst.investorCount();
      assert.equal(count, 1, 'wrong length returned');
    });
  });

  describe('addInvestor', async () => {
    describe('when the sender is authorized', async () => {
      it('does not duplicate an investor that is already on the list', async () => {
        let initialInvestorCountBN = await inst.investorCount();
        let initialInvestorCount = initialInvestorCountBN.toNumber();
        await inst.addInvestor(accounts[1]);
        let finalInvestorCountBN = await inst.investorCount();
        let finalInvestorCount = finalInvestorCountBN.toNumber();

        assert.equal(
          initialInvestorCount,
          finalInvestorCount,
          'investor list length should not change',
        );
      });

      it('adds new investors to the list', async () => {
        let initialInvestorCountBN = await inst.investorCount();
        let initialInvestorCount = initialInvestorCountBN.toNumber();

        await inst.addInvestor(accounts[2]);

        let finalInvestorCountBN = await inst.investorCount();
        let finalInvestorCount = finalInvestorCountBN.toNumber();
        // let investorAddress = await inst.addrById(2);

        assert.equal(
          finalInvestorCount,
          initialInvestorCount + 1,
          'investor list length not incremented',
        );
        // assert.equal(investorAddress, accounts[2], 'investor addresses or id not added');
      });
    });

    describe('when the sender is not authorized', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(inst.addInvestor(accounts[3], { from: accounts[1] }));
      });
    });
  });

  describe('addVoteCredit', async () => {
    describe('when the sender is authorized', async () => {
      it('adds votes to the investors voteCredit', async () => {
        await inst.addVoteCredit(accounts[1], 2000);
        let voteCredit = await inst.getVoteCredit(accounts[1]);
        assert.equal(voteCredit, 7000, 'vote credit not added properly');
      });
    });

    describe('when the sender is not authorized', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(inst.addVoteCredit(accounts[1], 2000, { from: accounts[1] }));
      });
    });
  });

  describe('removeVoteCredit', async () => {
    describe('when the sender is not authorized', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(
          inst.removeVoteCredit(accounts[1], 2000, { from: accounts[1] }),
        );
      });
    });

    describe('when the sender is authorized', async () => {
      it('adds votes to the investors voteCredit', async () => {
        await inst.removeVoteCredit(accounts[1], 2000);
        let voteCredit = await inst.getVoteCredit(accounts[1]);
        assert.equal(voteCredit, 5000, 'vote credit not removed properly');
      });
    });
  });
});

const setUp = async () => {
  inst = await InvestorListMock.new();
  await inst.addTestInvestor(accounts[1], 5000);
};
