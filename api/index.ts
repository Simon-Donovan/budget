import bodyParser from 'body-parser';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { Application } from 'express';
import { num, yesterday } from './util';
import { fetchBalanceHeadless } from './fetch-balance';
import sheetsConfig from './sheets.json';

const { client_email, private_key, sheet_id } = sheetsConfig;
const jsonParser = bodyParser.json();

export default function (app: Application) {
    let doc: GoogleSpreadsheet | undefined;

    const ensureDoc = async () => {
        if (!doc) {
            doc = new GoogleSpreadsheet(sheet_id);

            await doc.useServiceAccountAuth({ client_email, private_key });
            await doc.loadInfo();
        }
    };

    const getData = async (sheet: any) => {
        const rows = await sheet.getRows();

        const data = {
            start: rows[0].Date.split('/').reverse().join('-'),
            daily: rows.map(({ Available, Credit }: { Available: string; Credit: string }) => [num(Available), num(Credit)])
        };

        return data;
    };

    app.get('/api/data', async (_, res) => {
        await ensureDoc();

        const sheet = doc!.sheetsByTitle['Current'];
        const data = await getData(sheet);

        res.json(data);
    });

    app.post('/api/data/fetch-balance', async (_, res) => {
        const today = new Date().toLocaleDateString('en-AU');
        const overnight = yesterday().toLocaleDateString('en-AU');

        const { availableBalance, credits } = await fetchBalanceHeadless(overnight);

        const totalCredits = credits.reduce((total, current) => total + parseFloat(current.replace(/[,$]/g, '')), 0);
        const newRow = [
            today,
            availableBalance.replace(/[,$]/g, ''),
            totalCredits ? totalCredits.toFixed(2) : ''
        ];

        await ensureDoc();

        const sheet = doc!.sheetsByTitle['Current'];

        await sheet.addRow(newRow);

        const data = await getData(sheet);

        res.json(data);
    });

    app.post('/api/data/add', jsonParser, async (req, res) => {
        await ensureDoc();

        const sheet = doc!.sheetsByTitle['Current'];

        await sheet.addRow(req.body);

        res.end();
    });
};
