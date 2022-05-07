const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middlewares
app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_URL}/RahmanWarehouse?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Connecting to database
const fetchData = async () => {
    try {
        await client.connect();
        const inventory = client.db('RahmanWarehouse').collection('Inventory');

        app.post('/auth', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ accessToken });
        });

        app.get('/inventory', async (req, res) => {
            const { search_id } = req.query;

            if (search_id) {
                const query = { "_id": ObjectId(search_id) };
                const item = await inventory.findOne(query);
                if (item) {
                    res.send(item);
                } else {
                    res.send({});
                }
            } else {
                const start = parseInt(req.query?.start);
                const items = await inventory.find({}).toArray();

                if (start) {
                    res.send(items.slice(start, start + 6));
                } else {
                    res.send(items);
                }
            }
        });

        app.post('/add-item', async (req, res) => {
            await inventory.insertOne(req.body);
            res.send({
                header: 'New Item Added!',
                body: 'Please go to the My Items page to see all the items added by you.'
            });
        });
    } finally {

    }
};

fetchData().catch(console.dir);

// Creating APIs
app.get('/', (req, res) => {
    res.send('Hello world!');
});

// Listening to port
app.listen(port, () => {
    console.log('Listening to port:', port);
});