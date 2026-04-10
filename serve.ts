import express from 'express';
import apiSetup from './api';

const app = express();
const port = 3000;

app.use(express.static('dist'));
apiSetup(app);

app.listen(port, async () => {
    console.log(`Budget app listening on port ${port}`);
    const { default: open } = await import('open');
    open('http://localhost:3000/');
});
