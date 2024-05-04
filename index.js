const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app=express()
const port =process.env.PORT || 5000;

// middlewer
app.use(cors());
app.use(express.json());






// testing 
app.get('/',(req,res)=>{
    res.send('simple CRUD Is RUNNING')
})
app.listen(port,()=>{
    console.log(`Simple CRUD is Running on Port,${port}`);
})