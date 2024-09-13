const express = require("express");
const router = express.Router();
const { 
    getSession,
} = require("../controllers/sessionController")

router.route("/").get(getSession);

module.exports = router;