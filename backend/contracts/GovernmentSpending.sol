// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GovernmentSpending {
    struct Transaction {
        uint256 id;
        string department;
        string projectName;
        string projectType;
        uint256 budgetAllocated;
        uint256 amountSpent;
        string location;
        string description;
        uint256 timestamp;
        address recordedBy;
        bool isActive;
    }

    struct Department {
        string name;
        string nameMs;
        bool isActive;
    }

    mapping(uint256 => Transaction) public transactions;
    mapping(string => Department) public departments;
    mapping(address => bool) public authorizedOfficials;
    
    uint256 public transactionCount;
    string[] public departmentList;
    
    address public owner;
    
    event TransactionRecorded(
        uint256 indexed transactionId,
        string department,
        string projectName,
        uint256 budgetAllocated,
        uint256 amountSpent
    );
    
    event DepartmentAdded(string departmentId, string name, string nameMs);
    event OfficialAuthorized(address official);
    event OfficialRevoked(address official);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedOfficials[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedOfficials[msg.sender] = true;
        
        // Initialize Malaysian government departments
        _addDepartment("MOH", "Ministry of Health", "Kementerian Kesihatan");
        _addDepartment("MOE", "Ministry of Education", "Kementerian Pendidikan");
        _addDepartment("MOT", "Ministry of Transport", "Kementerian Pengangkutan");
        _addDepartment("MOF", "Ministry of Finance", "Kementerian Kewangan");
        _addDepartment("MOD", "Ministry of Defence", "Kementerian Pertahanan");
        _addDepartment("MOHA", "Ministry of Home Affairs", "Kementerian Dalam Negeri");
        _addDepartment("MOSTI", "Ministry of Science, Technology and Innovation", "Kementerian Sains, Teknologi dan Inovasi");
        _addDepartment("MOTAC", "Ministry of Tourism, Arts and Culture", "Kementerian Pelancongan, Seni dan Budaya");
    }

    function addDepartment(string memory _id, string memory _name, string memory _nameMs) 
        public 
        onlyOwner 
    {
        _addDepartment(_id, _name, _nameMs);
    }

    function _addDepartment(string memory _id, string memory _name, string memory _nameMs) 
        private 
    {
        require(!departments[_id].isActive, "Department already exists");
        
        departments[_id] = Department({
            name: _name,
            nameMs: _nameMs,
            isActive: true
        });
        
        departmentList.push(_id);
        emit DepartmentAdded(_id, _name, _nameMs);
    }

    function recordTransaction(
        string memory _department,
        string memory _projectName,
        string memory _projectType,
        uint256 _budgetAllocated,
        uint256 _amountSpent,
        string memory _location,
        string memory _description
    ) public onlyAuthorized {
        require(departments[_department].isActive, "Invalid department");
        require(_budgetAllocated > 0, "Budget must be greater than 0");
        require(_amountSpent <= _budgetAllocated, "Amount spent cannot exceed budget");
        
        transactionCount++;
        
        transactions[transactionCount] = Transaction({
            id: transactionCount,
            department: _department,
            projectName: _projectName,
            projectType: _projectType,
            budgetAllocated: _budgetAllocated,
            amountSpent: _amountSpent,
            location: _location,
            description: _description,
            timestamp: block.timestamp,
            recordedBy: msg.sender,
            isActive: true
        });

        emit TransactionRecorded(
            transactionCount,
            _department,
            _projectName,
            _budgetAllocated,
            _amountSpent
        );
    }

    function updateTransactionSpending(uint256 _transactionId, uint256 _newAmountSpent) 
        public 
        onlyAuthorized 
    {
        require(_transactionId > 0 && _transactionId <= transactionCount, "Invalid transaction ID");
        require(transactions[_transactionId].isActive, "Transaction is not active");
        require(_newAmountSpent <= transactions[_transactionId].budgetAllocated, "Amount cannot exceed budget");
        
        transactions[_transactionId].amountSpent = _newAmountSpent;
        
        emit TransactionRecorded(
            _transactionId,
            transactions[_transactionId].department,
            transactions[_transactionId].projectName,
            transactions[_transactionId].budgetAllocated,
            _newAmountSpent
        );
    }

    function getTransaction(uint256 _transactionId) 
        public 
        view 
        returns (Transaction memory) 
    {
        require(_transactionId > 0 && _transactionId <= transactionCount, "Invalid transaction ID");
        return transactions[_transactionId];
    }

    function getDepartment(string memory _departmentId) 
        public 
        view 
        returns (Department memory) 
    {
        return departments[_departmentId];
    }

    function getAllDepartments() public view returns (string[] memory) {
        return departmentList;
    }

    function authorizeOfficial(address _official) public onlyOwner {
        authorizedOfficials[_official] = true;
        emit OfficialAuthorized(_official);
    }

    function revokeOfficial(address _official) public onlyOwner {
        require(_official != owner, "Cannot revoke owner");
        authorizedOfficials[_official] = false;
        emit OfficialRevoked(_official);
    }

    function getTotalSpendingByDepartment(string memory _department) 
        public 
        view 
        returns (uint256 totalBudget, uint256 totalSpent) 
    {
        for (uint256 i = 1; i <= transactionCount; i++) {
            if (transactions[i].isActive && 
                keccak256(abi.encodePacked(transactions[i].department)) == 
                keccak256(abi.encodePacked(_department))) {
                totalBudget += transactions[i].budgetAllocated;
                totalSpent += transactions[i].amountSpent;
            }
        }
    }

    function getTransactionsByDateRange(uint256 _startTime, uint256 _endTime) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory tempIds = new uint256[](transactionCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= transactionCount; i++) {
            if (transactions[i].isActive && 
                transactions[i].timestamp >= _startTime && 
                transactions[i].timestamp <= _endTime) {
                tempIds[count] = i;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempIds[i];
        }
        
        return result;
    }
}