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
const ejs = require("ejs");
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
app.set("view engine", "ejs");
const images = path.join(__dirname, "blogImages");
app.use("/blogImages", express.static(images));

//routes setup
app.use("/blogs", blogsRoutes);
app.use("/", usersRoutes);

// Error handling
app.use((req, res) => {
  // render 404.ejs
  res.status(404).render("404");
 
});




module.exports = app;
