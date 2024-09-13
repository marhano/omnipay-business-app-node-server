const express = require("express");
const router = express.Router();
const { 
    getUsers,
    registerUser,
    loginUser,
    logoutUser
} = require("../controllers/userController")

router.route("/").get(getUsers);

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logoutUser);

module.exports = router;