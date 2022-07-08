const CourseMarketplace = artifacts.require('CourseMarketplace')

module.exports = function (deployer) {
  deployer.deploy(CourseMarketplace)
}
