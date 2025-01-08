const express = require('express')

const app = express()


app.use(express.json())

const eventRouter = require('./routes/eventsRoute');

app.use('/api/events', eventRouter)

app.listen(4000, () => {
    console.log("listen on port 4000")
    
})
