const { required } = require('joi')
const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Event', eventSchema)
