import express from 'express';
import router from './router/route';
import { default as sync } from './database/sync';
const app = express();
const port = 3000;

sync();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use(router);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});     