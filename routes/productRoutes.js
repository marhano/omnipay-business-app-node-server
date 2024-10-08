const express = require("express");
const router = express.Router();
const { 
    getProducts,
    getProduct,
    getCategories,
    getUnitOfMeasures,
    createProduct
} = require("../controllers/productController");
const authMiddleware = require('../authMiddleware');

router.route("/:type").get(authMiddleware, getProducts);

router.route("/createproduct").post(authMiddleware, createProduct);

router.route("/categories").get(authMiddleware, getCategories);

router.route("/unitofmeasures").get(authMiddleware, getUnitOfMeasures);

router.route("/product/:id").get(authMiddleware, getProduct);

module.exports = router;