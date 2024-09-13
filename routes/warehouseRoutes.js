const express = require("express");
const router = express.Router();
const { 
    getWarehouse
} = require("../controllers/warehouseController")

router.route("/").get(getWarehouse);

module.exports = router;