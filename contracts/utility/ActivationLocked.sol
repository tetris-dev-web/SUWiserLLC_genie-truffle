pragma solidity >=0.4.22 <0.6.0;

/**
 * @title ActivaitonAccess
 * @dev A ActivaitonAccess contract can only be used by its activation account (the one that created it)
 */
contract ActivationLocked {
    address private _activation;

    event ActivationTransferred(
        address recipient
    );

    /**
     * @dev Sets the activation account to the one that is creating the ActivaitonLocked contract.
     */
    constructor () internal {
        _activation = msg.sender;
        emit ActivationTransferred(_activation);
    }

    /**
     * @dev Reverts if called from any account other than the activation.
     */
    modifier onlyActivation() {
        require(msg.sender == _activation);
        _;
    }

    /**
     * @return the address of the activation.
     */
    function activation() public view returns (address) {
        return _activation;
    }

    /**
     * @dev Transfers contract to a new activation.
     * @param recipient The address of new activation.
     */
    function transferActivationKey(address recipient) public onlyActivation {
        require(recipient != address(0));
        _activation = recipient;
        emit ActivationTransferred(_activation);
    }
}
