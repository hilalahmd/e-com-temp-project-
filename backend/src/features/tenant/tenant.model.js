const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        storeName: {
            type: String,
            required: [true, 'Please add a store name'],
            trim: true,
        },
        storeSlug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        whatsappNumber: {
            type: String,
            required: [true, 'Please provide a WhatsApp number for receiving orders'],
        },
        category: {
            type: String,
            default: 'General Retail',
        },
        logoUrl: {
            type: String,
            default: 'https://via.placeholder.com/150?text=Logo',
        },
        heroBgUrl: {
            type: String,
            default: '',
        },
        theme: {
            primaryColor: { type: String, default: '#000000' },
            fontFamily: { type: String, default: 'Inter' },
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

// This model resides in the MASTER database
module.exports = mongoose.model('Store', storeSchema);
