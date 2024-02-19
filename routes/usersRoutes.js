const express = require("express");
const router = express.Router();

// Import controllers
const usersController = require("../Controllers/usersController");

const { createUser, loginUser, updateUserById } = usersController;

// Create a user (user registration )
router.post("/users/signup", createUser);
//verify user with unique token

router.post("/users/login", loginUser);

// Update a user by ID
router.put("/users/:id", updateUserById);

module.exports = router;
