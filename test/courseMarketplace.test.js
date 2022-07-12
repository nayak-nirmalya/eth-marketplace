const CourseMarketplace = artifacts.require('CourseMarketplace')
const { catchRevert } = require('./utils/exceptions')

contract('CourseMarketplace', (accounts) => {
  const courseId = '0x00000000000000000000000000003130'
  const proof =
    '0x0000000000000000000000000000313000000000000000000000000000003130'
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
})
