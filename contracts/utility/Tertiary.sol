pragma solidity >=0.4.22 <0.6.0;

/**
 * @title Tertiary
 * @dev A Tertiary contract can only be used by its tertiary account (the one that created it)
 */
contract Tertiary {
    address private _tertiary;

    event TertiaryTransferred(
        address recipient
    );

    /**
     * @dev Sets the tertiary account to the one that is creating the Tertiary contract.
     */
    constructor () internal {
        _tertiary = msg.sender;
        emit TertiaryTransferred(_tertiary);
    }

    /**
     * @dev Reverts if called from any account other than the tertiary.
     */
    modifier onlyTertiary() {
        require(msg.sender == _tertiary);
        _;
    }

    /**
     * @return the address of the tertiary.
     */
    function tertiary() public view returns (address) {
        return _tertiary;
    }

    /**
     * @dev Transfers contract to a new tertiary.
     * @param recipient The address of new tertiary.
     */
    function transferTertiary(address recipient) public onlyTertiary {
        require(recipient != address(0));
        _tertiary = recipient;
        emit TertiaryTransferred(_tertiary);
    }
}
