const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hif0lwq.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const roomCollection = client.db('voyagelodge').collection('rooms')
    const bookingsCollection = client.db('voyagelodge').collection('bookings')

    app.get('/rooms', async (req, res)=>{
        const result = await roomCollection.find().toArray()
        res.send(result)
    })
    app.get('/rooms/:name', async(req, res)=>{
        const name = req.params.name
        const result = await roomCollection.findOne({name})
        res.send(result)
    })
    app.post('/bookings', async(req,res)=>{
        const bookings = req.body
        const result = await bookingsCollection.insertOne(bookings)
        res.send(result)
    })
    app.get('/bookings', async(req,res)=>{
        const result = await bookingsCollection.find().toArray()
        res.send(result)
    })
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('hotel management server is running')
})

app.listen(port, () =>{
    console.log(`hotel management server is running on port: ${port}`);
})