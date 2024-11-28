const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { num, yesterday } = require('./util');
const { fetchBalanceHeadless } = require('./fetch-balance');
const { client_email, private_key, sheet_id } = require('./sheets.json');

const jsonParser = bodyParser.json();

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
        const overnight = yesterday().toLocaleDateString('en-AU');

        const { availableBalance, credits } = await fetchBalanceHeadless(overnight);

        const totalCredits = credits.reduce((total, current) => total + parseFloat(current.replace(/[,\$]/g, '')), 0);
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
