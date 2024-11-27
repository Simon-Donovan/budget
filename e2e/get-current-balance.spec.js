const { test } = require('@playwright/test');
const { fetchBalance } = require('../api/fetch-balance');

test('get current balance', async ({ context, page }) => {
    const today = new Date().toLocaleDateString('en-AU');
    const { availableBalance, credits } = await fetchBalance(context, page, today);

    console.log('Available Balance:', availableBalance);
    console.log(`Credits for ${today}`, credits);
    console.log('All done');
});
