pragma solidity >=0.4.22 <0.6.0;

/**
 * @title VotingLocked
 * @dev A VotingLocked contract can only be used by its voting account (the one that created it)
 */
contract VotingLocked {
    address private _voting;

    event VotingTransferred(
        address recipient
    );

    /**
     * @dev Sets the voting account to the one that is creating the VotingLocked contract.
     */
    constructor () internal {
        _voting = msg.sender;
        emit VotingTransferred(_voting);
    }

    /**
     * @dev Reverts if called from any account other than the voting.
     */
    modifier onlyVoting() {
        require(msg.sender == _voting);
        _;
    }

    /**
     * @return the address of the voting.
     */
    function voting() public view returns (address) {
        return _voting;
    }

    /**
     * @dev Transfers contract to a new voting.
     * @param recipient The address of new voting.
     */
    function transferVotingKey(address recipient) public onlyVoting {
        require(recipient != address(0));
        _voting = recipient;
        emit VotingTransferred(_voting);
    }
}
