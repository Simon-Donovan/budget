import express from 'express';
import apiSetup from './api';

const app = express();
const port = 3000;

app.use(express.static('build'));
apiSetup(app);

app.listen(port, () => {
    console.log(`Budget app listening on port ${port}`);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('open')('http://localhost:3000/');
});
