const express = require('express');
const open = require('open');
const apiSetup = require('./api');

const app = express();
const port = 3000;

app.use(express.static('build'));
apiSetup(app);

app.listen(port, () => {
    console.log(`Budget app listening on port ${port}`);
    open('http://localhost:3000/');
});
