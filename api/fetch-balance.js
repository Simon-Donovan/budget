const { chromium } = require('playwright');
const { homePage, accessNumber, accountName } = require('./account.json');

const DATE_CELL = 0;
const DESCRIPTION_CELL = 1;
const CREDIT_CELL = 4;

async function fetchBalance(context, page, today) {
    await page.goto(homePage);

    // Open Internet Banking
    await page.locator('div[data-analytics-nav="logon-dd"] button').click();

    const [popup] = await Promise.all([
        context.waitForEvent('page'),
        page.locator('.visible-lg a:has-text("Internet Banking")').click()
    ]);

    await popup.waitForLoadState();

    // Logon
    await popup.fill('#access-number', accessNumber);
    await popup.fill('#securityNumber', process.env.SECURITY_NUMBER || '0000');
    await popup.fill('#internet-password', process.env.INTERNET_PASSWORD || 'not-found');
    await popup.locator('#logonButton').click();

    await popup.waitForLoadState();

    const errorMsgBlock = popup.locator('#errorMsgBlock');

    if (await errorMsgBlock.count()) {
        const logonFailed = (await errorMsgBlock.textContent())?.includes('One or more of the input details are invalid');

        if (logonFailed) {
            throw new Error('Logon failed');
        }
    }

    // Find the account by name
    const account = popup.locator(`[data-acctalias="${accountName}"]`).first();

    // Extract the available balance
    const availableBalance = (await account.locator('.balance-details .available-balance + dd').textContent()).trim();

    // Navigate to account details
    await account.locator('a').click();
    await popup.waitForLoadState();

    // Extract any credits for today
    const credits = await page.locator('tr.select-row').evaluateAll(rows => {
        return rows
            .map(row => {
                const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim());
                return cells;
            })
            .filter(cells => cells[DATE_CELL] === today && cells[DESCRIPTION_CELL] === 'Payment - BPAY')
            .map(cells => cells[CREDIT_CELL]);
    });

    // Close banking
    const closed = popup.waitForEvent('close');

    await popup.locator('p.logout a').click();
    await closed;

    return { availableBalance, credits };
}

async function fetchBalanceHeadless(today) {
    const browser = await chromium.launch({ headless: true });

    try {
        const context = await browser.newContext();
        const page = await context.newPage();

        return await fetchBalance(context, page, today);
    } finally {
        await browser.close();
    }
}

module.exports = {
    fetchBalance,
    fetchBalanceHeadless
};
