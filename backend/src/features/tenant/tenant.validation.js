const Joi = require('joi');

exports.createStoreSchema = Joi.object({
    storeName: Joi.string().min(2).max(50).required(),
    whatsappNumber: Joi.string().required(),
    category: Joi.string(),
    logoUrl: Joi.string(),
    heroBgUrl: Joi.string(),
    themeColor: Joi.string()
});

exports.updateStoreSchema = Joi.object({
    storeName: Joi.string().min(2).max(50),
    whatsappNumber: Joi.string(),
    category: Joi.string(),
    logoUrl: Joi.string(),
    heroBgUrl: Joi.string(),
    themeColor: Joi.string()
});
