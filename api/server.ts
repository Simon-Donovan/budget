import express from 'express';
import apiSetup from './index';

const app = express();

apiSetup(app);

app.listen(3001, () => {
    console.log('API server listening on port 3001');
});
