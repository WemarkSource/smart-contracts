module.exports = {
    ether(n) {
        return new web3.BigNumber(web3.toWei(n, 'ether'))
    },
    isEventTriggered(logs, eventName) {
        return logs.find(e => e.event === eventName);
    }
};