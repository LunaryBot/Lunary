import 'dotenv/config';
import './tools/Logger'

import express from 'express';
import http from 'http';

const app = express();
const httpServer = http.createServer(app);

app.get('/', (req, res) => {
    res.status(200).send('Hellow World!');
});

httpServer.listen(process.env.PORT, () => {
    logger.info(`Http Server is running on port ${process.env.PORT} (http://localhost:${process.env.PORT})`, { label: 'Http Server' })
});