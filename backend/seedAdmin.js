require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/features/auth/auth.model');
const connectDB = require('./src/config/db');

const seedAdmin = async () => {
    try {
        await connectDB();
        
        const existingAdmin = await User.findOne({ email: 'admin@system.com' });
        if (existingAdmin) {
            console.log('Super admin already exists (admin@system.com)');
            process.exit(0);
        }

        const admin = new User({
            name: 'Super Admin',
            email: 'admin@system.com',
            password: 'password123',
            role: 'super_admin'
        });

        await admin.save();
        console.log('Super admin created! Email: admin@system.com | Password: password123');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
