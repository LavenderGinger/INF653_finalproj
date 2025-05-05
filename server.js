require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const statesRouter = require('./routes/api/states');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the US States API</h1>');
});

app.use('/states', statesRouter);

app.all('*', (req, res) => {
    if (req.accepts('html')) {
        res.status(404).send('<h1>404 Not Found</h1>');
    } else if (req.accepts('json')) {
        res.status(404).json({ error: '404 Not Found' });
    } else {
        res.status(404).type('txt').send('404 Not Found');
    }
});

mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(process.env.PORT || 3500, () => console.log('Server running')))
    .catch(err => console.error(err));