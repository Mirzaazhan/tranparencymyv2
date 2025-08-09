// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CitizenFeedback {
    struct Feedback {
        uint256 id;
        uint256 transactionId;
        address citizen;
        string comment;
        uint8 rating; // 1-5 rating
        uint256 timestamp;
        bool isActive;
    }

    mapping(uint256 => Feedback) public feedbacks;
    mapping(uint256 => uint256[]) public transactionFeedbacks; // transactionId => feedbackIds
    mapping(address => bool) public bannedUsers;
    
    uint256 public feedbackCount;
    address public owner;
    
    event FeedbackSubmitted(
        uint256 indexed feedbackId,
        uint256 indexed transactionId,
        address indexed citizen,
        uint8 rating
    );
    
    event FeedbackRemoved(uint256 indexed feedbackId);
    event UserBanned(address indexed user);
    event UserUnbanned(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier notBanned() {
        require(!bannedUsers[msg.sender], "User is banned from submitting feedback");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function submitFeedback(
        uint256 _transactionId,
        string memory _comment,
        uint8 _rating
    ) public notBanned {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(bytes(_comment).length > 0, "Comment cannot be empty");
        require(bytes(_comment).length <= 500, "Comment too long");
        
        feedbackCount++;
        
        feedbacks[feedbackCount] = Feedback({
            id: feedbackCount,
            transactionId: _transactionId,
            citizen: msg.sender,
            comment: _comment,
            rating: _rating,
            timestamp: block.timestamp,
            isActive: true
        });
        
        transactionFeedbacks[_transactionId].push(feedbackCount);
        
        emit FeedbackSubmitted(feedbackCount, _transactionId, msg.sender, _rating);
    }

    function getFeedback(uint256 _feedbackId) 
        public 
        view 
        returns (Feedback memory) 
    {
        require(_feedbackId > 0 && _feedbackId <= feedbackCount, "Invalid feedback ID");
        return feedbacks[_feedbackId];
    }

    function getTransactionFeedbacks(uint256 _transactionId) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return transactionFeedbacks[_transactionId];
    }

    function getTransactionRating(uint256 _transactionId) 
        public 
        view 
        returns (uint256 averageRating, uint256 totalFeedbacks) 
    {
        uint256[] memory feedbackIds = transactionFeedbacks[_transactionId];
        totalFeedbacks = 0;
        uint256 totalRating = 0;
        
        for (uint256 i = 0; i < feedbackIds.length; i++) {
            if (feedbacks[feedbackIds[i]].isActive) {
                totalRating += feedbacks[feedbackIds[i]].rating;
                totalFeedbacks++;
            }
        }
        
        if (totalFeedbacks > 0) {
            averageRating = (totalRating * 100) / totalFeedbacks; // Return as percentage (e.g., 450 = 4.5 stars)
        } else {
            averageRating = 0;
        }
    }

    function removeFeedback(uint256 _feedbackId) public onlyOwner {
        require(_feedbackId > 0 && _feedbackId <= feedbackCount, "Invalid feedback ID");
        require(feedbacks[_feedbackId].isActive, "Feedback already removed");
        
        feedbacks[_feedbackId].isActive = false;
        emit FeedbackRemoved(_feedbackId);
    }

    function banUser(address _user) public onlyOwner {
        bannedUsers[_user] = true;
        emit UserBanned(_user);
    }

    function unbanUser(address _user) public onlyOwner {
        bannedUsers[_user] = false;
        emit UserUnbanned(_user);
    }

    function isBanned(address _user) public view returns (bool) {
        return bannedUsers[_user];
    }
}