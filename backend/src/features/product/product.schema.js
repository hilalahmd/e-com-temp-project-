const mongoose = require('mongoose');

// Notice we do NOT compile the model here (module.exports = mongoose.model(...)).
// We only export the SCHEMA, because the model must be compiled dynamically 
// inside the specific tenant's database connection.
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a product name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
            min: [0, 'Price must be positive'],
        },
        stock: {
            type: Number,
            required: [true, 'Please add stock quantity'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        category: {
            type: String,
            required: true,
            default: 'Uncategorized'
        },
        imageUrl: {
            type: String,
            default: 'https://via.placeholder.com/300?text=No+Image'
        },
        isBestSeller: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

module.exports = productSchema;
