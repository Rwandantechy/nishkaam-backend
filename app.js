/* eslint-disable no-undef */
const express = require("express");
const morgan = require("morgan");
const blogsRoutes = require("./routes/blogsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const { connectDatabase } = require("./database.js");
const cors = require("cors");
const compression = require("compression");
const methodOverride = require("method-override");
const path = require("path");
const helmet = require("helmet");
// const fs = require("fs");
const app = express();
app.use(morgan("dev"));
connectDatabase();

// Middleware setup

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
const images = path.join(__dirname, "blogImages");
app.use("/blogImages", express.static(images));

//routes setup
app.use("/api/blogs", blogsRoutes);
app.use("/api/users", usersRoutes);
module.exports = app;
