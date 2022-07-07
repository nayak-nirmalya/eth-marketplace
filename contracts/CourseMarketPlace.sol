// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CourseMarketPlace {
    enum State {
        Purchased,
        Activated,
        Deactivated
    }

    struct Course {
        uint256 id;
        uint256 price;
        bytes32 proof;
        address owner;
        State state;
    }

    // mapping of courseHash to Course data
    mapping (bytes32 => Course) private ownedCourses;

    // mapping of courseId to courseHash
    mapping (uint256 => bytes32) private ownedCourseHash;

    // number of all courses + id of course
    uint256 private totalOwnedCourses;

    address payable private owner;

    constructor() {
        setContractOwner(msg.sender);
    }

    /// Course has already a Owner!
    error CourseHasOwner();

    /// Only owner has an access!
    error OnlyOwner();

    // modifiers
    modifier onlyOwner() {
        if (msg.sender != getContractOwner()) {
            revert OnlyOwner();
        }
        _;
    }

    function purchaseCourse(
        bytes16 courseId,
        bytes32 proof
    )
        external
        payable
    {
        bytes32 courseHash = keccak256(abi.encodePacked(courseId, msg.sender));

        if (hasCourseOwnership(courseHash)) {
            revert CourseHasOwner();
        }

        uint256 id = totalOwnedCourses++;
        ownedCourseHash[id] = courseHash;
        ownedCourses[courseHash] = Course({
            id: id,
            price: msg.value,
            proof: proof,
            owner: msg.sender,
            state: State.Purchased
        });
    }

    function transferOwnership(address newOwner)
        external
        onlyOwner
    {
        setContractOwner(newOwner);
    }

    function getCourseCount() 
        external 
        view 
        returns (uint256) 
    {
        return totalOwnedCourses;
    }

    function getCourseHashAtIndex(uint256 index) 
        external 
        view 
        returns (bytes32) 
    {
        return ownedCourseHash[index];
    }

    function getCourseByHash(bytes32 courseHash) 
        external 
        view 
        returns (Course memory)
    {
        return ownedCourses[courseHash];
    }

    function getContractOwner()
        public
        view
        returns (address) 
    {
        return owner;
    }

    function setContractOwner(address newOwner) private {
        owner = payable(newOwner);
    }

    function hasCourseOwnership(bytes32 courseHash) 
        private
        view
        returns (bool) 
    {
        return ownedCourses[courseHash].owner == msg.sender;
    }
}
