import { chromium, BrowserContext, Page } from 'playwright';
import accountConfig from './account.json';

const { homePage, accessNumber, accountName } = accountConfig;

interface BalanceResult {
    availableBalance: string;
    credits: string[];
}

export async function fetchBalance(context: BrowserContext, page: Page, overnight: string): Promise<BalanceResult> {
    await page.goto(homePage);

    // Open Internet Banking
    await page.locator('div[data-analytics-nav="logon-dd"] button').click();

    const [popup] = await Promise.all([
        context.waitForEvent('page'),
        page.locator('.visible-lg a:has-text("Internet Banking")').click()
    ]);

    await popup.waitForLoadState();

    const securityNumber = process.env.SECURITY_NUMBER;
    const internetPassword = process.env.INTERNET_PASSWORD;

    if (!securityNumber || !internetPassword) {
        throw new Error('SECURITY_NUMBER and INTERNET_PASSWORD environment variables must be set');
    }

    // Logon
    await popup.fill('#access-number', accessNumber);
    await popup.fill('#securityNumber', securityNumber);
    await popup.fill('#internet-password', internetPassword);
    await popup.locator('#logonButton').click();

    await popup.waitForLoadState();

    const errorMsgBlock = popup.locator('#errorMsgBlock');

    if (await errorMsgBlock.count()) {
        const logonFailed = (await errorMsgBlock.textContent())!
            .includes('One or more of the input details are invalid');

        if (logonFailed) {
            throw new Error('Logon failed');
        }
    }

    // Find the account by name
    const account = popup.locator(`[data-acctalias="${accountName}"]`).first();

    // Extract the available balance
    const availableBalance = (await account.locator('.balance-details .available-balance + dd').textContent())!.trim();

    // Navigate to account details
    await account.locator('a').click();
    await popup.waitForLoadState();

    // Extract any overnight payments
    const credits = await popup.locator('#transaction-7days tr.select-row').evaluateAll(
        (rows: HTMLElement[], overnight: string): string[] => {
            const DATE_CELL = 0;
            const DESCRIPTION_CELL = 1;
            const CREDIT_CELL = 4;

            return rows
                .map(row => Array.from(row.querySelectorAll('td')).map(cell => (cell as HTMLElement).innerText.replace(/[\r\n\t]/g, '').trim()))
                .filter(cells => cells[DATE_CELL] === overnight && cells[DESCRIPTION_CELL] === 'Payment - BPAY')
                .map(cells => cells[CREDIT_CELL]);
        }, overnight
    );

    // Close banking
    const closed = popup.waitForEvent('close');

    await popup.locator('p.logout a').click();
    await closed;

    return { availableBalance, credits };
}

export async function fetchBalanceHeadless(overnight: string): Promise<BalanceResult> {
    const browser = await chromium.launch({ headless: true });

    try {
        const context = await browser.newContext();
        const page = await context.newPage();

        return await fetchBalance(context, page, overnight);
    } finally {
        await browser.close();
    }
}
