require('dotenv').config()

const mongoose = require('mongoose')

module.exports = async () => {
    mongoose.set('strictQuery', false);
    mongoose.createConnection(process.env.MONGO_URI);
    mongoose.connect(process.env.MONGO_URI)
    return mongoose
}