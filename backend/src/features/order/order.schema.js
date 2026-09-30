const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        customerId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Customer', 
            default: null 
        },
        customerName: {
            type: String,
            required: [true, 'Customer name is required']
        },
        customerPhone: {
            type: String,
            required: [true, 'Customer phone is required']
        },
        customerAddress: {
            type: String,
            required: [true, 'Delivery address is required']
        },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                name: String,
                quantity: Number,
                price: Number
            }
        ],
        totalAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending'
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'Online'],
            default: 'COD'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        stripeSessionId: {
            type: String,
            default: null
        },
        couponCode: {
            type: String,
            default: null
        },
        discountAmount: {
            type: Number,
            default: 0
        },
        subtotal: {
            type: Number
        }
    },
    { timestamps: true }
);

module.exports = orderSchema;
