import bodyParser from 'body-parser';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Application, NextFunction } from 'express';
import { num, yesterday } from './util';
import { fetchBalanceHeadless } from './fetch-balance';
import sheetsConfig from './sheets.json';

const { client_email, private_key, sheet_id } = sheetsConfig;
const jsonParser = bodyParser.json();

export default function (app: Application) {
    let doc: GoogleSpreadsheet | undefined;

    const ensureDoc = async () => {
        if (!doc) {
            const auth = new JWT({
                email: client_email,
                key: private_key,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            const newDoc = new GoogleSpreadsheet(sheet_id, auth);

            await newDoc.loadInfo();

            doc = newDoc;
        }
    };

    const getData = async (sheet: any) => {
        const rows = await sheet.getRows();

        const data = {
            start: rows[0].get('Date').split('/').reverse().join('-'),
            daily: rows.map((row: any) => [num(row.get('Available')), num(row.get('Credit'))])
        };

        return data;
    };

    app.get('/api/data', async (_, res, next: NextFunction) => {
        try {
            await ensureDoc();

            const sheet = doc!.sheetsByTitle['Current'];
            const data = await getData(sheet);

            res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.post('/api/data/fetch-balance', async (_, res, next: NextFunction) => {
        try {
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
        } catch (err) {
            next(err);
        }
    });

    app.post('/api/data/add', jsonParser, async (req, res, next: NextFunction) => {
        try {
            await ensureDoc();

            const sheet = doc!.sheetsByTitle['Current'];

            await sheet.addRow(req.body);

            res.end();
        } catch (err) {
            next(err);
        }
    });
};
