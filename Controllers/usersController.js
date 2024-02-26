/* eslint-disable no-undef */
const { getCollection } = require("../database.js");
const {
  generateAuthToken,
  verifyAuthToken,
} = require("../Middlewares/jwtAuthorization.js");
const { hashInputData } = require("../Middlewares/hashInputData.js");
const transporter = require("../Middlewares/nodemailerFunction.js");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// create a user
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
    // Add other user data
    userData.loggedin = false;
    userData.verified = false;
    userData.resetPasswordToken = null;
    userData.resetPasswordExpires = null;
    userData.unsubscribed = false;
    userData.createdAt = new Date();
    userData.updatedAt = new Date();
    userData.deletedAt = null;
    userData.deleted = false;
    userData.role = "user";
    userData.active = false;

    // Insert the user into the users collection
    await usersCollection.insertOne(userData);
    // Respond with status for pending email verification
    return res.status(201).json({
        message: "User is registered successfully.You will need to verify your email before signing in.",
    });
  } catch (error) {
    console.error("Error making user registration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersCollection = getCollection("users");

    // Find the user by email
    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Check if the user is verified
    if (!user.verified) {
      // Generate a verification token
      const verificationToken = uuidv4();
      // save the token in the database and some user's uncritical data , and timestamps  and expiration time
      const verificationData = {
        token: verificationToken,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      const verificationTokensCollection = getCollection("verificationTokens");
      await verificationTokensCollection.insertOne(verificationData);

      // Generate a unique verification link
      const verificationLink = `http://localhost:4000/verify?token=${verificationToken}`;

      // Send the verification link to the user's email
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Account Login Verification",
        text: `You are receiving this because you (or someone else) have requested to log into your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${verificationLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      // Send mail with defined transport object
      await transporter.sendMail(mailOptions);
      res.status(200).json({
        message:
          "the verification is sent to your email, please verify your email  first  to login.",
      });
      return res
        .status(401)
        .json({ error: "Account not verified. Please verify your email." });
    }

    // Check if the user is unsubscribed
    if (user.unsubscribed) {
      return res.status(401).json({
        error: "Account is unsubscribed. Please sign up again to login.",
      });
    }

    // Check if the user is already logged in
    if (user.loggedin) {
      return res
        .status(401)
        .json({ error: "User already logged in. refresh your page" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials. try again" });
    }
    // prepare the token for the user fields
    const tokenData = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      verified: user.verified,
      active: user.active,
    };

    // generate the token for the user
    const jwttoken = generateAuthToken(tokenData);
    // update some metadata in the user collection because they are logged in
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { loggedin: true } }
    );
    res.status(200).json({
      message: "User logged in successfully.",
      token: jwttoken,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// verify user with token
const verifyUser = async (req, res) => {
  try {
    const token = req.query.token;

    const verificationTokensCollection = getCollection("verificationTokens");
    const verificationToken = await verificationTokensCollection.findOne({
      token,
    });

    if (!verificationToken) {
      return res
        .status(404)
        .json({ error: "Invalid or expired verification token." });
    }

    // Check if the verification token has expired
    if (verificationToken.expiresAt < Date.now()) {
      // Delete the expired verification token from the database
      await verificationTokensCollection.deleteOne({ token });
      return res.status(400).json({ error: "Verification token has expired." });
    }

    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne({
      _id: verificationToken.userId,
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Unable to verify the account." });
    }

    if (user.verified) {
      return res
        .status(400)
        .json({ error: "User already verified. Please proceed to login." });
    }

    // Update user's verified status and activate the account
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { verified: true, active: true } }
    );

    // Delete the verification token from the database
    await verificationTokensCollection.deleteOne({ token });

    res.status(200).json({
      message: "User verified successfully.",
      loginUrl: "http://localhost:3000/login", // URL for login page
    });
  } catch (error) {
    console.error("Error verifying user:", error);
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
  verifyUser,
};
