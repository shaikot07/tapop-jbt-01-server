const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const qr = require('qrcode');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      "https://tapop-bj-1.netlify.app"
  
    ],
    optionSuccessStatus:200,
    credentials: true
  }));
app.use(express.json());

// console.log(process.env.DB_USER, process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.loifkbc.mongodb.net/?`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        const userCollection = client.db('tapop-jb-1').collection('users');

        // my api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'User already exists', insertedId: null });
            }

            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // User creation with existing user check
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        // Generate QR code for user
        app.get('/users/:userId/qr-code', async (req, res) => {
            const userId = req.params.userId;
            console.log("log here id",userId);
            const userProfileUrl = `https://tapop-bj-1.netlify.app/${userId}`;
            try {
                const qrCodeData = await qr.toDataURL(userProfileUrl);
                res.send(qrCodeData);
            } catch (error) {
                console.error('Error generating QR code:', error);
                res.status(500).send('Error generating QR code');
            }
        });

        app.post('/decode-qr-code', async (req, res) => {
            const qrCodeData = req.body.data;
            try {
                const decodedData = await qr.parse(qrCodeData);
                // Extract user ID from decoded URL (replace with your URL structure)
                const userId = decodedData.split('/profile/')[1];

                // Fetch user information based on extracted ID
                const userCollection = client.db('tapop-jb-1').collection('users');
                const user = await userCollection.findOne({ _id: ObjectId(userId) });

                if (user) {
                    res.send(user);
                } else {
                    res.status(404).send('User not found');
                }
            } catch (error) {
                console.error('Error decoding QR code:', error);
                res.status(500).send('Invalid QR code');
            }
        });


        await client.db('admin').command({ ping: 1 });
        console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// Testing
app.get('/', (req, res) => {
    res.send('simple CRUD Is RUNNING');
});
app.listen(port, () => {
    console.log(`Simple CRUD is Running on Port,${port}`);
});
