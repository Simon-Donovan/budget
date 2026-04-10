import { test } from '@playwright/test';
import { yesterday } from '../api/util';
import { fetchBalance } from '../api/fetch-balance';

test('get current balance', async ({ context, page }) => {
    const overnight = yesterday().toLocaleDateString('en-AU');
    const { availableBalance, credits } = await fetchBalance(context, page, overnight);

    console.log('Available Balance:', availableBalance);
    console.log(`Credits for ${overnight}`, credits);
    console.log('All done');
});
