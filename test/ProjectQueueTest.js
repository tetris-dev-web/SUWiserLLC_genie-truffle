const ProjectQueueMock = artifacts.require("ProjectQueueMock");
const ProjectStub = artifacts.require("ProjectStub");

const exceptions = require('./exceptions');
const { parseBN, parseMethod } = require('./parseUtil');

let accounts;
let mQ;
let p1;
let p2;
let p3;
let p4;
let p5;
let p6;

let basicParams = [11, 5, 8, 2, 3];

contract('ProjectQueue', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await mockQ();
  })

  describe('empty', async () => {
    it('returns true when queue is empty', async () => {
      let emptyStatus = await mQ.empty();
      assert.equal(emptyStatus, true, 'did not return true with an empty queue');
    })

    it('returns false when the queue is not empty', async () => {
      await populateQ(basicParams);
      let emptyStatus = await mQ.empty();
      assert.equal(emptyStatus, false, 'did not return false with a populated queue');
    })
  })

  describe('leadingProjectAddr', async () => {
    it('returns the address of the leading project', async () => {
      let leadingAddress = await mQ.leadingProjectAddr();
      assert.equal(leadingAddress, p1.address, 'leading project not returned');
    })
  })

  describe('enqueue', async () => {
    let beforeLen;

    before(async () => {
      beforeLen = await parseMethod(getLength);
      p6 = await addProject(10);
      await mQ.enqueue(p6.address);
    })

    it('adds a new project address to the queue', async () => {
      let afterLen = await parseMethod(getLength);
      assert.equal(afterLen, beforeLen + 1, 'project address not added to the queue');
    })

    it('places the address in the correct position', async () => {
      let position = await getMockPosition(p6.address);
      assert.equal(position, 3, 'project address not placed in the correct position');
    })

    it('maintains the integrity of the other address positions', async () => {
      let position1 = await getMockPosition(p1.address);
      let position2 = await getMockPosition(p2.address);
      let position3 = await getMockPosition(p3.address);
      let position4 = await getMockPosition(p4.address);
      let position5 = await getMockPosition(p5.address);

      assert.equal(position1, 1, 'queue integrity not maintained with new addition');
      assert.equal(position2, 2, 'queue integrity not maintained with new addition');
      assert.equal(position3, 6, 'queue integrity not maintained with new addition');
      assert.equal(position4, 4, 'queue integrity not maintained with new addition');
      assert.equal(position5, 5, 'queue integrity not maintained with new addition');
    })

    it('adds the address to the front of the queue when the queue is empty', async () => {
      await mQ.clearQueue();
      let p6 = await addProject(10);
      await mQ.enqueue(p6.address);
      let position = await getMockPosition(p6.address);
      assert.equal(position, 1, 'address not added to the front of empty queue');
    })
  })

  describe('dequeue', async () => {
    let beforeLen;
    let beforeTop;

    before(async () => {
      await populateQ(basicParams);
      beforeLen = await parseMethod(getLength);
      beforeTop = await mQ.leadingProjectAddr();
      await mQ.dequeue();
    })

    after(async () => {
      await mQ.clearQueue();
    })

    it('removes the leading project from the queue', async () => {
      let afterLen = await parseMethod(getLength);
      let afterTop = await mQ.leadingProjectAddr();
      let position1 = await getMockPosition(p1.address);

      assert.equal(afterLen, beforeLen - 1, 'project address not removed from the queue');
      assert.notEqual(afterTop, beforeTop, 'leading project not changed');
      assert(!position1, 'project address not removed from the queue');
    })

    it('maintains the integrity of the other address positions', async () => {
      let position2 = await getMockPosition(p2.address);
      let position3 = await getMockPosition(p3.address);
      let position4 = await getMockPosition(p4.address);
      let position5 = await getMockPosition(p5.address);

      assert.equal(position3, 1, 'queue integrity not maintained with new addition');
      assert.equal(position2, 2, 'queue integrity not maintained with new addition');
      assert.equal(position5, 3, 'queue integrity not maintained with new addition');
      assert.equal(position4, 4, 'queue integrity not maintained with new addition');
    })
  })

  describe('heapify', async () => {
    describe('when the passed address beats its parent', async () => {
      before(async () => {
        await populateQ([11, 5, 8, 2, 15]);
        await mQ.heapify(p5.address);
      })

      after(async () => {
        await mQ.clearQueue();
      })

      it('moves the address up the appropriate number of positions', async () => {
        let proj5Pos = await getMockPosition(p5.address);
        assert.equal(proj5Pos, 1, 'positions not updated properly');
      })

      it('maintains a heap structure', async () => {
        let proj1Pos = await getMockPosition(p1.address);
        let proj2Pos = await getMockPosition(p2.address);
        let proj3Pos = await getMockPosition(p3.address);
        let proj4Pos = await getMockPosition(p4.address);

        assert.equal(proj1Pos, 2, 'queue integrity not maintained with new addition');
        assert.equal(proj2Pos, 5, 'queue integrity not maintained with new addition');
        assert.equal(proj3Pos, 3, 'queue integrity not maintained with new addition');
        assert.equal(proj4Pos, 4, 'queue integrity not maintained with new addition');
      })
    })

    describe('when the passed address loses to its child', async () => {
      before(async () => {
        await populateQ([11, 1, 8, 2, 3]);
        await mQ.heapify(p2.address);
      })

      it('moves the address down the appropriate number of positions', async () => {
        let proj2Pos = await getMockPosition(p2.address);
        assert.equal(proj2Pos, 5, 'positions not updated properly');
      })

      it('maintains the integrity of the other address positions', async () => {
        let proj1Pos = await getMockPosition(p1.address);
        let proj3Pos = await getMockPosition(p3.address);
        let proj4Pos = await getMockPosition(p4.address);
        let proj5Pos = await getMockPosition(p5.address);

        assert.equal(proj1Pos, 1, 'queue integrity not maintained with new addition');
        assert.equal(proj3Pos, 3, 'queue integrity not maintained with new addition');
        assert.equal(proj4Pos, 4, 'queue integrity not maintained with new addition');
        assert.equal(proj5Pos, 2, 'positions not updated properly');
      })
    })
  })
})

const populateQ = async (params) => {
  p1 = await addProject(params[0]);
  p2 = await addProject(params[1]);
  p3 = await addProject(params[2]);
  p4 = await addProject(params[3]);
  p5 = await addProject(params[4]);

  await mQ.init(p1.address, p2.address, p3.address, p4.address, p5.address);
}

const mockQ = async () => {
  mQ = await ProjectQueueMock.new();
}

const enqueue = async () => {
  await mQ.enqueue()
}

const addProject = async (value) => {
 return await ProjectStub.new(value, 'p1', accounts[0], accounts[1], 1000000, 2000000, 100, 100, '300', '300', value);
}

const getLength = async () => {
  return await mQ.len.call();
}

const getMockPosition = async (address) => {
  let p = await mQ.mockPositionOf.call(address);
  return parseBN(p);
}
