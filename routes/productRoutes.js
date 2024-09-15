const express = require("express");
const router = express.Router();
const { 
    getProducts,
    getProduct,
    getCategories,
    getUnitOfMeasures,
    createProduct
} = require("../controllers/productController")

router.route("/").get(getProducts);

router.route("/createproduct").post(createProduct);

router.route("/categories").get(getCategories);

router.route("/unitofmeasures").get(getUnitOfMeasures);

router.route("/:id").get(getProduct);

module.exports = router;