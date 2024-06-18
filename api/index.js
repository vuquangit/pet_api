import express from 'express';
const app = express();

app.get('/', (req, res) => res.send('Express on Vercel'));

app.listen(8081, () => console.log('Server ready on port 8081.'));

export default app;
