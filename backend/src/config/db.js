const mongoose = require('mongoose');

// Database connect cheyyanulla function
const connectDB = async () => {
    try {
        // Mongoose vazhi MongoDB connect cheyyunnu
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Options are no longer needed in Mongoose 6+, but keeping logic clean
        });
        console.log(`📦 MongoDB Master Database Connected: ${conn.connection.host}`); // Connection success aayal print cheyyum
    } catch (error) {
        // Connection failure aayal error kanikkum
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Error vannal process stop cheyyan
    }
};

module.exports = connectDB;
