const CourseMarketPlace = artifacts.require('CourseMarketPlace')

module.exports = function (deployer) {
  deployer.deploy(CourseMarketPlace)
}
