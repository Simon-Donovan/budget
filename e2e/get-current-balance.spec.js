const { test } = require('@playwright/test');
const { yesterday } = require('../api/util');
const { fetchBalance } = require('../api/fetch-balance');

test('get current balance', async ({ context, page }) => {
    const overnight = yesterday().toLocaleDateString('en-AU');
    const { availableBalance, credits } = await fetchBalance(context, page, overnight);

    console.log('Available Balance:', availableBalance);
    console.log(`Credits for ${overnight}`, credits);
    console.log('All done');
});
