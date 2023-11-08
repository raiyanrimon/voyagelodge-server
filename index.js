const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// middleware
app.use(cors({
  origin:[
    'http://localhost:5173'
  ],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hif0lwq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const logger = (req, res, next)=>{
  console.log('log info', req.method, req.url);
  next()
}
const verifyToken = (req, res, next) =>{
  const token = req?.cookies?.token
  console.log('token in middle', token);
  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token , process.env.ACCESS_SECRET_TOKEN, (err, decoded)=>{
    if (err){
      return res.status(401).send({message: 'unauthorized access'})

    }
    req.user = decoded
    next()
  })
 
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const roomCollection = client.db('voyagelodge').collection('rooms')
    const bookingsCollection = client.db('voyagelodge').collection('bookings')
    const reviewsCollection = client.db('voyagelodge').collection('reviews')

    //  auth related api
    app.post('/jwt',logger, async (req,res)=>{
      const user = req.body
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN , {expiresIn: '1h'})
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      }).send({success: true})
    })

    app.post('/logout', async (req,res)=>{
      const user = req.body
      console.log('logging out', user);
      res.clearCookie('token', {maxAge: 0}).send({success: true})
    })

    app.get('/rooms', async (req, res)=>{
        const result = await roomCollection.find().toArray()
        res.send(result)
    })
    app.get('/rooms/:id', async(req, res)=>{
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await roomCollection.findOne(query)
        res.send(result)
    })
    app.post('/bookings', async(req,res)=>{

        const bookings = req.body
        const result = await bookingsCollection.insertOne(bookings)
        res.send(result)
    })
    app.get('/room-available', async (req, res)=>{
      const result = await bookingsCollection.find().toArray()
        res.send(result)
    })
    app.get('/bookings', logger, verifyToken, async(req,res)=>{
      console.log(req.query.email)
      console.log('cook',req.user)
      if(req.query.email !== req.user.email){
        return res.status(403).send({message: 'forbidden access'})
      }
      let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
        const result = await bookingsCollection.find(query).toArray()
        res.send(result)
    })
    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await bookingsCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/bookings/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await bookingsCollection.findOne(query)
      res.send(result)
    })
    app.put('/bookings/:id', async(req, res)=>{
      const id = req.params.id
      const options = {upsert: true}
      const updatedBooking = req.body
      const booking = {
        $set: {
          name: updatedBooking.name,
          email: updatedBooking.email,
          customer: updatedBooking.customer,
          date: updatedBooking.date,
          img1: updatedBooking.img1,
          offer_price: updatedBooking.offer_price
        }
      };
      
      const filter = {_id: new ObjectId(id)}
      const result = await bookingsCollection.updateOne(filter, booking, options)
      res.send(result)
    })
    app.post('/reviews', async(req, res)=>{
      const reviews = req.body
      const result = await reviewsCollection.insertOne(reviews)
      res.send(result)
    })
    app.get('/reviews', async (req,res)=>{
      const result = await reviewsCollection.find().toArray()
      res.send(result)
    })
    app.get('/reviews/:name', async (req, res)=>{
      const name = req.params.name
      const result = await reviewsCollection.find({name}).toArray()
      res.send(result)
    })
    
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