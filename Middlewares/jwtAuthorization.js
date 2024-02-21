const jwt = require("jsonwebtoken");
const process = require("process");
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

// Helper function to generate JWT tokens with user data
const generateAuthToken = (input) => {
  try {
    const token = jwt.sign({ input }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: "HS256",
    });
    return token;
  } catch (error) {
    throw new Error("Failed to generate auth token");
  }
};

// Helper function to verify JWT tokens
const verifyAuthToken = (token) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET, { algorithm: "HS256" });

    if (!decoded) {
      throw new Error("Token verification failed");
    }

    return decoded;
  } catch (error) {
    throw new Error("Failed to verify auth token");
  }
};

// Export the helper functions
module.exports = {
  generateAuthToken,
  verifyAuthToken,
};
