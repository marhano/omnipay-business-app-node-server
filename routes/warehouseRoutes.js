const express = require("express");
const router = express.Router();
const { 
    getWarehouse
} = require("../controllers/warehouseController");
const authMiddleware = require('../authMiddleware');

router.route("/").get(authMiddleware, getWarehouse);

module.exports = router;