const AmendmentMock = artifacts.require('AmendmentMock');
const exceptions = require('./exceptions');
let accounts;
let amendment;

contract('Amendment', async (_accounts) => {
  accounts = _accounts;
  before(async () => {
    amendment = await AmendmentMock.new(true);
  });

  describe('addCoAmendment', async () => {
    describe('when the sender is the owner', async () => {
      describe('when co amenments can still be added', async () => {
        let totalCoAmendmentsT1;
        before(async () => {
          totalCoAmendmentsT1 = await amendment.totalCoAmendments.call();
          await amendment.addCoAmendment(accounts[1], { from: accounts[0] });
        });

        after(async () => {
          await amendment.resetAmendmentById(1);
        });

        it('increments totalCoAmendments by 1', async () => {
          const totalCoAmendmentsT2 = await amendment.totalCoAmendments.call();
          assert.equal(
            Number(totalCoAmendmentsT2),
            Number(totalCoAmendmentsT1) + 1,
            'totalCoAmendments should increment by 1',
          );
        });

        it('stores the coAmendment', async () => {
          const coAmendment = await amendment.amendmentById(1);
          assert.equal(coAmendment, accounts[1]);
        });
      });
      describe('when co amendments can not longer be added', async () => {
        before(async () => {
          await amendment.setFinishedAddingCoAmendments(true);
        });

        after(async () => {
          await amendment.setFinishedAddingCoAmendments(false);
        });

        it('reverts', async () => {
          await exceptions.catchRevert(
            amendment.addCoAmendment(accounts[1], { from: accounts[0] }),
          );
        });
      });
    });
    describe('when the sender is not the owner', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(amendment.addCoAmendment(accounts[1], { from: accounts[2] }));
      });
    });
  });

  describe('stopAddingCoAmendments', async () => {
    describe('when the sender is the owner', async () => {
      before(async () => {
        await amendment.setFinishedAddingCoAmendments(false);
        await amendment.stopAddingCoAmendments({ from: accounts[0] });
      });
      after(async () => {
        await amendment.setFinishedAddingCoAmendments(false);
      });

      it('sets finishedAddingCoAmendments to true', async () => {
        const finishedAddingCoAmendments = await amendment.finishedAddingCoAmendments.call();
        assert(finishedAddingCoAmendments, 'adding co amendments should be finished');
      });
    });

    describe('when the sender is not the owner', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(amendment.stopAddingCoAmendments({ from: accounts[1] }));
      });
    });
  });

  describe('modifyAmendment', async () => {
    describe('when the sender is the owner', async () => {
      let coAmendmentT1;
      before(async () => {
        coAmendmentT1 = await amendment.amendmentById(1);
        await amendment.modifyAmendment(1, accounts[1]);
      });

      it('modifies the coAmendment indicated by the passed id', async () => {
        const coAmendmentT2 = await amendment.amendmentById(1);
        assert.equal(
          coAmendmentT2,
          accounts[1],
          'coAmendment should be equal to the passed amendment',
        );
        assert(coAmendmentT2 !== coAmendmentT1, 'coAmendment should be modified');
      });
    });

    describe('when the sender is not the owner', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(
          amendment.modifyAmendment(1, accounts[1], { from: accounts[1] }),
        );
      });
    });
  });
});
