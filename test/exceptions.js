const PREFIX = "VM Exception while processing transaction: ";

const testException = async (promise, message) => {
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one");
        assert(error.message.startsWith(PREFIX + message), "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
    }
};

module.exports = {
    catchRevert            : async function(promise) {await testException(promise, "revert"             );},
    catchOutOfGas          : async function(promise) {await testException(promise, "out of gas"         );},
    catchInvalidJump       : async function(promise) {await testException(promise, "invalid JUMP"       );},
    catchInvalidOpcode     : async function(promise) {await testException(promise, "invalid opcode"     );},
    catchStackOverflow     : async function(promise) {await testException(promise, "stack overflow"     );},
    catchStackUnderflow    : async function(promise) {await testException(promise, "stack underflow"    );},
    catchStaticStateChange : async function(promise) {await testException(promise, "static state change");},
};
