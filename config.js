const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

exports.port = process.env.PORT || 3000;
