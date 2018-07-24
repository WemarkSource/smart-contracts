const isEventTriggered = require('./utils/utils').isEventTriggered;
const WemarkToken = artifacts.require('WemarkToken.sol');

contract('WemarkToken - Burnable', (accounts) => {
    let token;
    const owner = accounts[1];

    beforeEach(async function() {
        token = await WemarkToken.new();
        await token.transfer(owner, 500);
    });

    it('should burn owner\'s tokens', async () => {
        const amountToBurn = 100;
        const initTotalSupply = (await token.totalSupply()).toNumber();
        const initBalance = (await token.balanceOf(owner)).toNumber();
        const {logs} = await token.burn(amountToBurn, { from: owner });
        const postTotalSupply = (await token.totalSupply()).toNumber();
        const postBalance = (await token.balanceOf(owner)).toNumber();

        assert.equal(!!isEventTriggered(logs, 'Burned'), true, 'Burn event was not emitted');
        assert.equal(!!isEventTriggered(logs, 'Transfer'), true, 'Transfer event was not emitted');
        assert.equal(postTotalSupply, initTotalSupply - amountToBurn, 'Initial supply should be reduced on burn');
        assert.equal(postBalance, initBalance - amountToBurn, 'Balance should be reduced on burn');
    });

    it('should fail while trying to burn more tokens than in balance', async () => {
        const initTotalSupply = (await token.totalSupply()).toNumber();
        const initBalance = (await token.balanceOf(owner)).toNumber();

        try {
            await token.burn(501, { from: owner });
            assert.equal(true, false, 'burn should throw');
        } catch (error) {}

        const postTotalSupply = (await token.totalSupply()).toNumber();
        const postBalance = (await token.balanceOf(owner)).toNumber();

        assert.equal(postTotalSupply, initTotalSupply, 'Initial supply should not be affected');
        assert.equal(postBalance, initBalance, 'Balance should not be affected');
    });

    it('should fail while trying to burn others balance', async () => {
        const initTotalSupply = (await token.totalSupply()).toNumber();
        const initBalance = (await token.balanceOf(owner)).toNumber();

        try {
            await token.burn(100);
            assert.equal(true, false, 'burn should throw');
        } catch (error) {}

        const postTotalSupply = (await token.totalSupply()).toNumber();
        const postBalance = (await token.balanceOf(owner)).toNumber();

        assert.equal(postTotalSupply, initTotalSupply, 'Initial supply should not be affected');
        assert.equal(postBalance, initBalance, 'Balance should not be affected');
    });
});
