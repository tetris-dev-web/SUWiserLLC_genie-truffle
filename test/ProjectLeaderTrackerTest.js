const ProjectLeaderTrackerMock = artifacts.require('ProjectLeaderTrackerMock');
const ProjectStub = artifacts.require('ProjectStub');
const exceptions = require('./exceptions');
const { parseBN, parseMethod, weiBalanceOf } = require('./parseUtil');

let accounts;
let mPLT;
let projStub1;
let projStub2;
let projStub3;

contract('ProjectLeaderTracker', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
    await initProjectStubs();
  });

  describe('trackProject', async () => {
    describe('when sent an active project', async () => {
      before(async () => {
        await projStub2.setStubActiveStatus(true);
      });

      after(async () => {
        await projStub2.setStubActiveStatus(false);
      });

      it('reverts', async () => {
        await exceptions.catchRevert(mPLT.trackProject(projStub2.address));
      });
    });

    describe('when sent an inactive project', async () => {
      before(async () => {
        await projStub1.setMockVotes(4000000);
      });

      describe('when there is no tentativeLeaderAddr', async () => {
        describe('when there is only one project', async () => {
          let initialCheckedCount;
          before(async () => {
            await mPLT.resetMockTentativeProject();
            initialCheckedCount = await parseMethod(mPLT.totalChecked);
            await mPLT.setStubCandidateCount(1);
            await mPLT.setMockTotalChecked(0);
            await mPLT.trackProject(projStub1.address);
          });

          after(async () => {
            await mPLT.resetMockTentativeProject();
          });

          it('sets the project as the new tentative leader', async () => {
            let tlAddr = await mPLT.tentativeLeaderAddr();

            assert.equal(tlAddr, projStub1.address, 'tentativeLeaderAddr not assigned properly');
          });

          it('sets tentativeLeaderConfirmed to true', async () => {
            let tlConfirmed = await mPLT.mockTentativeLeaderConfirmed.call();
            assert.equal(tlConfirmed, true, 'tentative leader should be confirmed');
          });

          it('increments the total number of projects checked by 1', async () => {
            let finalCheckedCount = await parseMethod(mPLT.totalChecked);
            assert.equal(
              finalCheckedCount,
              initialCheckedCount + 1,
              'total projects checked not incremented by 1',
            );
          });

          it('sets the projects checked status to true', async () => {
            let checkedStatus = await mPLT.checkedStatusOf(projStub1.address);
            assert.equal(checkedStatus, true, 'checked status of project notset to true');
          });

          it('sets the leadingVoteCount to the projects totalVoteCount', async () => {
            let leadingVoteCount = await parseMethod(mPLT.leadingVoteCount);
            assert.equal(
              leadingVoteCount,
              4000000,
              'leadingVoteCount should be set to the projects totalVoteCount',
            );
          });
        });

        describe('when there are multiple projects', async () => {
          let initialCheckedCount;
          before(async () => {
            initialCheckedCount = await parseMethod(mPLT.totalChecked);
            await mPLT.setStubCandidateCount(2);
            await mPLT.trackProject(projStub1.address);
          });

          after(async () => {
            await mPLT.resetMockTentativeProject();
          });

          it('sets the project as the new tentative leader', async () => {
            let tlAddr = await mPLT.tentativeLeaderAddr();

            assert.equal(tlAddr, projStub1.address, 'tentativeLeaderAddr not assigned properly');
          });

          it('sets tentativeLeaderConfirmed to false', async () => {
            let tlConfirmed = await mPLT.mockTentativeLeaderConfirmed.call();
            assert.equal(tlConfirmed, false, 'tentative leader should not be confirmed');
          });

          it('increments the total number of projects checked by 1', async () => {
            let finalCheckedCount = await parseMethod(mPLT.totalChecked);
            assert.equal(
              finalCheckedCount,
              initialCheckedCount + 1,
              'total projects checked not incremented by 1',
            );
          });

          it('sets the projects checked status to true', async () => {
            let checkedStatus = await mPLT.checkedStatusOf(projStub1.address);
            assert.equal(checkedStatus, true, 'checked status of project notset to true');
          });

          it('sets the leadingVoteCount to the projects totalVoteCount', async () => {});
        });
      });

      describe('when the project has more votes than the tentative leader', async () => {
        before(async () => {
          await projStub2.setMockVotes(5000000);
        });
        describe('when it is the final project to be checked', async () => {
          let initialCheckedCount;
          before(async () => {
            await mPLT.setMockTentativeLeader(projStub1.address); //we might want to pass votes explicitly into this function
            await projStub1.setStubOpenStatus(true);
            await mPLT.setStubCandidateCount(2);
            await mPLT.setMockTotalChecked(1);
            initialCheckedCount = await parseMethod(mPLT.totalChecked);
            await mPLT.trackProject(projStub2.address);
          });
          after(async () => {
            await mPLT.resetMockTentativeProject();
          });

          it('sets the project as the new tentative leader', async () => {
            let tlAddr = await mPLT.tentativeLeaderAddr();

            assert.equal(tlAddr, projStub2.address, 'tentativeLeaderAddr not assigned properly');
          });

          it('sets tentativeLeaderConfirmed to true', async () => {
            let tlConfirmed = await mPLT.mockTentativeLeaderConfirmed.call();
            assert.equal(tlConfirmed, true, 'tentative leader should be confirmed');
          });

          it('increments the total number of projects checked by 1', async () => {
            let finalCheckedCount = await parseMethod(mPLT.totalChecked);
            assert.equal(
              finalCheckedCount,
              initialCheckedCount + 1,
              'total projects checked not incremented by 1',
            );
          });

          it('sets the projects checked status to true', async () => {
            let checkedStatus = await mPLT.checkedStatusOf(projStub2.address);
            assert.equal(checkedStatus, true, 'checked status of project notset to true');
          });

          it('sets the leadingVoteCount to the projects totalVoteCount', async () => {
            let leadingVoteCount = await parseMethod(mPLT.leadingVoteCount);
            assert.equal(
              leadingVoteCount,
              5000000,
              'leadingVoteCount should be set to the projects totalVoteCount',
            );
          });
        });

        describe('when there are more projects to be checked', async () => {
          //we need for when the leader has been confirmed in addition to when it has not been
          let initialCheckedCount;
          before(async () => {
            await mPLT.setMockTentativeLeader(projStub1.address);
            await projStub1.setStubOpenStatus(true);
            await mPLT.setStubCandidateCount(3);
            await mPLT.setMockTotalChecked(1);
            initialCheckedCount = await parseMethod(mPLT.totalChecked);
            await mPLT.trackProject(projStub2.address);
          });

          after(async () => {
            await mPLT.resetMockTentativeProject();
          });

          it('sets the project as the new tentative leader', async () => {
            let tlAddr = await mPLT.tentativeLeaderAddr();

            assert.equal(tlAddr, projStub2.address, 'tentativeLeaderAddr not assigned properly');
          });

          it('sets tentativeLeaderConfirmed to false', async () => {
            let tlConfirmed = await mPLT.mockTentativeLeaderConfirmed.call();
            assert.equal(tlConfirmed, false, 'tentative leader should not be confirmed');
          });

          it('increments the total number of projects checked by 1', async () => {
            let finalCheckedCount = await parseMethod(mPLT.totalChecked);
            assert.equal(
              finalCheckedCount,
              initialCheckedCount + 1,
              'total projects checked not incremented by 1',
            );
          });

          it('sets the projects checked status to true', async () => {
            let checkedStatus = await mPLT.checkedStatusOf(projStub2.address);
            assert.equal(checkedStatus, true, 'checked status of project notset to true');
          });

          it('sets the leadingVoteCount to the projects totalVoteCount', async () => {
            let leadingVoteCount = await parseMethod(mPLT.leadingVoteCount);
            assert.equal(
              leadingVoteCount,
              5000000,
              'leadingVoteCount should be set to the projects totalVoteCount',
            );
          });
        });
      });

      describe('when the tentative leader has closed', async () => {
        before(async () => {
          await mPLT.setMockTentativeLeader(projStub1.address);
          await projStub1.setStubOpenStatus(false);
          await mPLT.setStubCandidateCount(3);
          await projStub3.setMockVotes(2000000);
          await mPLT.trackProject(projStub3.address);
        });

        after(async () => {
          await mPLT.resetMockTentativeProject();
        });

        it('sets the project as the new tentative leader', async () => {
          let tlAddr = await mPLT.tentativeLeaderAddr();

          assert.equal(tlAddr, projStub3.address, 'tentativeLeaderAddr not assigned properly');
        });

        it('sets tentativeLeaderConfirmed to false', async () => {
          let tlConfirmed = await mPLT.mockTentativeLeaderConfirmed.call();
          assert.equal(tlConfirmed, false, 'tentative leader should not be confirmed');
        });

        it('sets the projects checked status to true', async () => {
          let checkedStatus = await mPLT.checkedStatusOf(projStub3.address);
          assert.equal(checkedStatus, true, 'checked status of project notset to true');
        });

        it('sets the total number of projects checked to 1', async () => {
          let finalCheckedCount = await parseMethod(mPLT.totalChecked);
          assert.equal(finalCheckedCount, 1, 'total projects checked should be 2');
        });

        it('sets the leadingVoteCount to the projects totalVoteCount', async () => {
          let leadingVoteCount = await parseMethod(mPLT.leadingVoteCount);
          assert.equal(
            leadingVoteCount,
            2000000,
            'leadingVoteCount should be set to the projects totalVoteCount',
          );
        });
      });

      describe('when the project is the tentative leader', async () => {
        describe('when the leader has lost votes', async () => {
          before(async () => {
            await mPLT.setMockTentativeLeader(projStub1.address);
            await mPLT.setMockLeadingVoteCount(1000000);
            await projStub1.setStubOpenStatus(true);
            await projStub1.setMockVotes(500000);
            await mPLT.trackProject(projStub1.address);
          });

          after(async () => {
            await mPLT.resetMockTentativeProject();
          });

          it('maintains the current tentativeLeader', async () => {
            let tlAddr = await mPLT.tentativeLeaderAddr();

            assert.equal(tlAddr, projStub1.address, 'tentativeLeaderAddr not assigned properly');
          });

          it('sets tentativeLeaderConfirmed to false', async () => {
            let tlConfirmed = await mPLT.mockTentativeLeaderConfirmed.call();
            assert.equal(tlConfirmed, false, 'tentative leader should not be confirmed');
          });

          it('sets the projects checked status to true', async () => {
            let checkedStatus = await mPLT.checkedStatusOf(projStub1.address);
            assert.equal(checkedStatus, true, 'project should be recored as checked');
          });

          it('sets the total number of projects checked to 1', async () => {
            let finalCheckedCount = await parseMethod(mPLT.totalChecked);
            assert.equal(finalCheckedCount, 1, 'total projects checked should be 1');
          });

          it('sets the leadingVoteCount to the projects totalVoteCount', async () => {
            let leadingVoteCount = await parseMethod(mPLT.leadingVoteCount);
            assert.equal(
              leadingVoteCount,
              500000,
              'leadingVoteCount should be set to the projects totalVoteCount',
            );
          });
        });

        describe('when the leader has gained votes', async () => {
          describe('when the tentative leader is confirmed', async () => {
            before(async () => {
              await mPLT.setMockTentativeLeader(projStub1.address);
              await mPLT.setMockLeadingVoteCount(1000000);
              await projStub1.setStubOpenStatus(true);
              await projStub1.setMockVotes(2000000);
              await mPLT.setMockCheckedStatus(projStub1.address, true);
              await mPLT.setStubCandidateCount(5);
              await mPLT.setMockTotalChecked(5);
              await mPLT.trackProject(projStub1.address);
            });

            after(async () => {
              await mPLT.resetMockTentativeProject();
            });

            it('updates the leadingVoteCount', async () => {
              let leadingVoteCount = await parseMethod(mPLT.leadingVoteCount);
              assert.equal(
                leadingVoteCount,
                2000000,
                'leadingVoteCount should be set to the projects totalVoteCount',
              );
            });

            it('maintains a confirmed leader', async () => {
              let tlStatus = await mPLT.mockTentativeLeaderConfirmed.call();
              assert.equal(tlStatus, true, 'leader should remain confirmed');
            });

            it('maintains the current tentativeLeader', async () => {
              let tlAddr = await mPLT.tentativeLeaderAddr();
              assert.equal(tlAddr, projStub1.address, 'tentativeLeaderAddr not assigned properly');
            });

            it('maintains the projects checked status as true', async () => {
              let checkedStatus = await mPLT.checkedStatusOf(projStub1.address);
              assert.equal(checkedStatus, true, 'project should be recored as checked');
            });

            it('maintains the number of projects checked', async () => {
              let finalCheckedCount = await parseMethod(mPLT.totalChecked);
              assert.equal(finalCheckedCount, 5, 'total projects checked should not change');
            });
          });

          describe('when the tentative leader is not confirmed', async () => {
            before(async () => {
              await mPLT.setMockTentativeLeader(projStub1.address);
              await mPLT.setMockLeadingVoteCount(1000000);
              await projStub1.setStubOpenStatus(true);
              await projStub1.setMockVotes(2000000);
              await mPLT.setMockCheckedStatus(projStub1.address, true);
              await mPLT.setStubCandidateCount(5);
              await mPLT.setMockTotalChecked(3);
              await mPLT.trackProject(projStub1.address);
            });

            it('updates the leadingVoteCount', async () => {
              let leadingVoteCount = await parseMethod(mPLT.leadingVoteCount);
              assert.equal(
                leadingVoteCount,
                2000000,
                'leadingVoteCount should be set to the projects totalVoteCount',
              );
            });

            it('maintains an unconfirmed leader', async () => {
              let tlStatus = await mPLT.mockTentativeLeaderConfirmed.call();
              assert.equal(tlStatus, false, 'leader should remain unconfirmed');
            });

            it('maintains the current tentativeLeader', async () => {
              let tlAddr = await mPLT.tentativeLeaderAddr();
              assert.equal(tlAddr, projStub1.address, 'tentativeLeaderAddr not assigned properly');
            });

            it('maintains the projects checked status as true', async () => {
              let checkedStatus = await mPLT.checkedStatusOf(projStub1.address);
              assert.equal(checkedStatus, true, 'project should be recored as checked');
            });

            it('maintains the number of projects checked', async () => {
              let finalCheckedCount = await parseMethod(mPLT.totalChecked);
              assert.equal(finalCheckedCount, 3, 'total projects checked should not change');
            });
          });
        });
      });

      describe('when the tentative leader cannot be updated', async () => {
        before(async () => {
          await projStub1.setStubOpenStatus(true);
        });

        describe('when it is the final project to be checked', async () => {
          before(async () => {
            await mPLT.setMockTentativeLeader(projStub1.address);
            await mPLT.setStubCandidateCount(3);
            await mPLT.setMockTotalChecked(2);
            await mPLT.trackProject(projStub3.address);
          });

          after(async () => {
            await mPLT.resetMockTentativeProject();
          });

          it('sets the projects checked status to true', async () => {
            let checkedStatus = await mPLT.checkedStatusOf(projStub3.address);
            assert.equal(checkedStatus, true, 'checked status of project notset to true');
          });

          it('increments the total number of projects checked by 1', async () => {
            let finalCheckedCount = await parseMethod(mPLT.totalChecked);
            assert.equal(finalCheckedCount, 3, 'total projects checked not incremented by 1');
          });

          it('sets tentativeLeaderConfirmed to true', async () => {
            let tlConfirmed = await mPLT.mockTentativeLeaderConfirmed.call();
            assert.equal(tlConfirmed, true, 'tentative leader should be confirmed');
          });
        });

        describe('when there are more projects to be checked', async () => {
          before(async () => {
            await mPLT.setMockTentativeLeader(projStub1.address);
            await mPLT.setStubCandidateCount(3);
            await mPLT.setMockTotalChecked(1);
            await mPLT.trackProject(projStub3.address);
          });

          after(async () => {
            await mPLT.resetMockTentativeProject();
          });

          it('sets the projects checked status to true', async () => {
            let checkedStatus = await mPLT.checkedStatusOf(projStub3.address);
            assert.equal(checkedStatus, true, 'checked status of project notset to true');
          });

          it('increments the total number of projects checked by 1', async () => {
            let finalCheckedCount = await parseMethod(mPLT.totalChecked);
            assert.equal(finalCheckedCount, 2, 'total projects checked not incremented by 1');
          });

          it('sets tentativeLeaderConfirmed to false', async () => {
            let tlConfirmed = await mPLT.mockTentativeLeaderConfirmed.call();
            assert.equal(tlConfirmed, false, 'tentative leader should not be confirmed');
          });
        });
      });
    });
  });

  describe('handleProjectActivation', async () => {
    describe('when sent by the owner', async () => {
      before(async () => {
        //set the candidate count
        //set all the projects to checked
        //set the checked count to the number of projects
        //this will confirm the tentative leader
        await mPLT.setStubCandidateCount(3);
        await mPLT.setMockTotalChecked(3);
        await mPLT.setMockCheckedStatus(projStub1.address, true);
        await mPLT.setMockCheckedStatus(projStub2.address, true);
        await mPLT.setMockCheckedStatus(projStub3.address, true);
        await mPLT.setMockLeadingVoteCount(1000000);
        await mPLT.handleProjectActivation();
      });

      after(async () => {
        await mPLT.resetMockTentativeProject();
      });
      //sets all the projects to unchecked
      it('unchecks all of the projects', async () => {
        let proj1Status = await mPLT.checkedStatusOf.call(projStub1.address);
        let proj2Status = await mPLT.checkedStatusOf.call(projStub2.address);
        let proj3Status = await mPLT.checkedStatusOf.call(projStub3.address);
        let totalChecked = await parseMethod(mPLT.totalChecked);

        assert.equal(totalChecked, 0, 'all projects should be unchecked');
        assert.equal(proj1Status, false, 'all projects should be unchecked');
        assert.equal(proj2Status, false, 'all projects should be unchecked');
        assert.equal(proj3Status, false, 'all projects should be unchecked');
      });

      //makes the tentative leader unconfirmed
      it('sets the tentative leader status to unconfirmed', async () => {
        let tlStatus = await mPLT.mockTentativeLeaderConfirmed.call();
        assert.equal(tlStatus, false, 'tentativeLeader should be unconfirmed');
      });
      //makes the tentative leader address 0
      it('sets the tentativeLeaderAddr to address(0)', async () => {
        let tentativeLeaderAddr = await mPLT.tentativeLeaderAddr();
        assert.equal(
          tentativeLeaderAddr,
          '0x0000000000000000000000000000000000000000',
          'tentativeLeader address should be address(0)',
        );
      });
      //makes the leading vote count 0
      it('sets the leadingVoteCount to 0', async () => {
        let leadingVoteCount = await mPLT.leadingVoteCount();
        assert.equal(leadingVoteCount, 0, 'leading vote count should be 0');
      });
      //decrements the candidate count
      it('decrements the candidate count by 1', async () => {
        let candidateCount = await parseMethod(mPLT.candidateCount);
        assert.equal(candidateCount, 2, 'candidate count should decrement by 1');
      });
    });

    describe('when sent by another account', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(mPLT.handleProjectActivation({ from: accounts[1] }));
      });
    });
  });

  describe('handleProjectPitch', async () => {
    describe('when sent by the owner', async () => {
      before(async () => {
        await mPLT.setStubCandidateCount(3);
        await mPLT.handleProjectPitch();
      });

      it('increments the candidateCount by 1', async () => {
        let candidateCount = await parseMethod(mPLT.candidateCount);
        assert.equal(candidateCount, 4, 'candidateCount should increase by 1');
      });
    });

    describe('when sent by another account', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(mPLT.handleProjectPitch({ from: accounts[1] }));
      });
    });
  });

  describe('tentativeLeader', async () => {
    let tentativeLeader;
    before(async () => {
      await mPLT.setMockTentativeLeader(projStub1.address);
      await mPLT.setStubCandidateCount(3);
      await mPLT.setMockTotalChecked(3);
      tentativeLeader = await mPLT.tentativeLeader();
    });

    it('returns the tentativeLeaderAddr', async () => {
      let address = tentativeLeader[0];
      assert.equal(address, projStub1.address, 'should return the tentativeLeaderAddr');
    });

    it('returns the tentativeLeaderConfirmed status', async () => {
      let confirmedStatus = tentativeLeader[1];
      assert.equal(confirmedStatus, true, 'should return tentativeLeadeConfirmed status');

      await mPLT.setStubCandidateCount(3);
      await mPLT.setMockTotalChecked(2);
      tentativeLeader = await mPLT.tentativeLeader();
      confirmedStatus = tentativeLeader[1];
      assert.equal(confirmedStatus, false, 'should return tentativeLeadeConfirmed status');
    });
  });
});

const setUp = async () => {
  mPLT = await ProjectLeaderTrackerMock.new();
};

const initProjectStubs = async () => {
  projStub1 = await ProjectStub.new(
    'project1',
    accounts[1],
    accounts[2],
    4000000,
    2000000,
    200000000,
    100000000,
    '340',
    '340',
    75000000,
  );

  await projStub1.setStubOpenStatus(true);

  projStub2 = await ProjectStub.new(
    'project2',
    accounts[1],
    accounts[2],
    3000000,
    1000000,
    150000000,
    50000000,
    '340',
    '340',
    50000000,
  );

  await projStub2.setStubOpenStatus(true);

  projStub3 = await ProjectStub.new(
    'project3',
    accounts[1],
    accounts[2],
    4000000,
    2000000,
    200000000,
    100000000,
    '340',
    '340',
    75000000,
  );

  await projStub3.setStubOpenStatus(true);
};
