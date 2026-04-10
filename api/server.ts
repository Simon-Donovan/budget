import express, { NextFunction, Request, Response } from 'express';
import apiSetup from './index';

const app = express();

apiSetup(app);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(3001, () => {
    console.log('API server listening on port 3001');
});
