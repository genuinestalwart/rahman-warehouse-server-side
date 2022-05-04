const express = require('express');
const cors = require('cors');
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

        app.get('/inventory', async (req, res) => {
            const { search_id } = req.query;

            if (search_id) {
                const query = { "_id": ObjectId(search_id) };
                const item = await client.db('RahmanWarehouse').collection('Inventory').findOne(query);
                if (item) {
                    res.send(item);
                } else {
                    res.send({});
                }
            } else {
                const start = parseInt(req.query?.start);
                const inventory = await client.db('RahmanWarehouse').collection('Inventory').find({}).toArray();

                if (start) {
                    res.send(inventory.slice(start, start + 6));
                } else {
                    res.send(inventory);
                }
            }
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