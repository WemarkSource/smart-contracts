const config = require('../config');
const ether = require('./utils/utils').ether;
const WemarkToken = artifacts.require('WemarkToken.sol');

contract('WemarkToken', (accounts) => {
    let token;

    it('should get deployed token instance', async () => {
        token = await WemarkToken.new({ from: accounts[0] });
        assert.equal(!!token, true, 'Contract instance failed to initialized');
    });

    it('should make sure token is not released', async () => {
        const released = await token.released.call();
        assert.equal(released.valueOf(), false, 'Token is releasable, although it should not be');
    });

    it('should make sure account one is a transfer agent by default', async () => {
        const account_one = accounts[0];
        const isAccountOneTransferAgent = await token.transferAgents.call(account_one);

        assert.equal(isAccountOneTransferAgent, true, 'Account 1 is not a transfer agent, although it should be');
    });

    it('should remove account one from transfer agents', async () => {
        const account_one = accounts[0];

        try {
            await token.setTransferAgent(account_one, false, { from: account_one });
            assert.equal(true, true, 'setTransferAgent called successfully');
        } catch (error) {
            assert.equal(true, false, 'setTransferAgent call failed');
        }

        try {
            const isTransferAgent = await token.transferAgents.call(account_one);
            assert.equal(isTransferAgent, false, 'Account should not be transfer agent');
        } catch (error) {
            assert.equal(true, false, 'transferAgents call failed');
        }
    });

    it('should throw on token transfer while token is not released yet', async () => {
        // Get initial balances of first and second account.
        const account_one = accounts[0];
        const account_two = accounts[1];
        const amount = 10;

        const account_one_starting_balance = (await token.balanceOf.call(account_one)).toNumber();
        const account_two_starting_balance = (await token.balanceOf.call(account_two)).toNumber();

        assert.equal(account_one_starting_balance, ether(config.TOKEN_TOTAL_SUPPLY).toNumber(), 'Account 1 has incorrect starting balance');
        assert.equal(account_two_starting_balance, 0, 'Account 2 has incorrect starting balance');

        try {
            await token.transfer(account_two, amount, { from: account_one });
        } catch (error) {
            const account_one_ending_balance = (await token.balanceOf.call(account_one)).toNumber();
            const account_two_ending_balance = (await token.balanceOf.call(account_two)).toNumber();

            assert.equal(account_one_ending_balance, account_one_starting_balance, 'Account 1 has incorrect end balance');
            assert.equal(account_two_ending_balance, account_two_starting_balance, 'Account 2 has incorrect end balance');

            return;
        }

        assert.equal(true, false, 'transfer did not throw as expected');
    });

    it('should allow only account one to transfer by adding it as a transfer agent', async () => {
        const account_one = accounts[0];

        try {
            await token.setTransferAgent(account_one, true, { from: account_one });
            assert.equal(true, true, 'setTransferAgent called successfully');
        } catch (error) {
            assert.equal(true, false, 'setTransferAgent failed');
        }
    });

    it('should transfer correctly', async () => {
        // Get initial balances of first and second account.
        const account_one = accounts[0];
        const account_two = accounts[1];
        const amount = 10;

        const account_one_starting_balance = (await token.balanceOf.call(account_one)).toNumber();
        const account_two_starting_balance = (await token.balanceOf.call(account_two)).toNumber();

        const tx = await token.transfer(account_two, amount, { from: account_one });

        const account_one_ending_balance = (await token.balanceOf.call(account_one)).toNumber();
        const account_two_ending_balance = (await token.balanceOf.call(account_two)).toNumber();

        assert.equal(tx.receipt.gasUsed < 55000, true, 'Transfer gas is too much: ' + tx.receipt.gasUsed);
        assert.equal(tx.receipt.cumulativeGasUsed < 55000, true, 'Transfer gas is too much');
        assert.equal(account_one_ending_balance, account_one_starting_balance - amount, 'Amount wasn\'t correctly taken from the sender');
        assert.equal(account_two_ending_balance, account_two_starting_balance + amount, 'Amount wasn\'t correctly sent to the receiver');
    });

    it('should abort transfer when sender has not enough balance', async () => {
        // Get initial balances of first and second account.
        const account_two = accounts[1];
        const account_three = accounts[2];

        const account_two_starting_balance = (await token.balanceOf.call(account_two)).toNumber();
        const account_three_starting_balance = (await token.balanceOf.call(account_three)).toNumber();

        assert.equal(account_two_starting_balance, 10, 'Account 2 starting balance has wrong amount of ether');
        assert.equal(account_three_starting_balance, 0, 'Account 3 starting balance has wrong amount of ether');

        try {
            await token.transfer(account_three, 11, { from: account_two });
            assert.equal(true, false, 'Transfer succeeded although it should have failed');
        } catch(err) {}

        const account_two_ending_balance = (await token.balanceOf.call(account_two)).toNumber();
        const account_three_ending_balance = (await token.balanceOf.call(account_three)).toNumber();

        assert.equal(account_two_ending_balance, account_two_starting_balance, 'Amount given to receiver even though it should have failed');
        assert.equal(account_three_ending_balance, account_three_starting_balance, 'Amount taken from sender even though it should have failed');
    });

    it('should transferFrom correctly', async () => {
        const account_one = accounts[0];
        const account_two = accounts[1];
        const amount = 20;

        const account_two_starting_balance = (await token.balanceOf.call(account_two)).toNumber();

        await token.approve(account_two, amount, { from: account_one });
        await token.transferFrom(account_one, account_two, amount, { from: account_two });

        const account_two_ending_balance = (await token.balanceOf.call(account_two)).toNumber();

        assert.equal(account_two_ending_balance, account_two_starting_balance + amount, 'Amount wasn\'t correctly transferred');
    });

    it('should abort transferFrom when spender has not enough allowance', async () => {
        const account_one = accounts[0];
        const account_two = accounts[1];
        const amount = 20;

        await token.approve(account_two, amount, { from: account_one });

        try {
            await token.transferFrom(account_one, account_two, amount + 1, { from: account_two });
            assert.equal(true, false, 'transferFrom did NOT throw as expected');
        } catch (err) {
            assert.equal(true, true, 'transferFrom did throw as expected');
        }
    });

    it('should release token', async () => {
        const account_one = accounts[0];

        try {
            const is_token_released = await token.released();

            assert.equal(is_token_released, false, 'Token should NOT be released');
        } catch (error) {
            assert.equal(true, false, 'released() failed');
        }

        try {
            await token.setReleaseAgent(account_one, { from: account_one });
            assert.equal(true, true, 'setReleaseAgent called successfully');
        } catch (error) {
            assert.equal(true, false, 'setReleaseAgent failed');
        }

        try {
            await token.releaseTokenTransfer({ from: account_one });
            assert.equal(true, true, 'releaseTokenTransfer called successfully');
        } catch (error) {
            assert.equal(true, false, 'releaseTokenTransfer failed');
        }

        try {
            const is_token_released = await token.released();

            assert.equal(is_token_released, true, 'Token should be released');
        } catch (error) {
            assert.equal(true, false, 'released() failed');
        }
    });
});
