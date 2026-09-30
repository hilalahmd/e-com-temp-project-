const Joi = require('joi');

exports.createProductSchema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(1000).required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).required(),
    category: Joi.string(),
    imageUrl: Joi.string().uri(),
    isBestSeller: Joi.boolean()
});

exports.updateProductSchema = Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().max(1000),
    price: Joi.number().min(0),
    stock: Joi.number().integer().min(0),
    category: Joi.string(),
    imageUrl: Joi.string().uri(),
    isBestSeller: Joi.boolean(),
    isActive: Joi.boolean()
});

exports.updateStockSchema = Joi.object({
    stock: Joi.number().integer().min(0).required()
});
