const express = require("express");
const router = express.Router();

// Import controllers
const usersController = require("../Controllers/usersController");

const { createUser, loginUser,resetPassword,updateUserById,setNewPassword,verifyUser } = usersController;

// Create a user (user registration )
router.post("/signup", createUser);
//verify user with unique token

router.post("/login", loginUser);

// Update a user by ID
router.put("/users/:id", updateUserById);

// Reset password
router.post("/resetPassword", resetPassword);
//set new password
router.post("/setNewPassword", setNewPassword);
//verify user with tokn in query
router.get("/verify", verifyUser);

module.exports = router;
