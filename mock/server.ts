import express from 'express';
import apiMocker from 'connect-api-mocker';

const app = express();

app.use('/api', apiMocker('mock/api'));

app.listen(3001, () => {
    console.log('Mock API server listening on port 3001');
});
