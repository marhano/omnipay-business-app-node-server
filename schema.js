const Joi = require('joi');

const inventoryInfoSchema = Joi.object({
    warehouse: Joi.number().required(),
    quantity: Joi.number().required(),
});

const inventoryInfoArraySchema = Joi.array().items(inventoryInfoSchema);

const salesInfoSchema = Joi.object({
    unitPrice: Joi.number().required(),
    sku: Joi.string().required(),
});

const productSchema = Joi.object({
    productName: Joi.string().required(),
    productDescription: Joi.string().required(),
    productTags: Joi.string().required(),
    productCategory: Joi.number().required(),
    productSubCategory: Joi.number().required(),
    totalQuantity: Joi.number().required(),
    unitOfMeasure: Joi.number().required(),
    salesInfo: salesInfoSchema.required(),
    inventoryInfos: Joi.array().items(inventoryInfoSchema).required()
});

module.exports = {
    productSchema,
    salesInfoSchema,
    inventoryInfoSchema,
    inventoryInfoArraySchema
};