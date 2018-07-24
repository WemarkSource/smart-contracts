const ether = require('./utils/utils').ether;
const WemarkToken = artifacts.require('WemarkToken.sol');

contract('WemarkToken - Vested', (accounts) => {
    let token;
    const account_one = accounts[0];
    const account_two = accounts[1];
    const account_four = accounts[3];
    const account_five = accounts[4];
    const account_six = accounts[5];

    before('should get deployed token instance', async () => {
        token = await WemarkToken.new({ from: account_one });
        await token.setReleaseAgent(account_one, { from: account_one });
        await token.releaseTokenTransfer({ from: account_one });

        assert.equal(!!token, true, 'Contract instance failed to initialized');
    });

    it('should grant tokens in vesting and reflect in balance', async () => {
        const amount = ether(100);
        const now = new Date().getTime();
        const cliff = now + (1000 * 60 * 5); // 5 minutes from now
        const vesting = now + (1000 * 60 * 10); // 10 minutes from now
        const account_four_starting_balance = (await token.balanceOf.call(account_four));

        try {
            await token.grantVestedTokens(account_four, amount, now, cliff, vesting, true, false, { from: account_one });
        } catch (error) {
            assert.equal(true, false, 'grantVestedTokens did throw NOT as expected');
        }

        const account_four_end_balance = (await token.balanceOf.call(account_four)).toNumber();

        assert.equal(account_four_starting_balance, 0, 'Account 4 starting balance should be 0');
        assert.equal(account_four_end_balance, account_four_starting_balance.plus(amount).toNumber(), 'Amount wasn\'t correctly granted to account 4');
    });

    it('should fail while trying to transfer non vested tokens', async () => {
        const amount = ether(10);
        const account_two_starting_balance = (await token.balanceOf.call(account_two)).toNumber();
        const account_four_starting_balance = (await token.balanceOf.call(account_four)).toNumber();

        assert.equal(account_two_starting_balance, 0, 'Account 2 starting balance has wrong amount of ether');
        assert.equal(account_four_starting_balance, ether(100), 'Account 3 starting balance has wrong amount of ether');

        try {
            await token.transfer(account_two, amount, { from: account_four });
        } catch(err) {
            const account_two_ending_balance = (await token.balanceOf.call(account_two)).toNumber();
            const account_three_ending_balance = (await token.balanceOf.call(account_four)).toNumber();

            assert.equal(account_two_ending_balance, account_two_starting_balance, 'Amount given to receiver even though it should have failed');
            assert.equal(account_three_ending_balance, account_four_starting_balance, 'Amount taken from sender even though it should have failed');

            return;
        }

        assert.equal(true, false, 'Transfer succeeded although it should have failed');
    });

    it('should revoke token grant', async () => {
        const grantId = 0;
        const grants_count_before_revoke = (await token.tokenGrantsCount(account_four)).toNumber();

        try {
            await token.revokeTokenGrant(account_four, grantId, { from: account_one });
        } catch(err) {
            assert.equal(true, false, 'revokeTokenGrant did throw NOT as expected');
        }

        const grants_count_after_revoke = (await token.tokenGrantsCount(account_four)).toNumber();
        const account_four_end_balance = (await token.balanceOf.call(account_four)).toNumber();

        assert.equal(grants_count_before_revoke, 1, 'Account 4 should have 1 grants before revoke');
        assert.equal(grants_count_after_revoke, 0, 'Account 4 should have 0 grants after revoke');
        assert.equal(account_four_end_balance, 0, 'Account 4 should have 0 tokens');
    });

    it('should grant tokens and transfer after they are vested', async () => {
        const amount = ether(100);
        const now = 100; // Somewhere in the 70's
        const cliff = now + 500;
        const vesting = cliff + 500;
        const account_two_starting_balance = (await token.balanceOf.call(account_two));
        const account_four_starting_balance = (await token.balanceOf.call(account_four)).toNumber();

        try {
            await token.grantVestedTokens(account_four, amount, now, cliff, vesting, true, false, { from: account_one });
        } catch (error) {
            console.error(error);
            assert.equal(true, false, 'grantVestedTokens did throw NOT as expected');
        }

        const transferable_tokens = (await token.transferableTokens(account_four, new Date().getTime())).toNumber();
        const account_four_balance = (await token.balanceOf.call(account_four)).toNumber();

        assert.equal(account_four_balance, amount, 'Account 4 balance is incorrect');
        assert.equal(transferable_tokens, amount, 'All granted tokens should be transferable');

        try {
            await token.transfer(account_two, amount, { from: account_four });
        } catch (error) {
            console.error(error);
            assert.equal(true, false, 'transfer failed');
        }

        const account_two_after_transfer_balance = (await token.balanceOf.call(account_two)).toNumber();
        const account_four_after_transfer_balance = (await token.balanceOf.call(account_four)).toNumber();

        assert.equal(account_two_after_transfer_balance, account_two_starting_balance.plus(amount).toNumber(), 'Amount wasn\'t correctly transferred to account 2');
        assert.equal(account_four_after_transfer_balance, account_four_starting_balance, 'Amount wasn\'t correctly transferred from account 4');
    });

    it('should grant tokens and check transferable tokens amount a few times when start equals to cliff time', async () => {
        const amount = ether(100);
        const now = Date.now();
        const cliff = now + 1000;
        const vesting = cliff + 5000;

        try {
            await token.grantVestedTokens(account_five, amount, cliff, cliff, vesting, true, false, { from: account_one });
        } catch (error) {
            console.error(error);
            assert.equal(true, false, 'grantVestedTokens did throw NOT as expected');
        }

        const transferable_before_cliff = (await token.transferableTokens(account_five, now + 999)).toNumber();
        const transferable_20_percent = (await token.transferableTokens(account_five, cliff + 1000)).toNumber();
        const transferable_50_percent = (await token.transferableTokens(account_five, cliff + 2500)).toNumber();
        const transferable_80_percent = (await token.transferableTokens(account_five, cliff + 4000)).toNumber();
        const transferable_100_percent = (await token.transferableTokens(account_five, cliff + 5000)).toNumber();
        const transferable_after_vesting = (await token.transferableTokens(account_five, cliff + 50000)).toNumber();

        assert.equal(transferable_before_cliff, 0, 'Transferable tokens before cliff is incorrect');
        assert.equal(transferable_20_percent, ether(20).toNumber(), 'Transferable tokens is not 20% as expected');
        assert.equal(transferable_50_percent, ether(50).toNumber(), 'Transferable tokens is not 50% as expected');
        assert.equal(transferable_80_percent, ether(80).toNumber(), 'Transferable tokens is not 80% as expected');
        assert.equal(transferable_100_percent, ether(100).toNumber(), 'Transferable tokens is not 100% as expected');
        assert.equal(transferable_after_vesting, ether(100).toNumber(), 'Transferable tokens after vesting is not as expected');
    });

    it('should grant tokens and check transferable tokens amount a few times when start and cliff time are different', async () => {
        const amount = ether(100);
        const now = Date.now();
        const cliff = now + 1000;
        const vesting = cliff + 4000;

        try {
            await token.grantVestedTokens(account_six, amount, now, cliff, vesting, true, false, { from: account_one });
        } catch (error) {
            console.error(error);
            assert.equal(true, false, 'grantVestedTokens did throw NOT as expected');
        }

        const transferable_before_cliff = (await token.transferableTokens(account_six, now + 999)).toNumber();
        const transferable_20_percent = (await token.transferableTokens(account_six, now + 1000)).toNumber();
        const transferable_50_percent = (await token.transferableTokens(account_six, now + 2500)).toNumber();
        const transferable_80_percent = (await token.transferableTokens(account_six, now + 4000)).toNumber();
        const transferable_100_percent = (await token.transferableTokens(account_six, now + 5000)).toNumber();
        const transferable_after_vesting = (await token.transferableTokens(account_six, now + 50000)).toNumber();

        assert.equal(transferable_before_cliff, 0, 'Transferable tokens before cliff is incorrect');
        assert.equal(transferable_20_percent, ether(20).toNumber(), 'Transferable tokens is not 20% as expected');
        assert.equal(transferable_50_percent, ether(50).toNumber(), 'Transferable tokens is not 50% as expected');
        assert.equal(transferable_80_percent, ether(80).toNumber(), 'Transferable tokens is not 80% as expected');
        assert.equal(transferable_100_percent, ether(100).toNumber(), 'Transferable tokens is not 100% as expected');
        assert.equal(transferable_after_vesting, ether(100).toNumber(), 'Transferable tokens after vesting is not as expected');
    });
});