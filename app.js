const express = require('express')

const app = express()

const mongoose = require('mongoose')

const url = "mongodb://localhost:27017/backend-v1"

mongoose.connect(url).then(() => {
    console.log("mongodb sever started");
})
app.use(express.json())

const eventRouter = require('./routes/eventsRoute');

app.use('/api/events', eventRouter)

app.listen(4000, () => {
    console.log("listen on port 4000")
    
})
