const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { client_email, private_key, sheet_id } = require('./sheets.json');

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

    app.get('/api/data', async (_, res) => {
        await ensureDoc();

        const sheet = doc.sheetsByTitle.Current;

        const rows = await sheet.getRows();

        const data = {
            start: rows[0].Date.split('/').reverse().join('-'),
            daily: rows.map(({ Available, Credit }) => [num(Available), num(Credit)])
        };

        res.json(data);
    });

    app.post('/api/data/add', jsonParser, async (req, res) => {
        await ensureDoc();

        const sheet = doc.sheetsByTitle.Current;

        await sheet.addRow(req.body);

        res.end();
    });
};
