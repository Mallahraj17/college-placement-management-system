const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 5000 });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
