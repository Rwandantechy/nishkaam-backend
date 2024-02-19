/* eslint-disable no-undef */
const { getCollection } = require("../database.js");
const {
  generateAuthToken,
  verifyAuthToken,
} = require("../Middlewares/jwtAuthorization.js");
const { hashInputData } = require("../Middlewares/hashInputData.js");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const { v4: uuidv4 } = require("uuid");

//_________________ Get all users____________________/

const createUser = async (req, res) => {
  try {
    const usersCollection = getCollection("users");
    const userData = req.body;
    // Check if the email already exists
    const existingUser = await usersCollection.findOne({
      email: userData.email,
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email already exists. Login instead" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await hashInputData(req.body.password);

    // add hashed password to the user data
    userData.password = hashedPassword;

    // Insert the user into the users collection
    const result = await usersCollection.insertOne(userData);

    // Create a user object with selected fields for response
    const createdUser = {
      _id: result.insertedId,
      username: result.username,
      email: result.email,
    };

    // Respond with status for pending email verification
    res.status(201).json({
      status: "registered",
      message: " you will need to verify your email to login later.",
      user: createdUser,
    });
  } catch (error) {
    console.error("Error making the registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//_______________ Login as a user_______________/
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersCollection = getCollection("users");

    // Find the user by email
    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate a JWT token for the logged-in user
    const token = generateAuthToken(user);

    res.status(200).json({
      message: "User logged in successfully.",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token: token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//___________________Update user by ID___________________________/
const updateUserById = async (req, res) => {
  const id = `${req.params.id}`;
  const userUpdatedData = { ...req.body };

  try {
    const usersCollection = getCollection("users");

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid UserId." });
    }
    const authToken = req.headers.authorization;

    let token = null;

    if (authToken && authToken.startsWith("Bearer ")) {
      token = authToken.split(" ")[1];
    }

    if (token) {
      const decodedToken = verifyAuthToken(token);

      // Ensure that the user is updating their own profile
      if (decodedToken.input._id !== id) {
        return res
          .status(403)
          .json({ error: "You do not have permission to update this user." });
      }

      if (userUpdatedData.password) {
        // If the password is being updated, hash it
        userUpdatedData.password = await hashInputData(
          userUpdatedData.password
        );
      }

      const updatedUser = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: userUpdatedData },
        { returnDocument: "after" }
      );

      if (updatedUser === null) {
        return res.status(404).json({ error: "User not found." });
      }

      res.status(200).json({
        message: "User updated successfully.",
        user: {
          updatedUser,
        },
      });
    }
  } catch (error) {
    console.error("Error updating a user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// resetting the password
const resetPassword = async (req, res) => {
  const email = req.body.email;
  const usersCollection = getCollection("users");
  const user = await usersCollection.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  const token = uuidv4();
  const resetPasswordToken = token;
  const resetPasswordExpires = Date.now() + 3600000;
  const updatedUser = await usersCollection.findOneAndUpdate(
    { email: email },
    {
      $set: {
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpires: resetPasswordExpires,
      },
    },
    { returnDocument: "after" }
  );
  if (updatedUser === null) {
    return res.status(404).json({ error: "User not found." });
  }
  const resetPasswordLink = `http://localhost:3000/reset-password/${resetPasswordToken}`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${resetPasswordLink}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };
  // send mail with defined transport object
  await transporter.sendMail(mailOptions);
  res.status(200).json({
    message: "Password reset link sent to your email.",
  });
};

// set new password
const setNewPassword = async (req, res) => {
  try {
    const resetPasswordToken = req.params.resetPasswordToken;
    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne({
      resetPasswordToken: resetPasswordToken,
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: "can't reset the password the user not found" });
    }
    if (user.resetPasswordExpires < Date.now()) {
      return res
        .status(400)
        .json({ error: "Password reset token has expired." });
    }
    const hashedPassword = await hashInputData(req.body.password);
    const updatedUser = await usersCollection.findOneAndUpdate(
      { resetPasswordToken: resetPasswordToken },
      { $set: { password: hashedPassword } },
      { returnDocument: "after" }
    );
    if (updatedUser === null) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json({
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createUser,
  loginUser,
  resetPassword,
  updateUserById,
  setNewPassword,
};
