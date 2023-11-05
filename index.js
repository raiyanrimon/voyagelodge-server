const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json())


app.get('/', (req, res) =>{
    res.send('hotel management server is running')
})

app.listen(port, () =>{
    console.log(`hotel management server is running on port: ${port}`);
})