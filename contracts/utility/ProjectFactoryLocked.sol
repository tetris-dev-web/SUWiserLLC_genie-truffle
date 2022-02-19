pragma solidity >=0.4.22 <0.6.0;

/**
 * @title ProjectFactoryLocked
 * @dev A ProjectFactoryLocked contract can only be used by its projectFactory account (the one that created it)
 */
contract ProjectFactoryLocked {
    address private _projectFactory;

    event ProjectFactoryTransferred(
        address recipient
    );

    /**
     * @dev Sets the projectFactory account to the one that is creating the ProjectFactoryLocked contract.
     */
    constructor () internal {
        _projectFactory = msg.sender;
        emit ProjectFactoryTransferred(_projectFactory);
    }

    /**
     * @dev Reverts if called from any account other than the projectFactory.
     */
    modifier onlyProjectFactory() {
        require(msg.sender == _projectFactory);
        _;
    }

    /**
     * @return the address of the projectFactory.
     */
    function projectFactory() public view returns (address) {
        return _projectFactory;
    }

    /**
     * @dev Transfers contract to a new projectFactory.
     * @param recipient The address of new projectFactory.
     */
    function transferProjectFactoryKey(address recipient) public onlyProjectFactory {
        require(recipient != address(0));
        _projectFactory = recipient;
        emit ProjectFactoryTransferred(_projectFactory);
    }
}
