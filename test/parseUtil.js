const parseBN = (bigNumber) => {
  return bigNumber.toNumber();
}

const parseMethod = async (method) => {
  let result = await method();
  return parseBN(result);
}

const parseWithArg = async (method, arg) => {
  let balance = await method(arg);
  return parseBN(balance);
}

const weiBalanceOf = async (account) => {
  let wei = await web3.eth.getBalance(account);
  return Number(wei);
}

module.exports = {
  parseBN,
  parseMethod,
  parseWithArg,
  weiBalanceOf
}
