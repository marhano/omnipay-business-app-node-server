const express = require("express");
const router = express.Router();
const { 
    getUsers,
    registerUser,
    loginUser,
    logoutUser
} = require("../controllers/userController");
const authMiddleware = require('../authMiddleware');

router.route("/").get(authMiddleware, getUsers);

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(authMiddleware, logoutUser);

module.exports = router;