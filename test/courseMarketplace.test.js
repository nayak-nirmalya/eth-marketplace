const CourseMarketplace = artifacts.require('CourseMarketplace')
const { catchRevert } = require('./utils/exceptions')

const getBalance = async (address) => await web3.eth.getBalance(address)
const toBN = (value) => web3.utils.toBN(value)

const getGas = async (result) => {
  const tx = await web3.eth.getTransaction(result.tx)
  const gasUsed = toBN(result.receipt.gasUsed)
  const gasPrice = toBN(tx.gasPrice)
  const gas = gasUsed.mul(gasPrice)

  return gas
}

contract('CourseMarketplace', (accounts) => {
  const courseId = '0x00000000000000000000000000003130'
  const proof =
    '0x0000000000000000000000000000313000000000000000000000000000003130'

  const courseId2 = '0x00000000000000000000000000002130'
  const proof2 =
    '0x0000000000000000000000000000213000000000000000000000000000002130'

  const value = '900000000'

  let _contract = null
  let contractOwner = null
  let buyer = null
  let courseHash = null

  before(async () => {
    _contract = await CourseMarketplace.deployed()
    contractOwner = accounts[0]
    buyer = accounts[1]
  })

  describe('purchase new course', () => {
    before(async () => {
      await _contract.purchaseCourse(courseId, proof, { from: buyer, value })
    })

    it('should not allow to repurchase already owned course', async () => {
      await catchRevert(
        _contract.purchaseCourse(courseId, proof, { from: buyer, value }),
      )
    })

    it('can get purchase course hash by index', async () => {
      const index = 0
      courseHash = await _contract.getCourseHashAtIndex(index)
      const expectedHash = web3.utils.soliditySha3(
        { type: 'bytes16', value: courseId },
        { type: 'address', value: buyer },
      )

      assert.equal(courseHash, expectedHash, 'course has not is matching')
    })

    it('should match the purchased data of the course by buyer', async () => {
      const expectedIndex = 0
      const expectedState = 0
      const course = await _contract.getCourseByHash(courseHash)

      assert.equal(course.id, expectedIndex, 'course index should be 0!')
      assert.equal(course.price, value, `course price should be ${value}!`)
      assert.equal(course.proof, proof, `course proof should be ${proof}!`)
      assert.equal(course.owner, buyer, `course buyer should be ${buyer}!`)
      assert.equal(
        course.state,
        expectedState,
        `course state should be ${expectedState}!`,
      )
    })
  })

  describe('activate the purchased course', () => {
    it('should not be able to activate by NOT contract owner', async () => {
      await catchRevert(_contract.activateCourse(courseHash, { from: buyer }))
    })

    it('should have "activated" state', async () => {
      await _contract.activateCourse(courseHash, { from: contractOwner })
      const course = await _contract.getCourseByHash(courseHash)
      const expectedState = 1

      assert.equal(
        course.state,
        expectedState,
        'course should have "activated" state',
      )
    })
  })

  describe('transfer ownership', () => {
    let currentOwner = null
    before(async () => {
      currentOwner = await _contract.getContractOwner()
    })

    it('getContractOwner should return deployer address', async () => {
      assert.equal(
        contractOwner,
        currentOwner,
        'contract owner is not matching',
      )
    })

    it('should not transfer ownership when contract owner is not sending TX', async () => {
      await catchRevert(
        _contract.transferOwnership(accounts[4], { from: accounts[5] }),
      )
    })

    it("should transfer ownership to 4th address from 'account'", async () => {
      await _contract.transferOwnership(accounts[4], { from: currentOwner })
      const owner = await _contract.getContractOwner()

      assert.equal(owner, accounts[4], 'contract owner transfer failed')
    })

    it('should transfer ownership back to initial contract owner', async () => {
      await _contract.transferOwnership(contractOwner, { from: accounts[4] })
      const owner = await _contract.getContractOwner()

      assert.equal(owner, contractOwner, 'contract owner transfer failed')
    })
  })

  describe('deactivate course', () => {
    let courseHash2 = null
    let currentOwner = null

    before(async () => {
      await _contract.purchaseCourse(courseId2, proof2, { from: buyer, value })
      courseHash2 = await _contract.getCourseHashAtIndex(1)
      currentOwner = await _contract.getContractOwner()
    })

    it('should not be able to deactivate the course by NOT contract owner', async () => {
      await catchRevert(
        _contract.deactivateCourse(courseHash2, {
          from: buyer,
        }),
      )
    })

    it('should have state of deactivated and price 0', async () => {
      const beforeTxBuyerBalance = await getBalance(buyer)
      const beforeTxContractBalance = await getBalance(_contract.address)
      const beforeTxOwnerBalance = await getBalance(currentOwner)

      const result = await _contract.deactivateCourse(courseHash2, {
        from: contractOwner,
      })

      const afterTxBuyerBalance = await getBalance(buyer)
      const afterTxContractBalance = await getBalance(_contract.address)
      const afterTxOwnerBalance = await getBalance(currentOwner)

      const course = await _contract.getCourseByHash(courseHash2)
      const expectedState = 2
      const expectedPrice = 0
      const gas = await getGas(result)

      assert.equal(course.state, expectedState, 'course is NOT deactivated')
      assert.equal(course.price, expectedPrice, 'course price is NOT 0')

      assert.equal(
        toBN(beforeTxOwnerBalance).sub(gas).toString(),
        afterTxOwnerBalance,
        'contract owner balance is not correct',
      )

      assert.equal(
        toBN(beforeTxBuyerBalance).add(toBN(value)).toString(),
        afterTxBuyerBalance,
        'buyer balance is not correct',
      )

      assert.equal(
        toBN(beforeTxContractBalance).sub(toBN(value)).toString(),
        afterTxContractBalance,
        'contract balance is not correct',
      )
    })

    it('should NOT be able to activate deactivated course', async () => {
      await catchRevert(
        _contract.activateCourse(courseHash2, {
          from: contractOwner,
        }),
      )
    })
  })

  describe('repurchase course', () => {
    let courseHash2 = null

    before(async () => {
      courseHash2 = await _contract.getCourseHashAtIndex(1)
    })

    it('should NOT repurchase when the course does not exist', async () => {
      const notExistingHash =
        '0x5ceb3f8075c3dbb5d490c8d1e6c950302ed065e1a9031750ad2c6513069e3fc3'
      await catchRevert(
        _contract.repurchaseCourse(notExistingHash, {
          from: buyer,
        }),
      )
    })

    it('should NOT repurchase with NOT course owner', async () => {
      const notOwnerAddress = accounts[8]
      await catchRevert(
        _contract.repurchaseCourse(courseHash2, {
          from: notOwnerAddress,
        }),
      )
    })

    it('should be able to repurchase with original buyer', async () => {
      const beforeTxBuyerBalance = await getBalance(buyer)
      const beforeTxContractBalance = await getBalance(_contract.address)
      const result = await _contract.repurchaseCourse(courseHash2, {
        from: buyer,
        value,
      })
      const afterTxBuyerBalance = await getBalance(buyer)
      const afterTxContractBalance = await getBalance(_contract.address)

      const gas = await getGas(result)

      const course = await _contract.getCourseByHash(courseHash2)
      const expectedState = 0

      assert.equal(
        course.state,
        expectedState,
        'course is not in purchased state',
      )
      assert.equal(course.price, value, `course price is not equal to ${value}`)

      assert.equal(
        toBN(beforeTxBuyerBalance).sub(toBN(value)).sub(gas).toString(),
        afterTxBuyerBalance,
        'client balance is not correct!',
      )

      assert.equal(
        toBN(beforeTxContractBalance).add(toBN(value)).toString(),
        afterTxContractBalance,
        'contract balance after TX is not correct!',
      )
    })

    it('should NOT repurchase purchased course', async () => {
      await catchRevert(
        _contract.repurchaseCourse(courseHash2, {
          from: buyer,
        }),
      )
    })
  })
})
