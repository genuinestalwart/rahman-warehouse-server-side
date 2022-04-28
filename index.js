const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middlewares
app.use(express.json());
app.use(cors());

// Creating APIs
app.get('/', (req, res) => {
    res.send('Hello world!');
});

// Listening to port
app.listen(port, () => {
    console.log('Listening to port:', port);
});