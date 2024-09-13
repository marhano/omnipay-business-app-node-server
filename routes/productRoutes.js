const express = require("express");
const router = express.Router();
const { 
    getProducts,
    getCategories
} = require("../controllers/productController")

router.route("/").get(getProducts);

router.route("/categories").get(getCategories);

module.exports = router;