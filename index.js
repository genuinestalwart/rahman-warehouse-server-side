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

const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }

    const token = authHeader.split((' '))[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }

        req.decoded = decoded;
        next();
    });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_URL}/RahmanWarehouse?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Connecting to database
const fetchData = async () => {
    try {
        await client.connect();
        const inventory = client.db('RahmanWarehouse').collection('Inventory');

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

        app.post('/change-quantity', async (req, res) => {
            const { _id, increaseBy } = req.body;
            const query = { "_id": ObjectId(_id) };
            const update = { $inc: { "quantity": parseInt(increaseBy) } };
            await inventory.findOneAndUpdate(query, update);
            res.send({});
        });

        app.post('/add-item', async (req, res) => {
            await inventory.insertOne(req.body);
            res.send({
                header: 'New Item Added!',
                body: 'Please go to the My Items page to see all the items added by you.'
            });
        });

        app.delete('/delete-item', async (req, res) => {
            const query = { "_id": ObjectId(req.body.itemId) };
            await inventory.deleteOne(query);
            res.send({});
        });

        app.get('/my-items', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const queryEmail = req.query.email;

            if (queryEmail === decodedEmail) {
                const query = { "email": queryEmail };
                const items = await inventory.find(query).toArray();
                res.send(items);
            } else {
                res.status(403).send({ message: 'forbidden access' });
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

// Creating JWT
app.post('/auth', (req, res) => {
    const user = req.body;
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    res.send({ accessToken });
});

// Listening to port
app.listen(port, () => {
    console.log('Listening to port:', port);
});