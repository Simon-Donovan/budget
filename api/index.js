const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { client_email, private_key, sheet_id } = require('./sheets.json');
const { fetchBalanceHeadless } = require('./fetch-balance');

const jsonParser = bodyParser.json();

const num = val => val ? +val : 0;

module.exports = function (app) {
    let doc;

    const ensureDoc = async () => {
        if (!doc) {
            doc = new GoogleSpreadsheet(sheet_id);

            await doc.useServiceAccountAuth({ client_email, private_key });
            await doc.loadInfo();
        }
    };

    const getData = async (sheet) => {
        const rows = await sheet.getRows();

        const data = {
            start: rows[0].Date.split('/').reverse().join('-'),
            daily: rows.map(({ Available, Credit }) => [num(Available), num(Credit)])
        };

        return data;
    };

    app.get('/api/data', async (_, res) => {
        await ensureDoc();

        const sheet = doc.sheetsByTitle.Current;
        const data = await getData(sheet);

        res.json(data);
    });

    app.post('/api/data/fetch-balance', async (_, res) => {
        const today = new Date().toLocaleDateString('en-AU');
        const { availableBalance, credits } = await fetchBalanceHeadless(today);
        const totalCredits = credits.reduce((total, current) => total + current.replace(/[,\$]/g, ''), 0);
        const newRow = [
            today,
            availableBalance.replace(/[,\$]/g, ''),
            totalCredits ? totalCredits.toFixed(2) : ''
        ];

        await ensureDoc();

        const sheet = doc.sheetsByTitle.Current;

        await sheet.addRow(newRow);

        const data = await getData(sheet);

        res.json(data);
    });

    app.post('/api/data/add', jsonParser, async (req, res) => {
        await ensureDoc();

        const sheet = doc.sheetsByTitle.Current;

        await sheet.addRow(req.body);

        res.end();
    });
};
