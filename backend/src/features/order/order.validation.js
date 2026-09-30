const Joi = require('joi');

exports.createOrderSchema = Joi.object({
    customerName: Joi.string().required(),
    customerPhone: Joi.string().required(),
    customerAddress: Joi.string().required(),
    items: Joi.array().min(1).items(
        Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required()
        })
    ).required(),
    totalAmount: Joi.number()
});

exports.updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').required()
});
