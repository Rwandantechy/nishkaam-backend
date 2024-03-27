const express = require("express");
const morgan = require("morgan");
const blogsRoutes = require("./routes/blogsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const payRoutes = require("./routes/paymentsRoutes");
const { connectDatabase } = require("./database.js");
const cors = require("cors");
const compression = require("compression");
const methodOverride = require("method-override");
const path = require("path");
const helmet = require("helmet");
const app = express();

// Middleware setup
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));


// Database connection
connectDatabase();

// Routes setup
app.use("/blogs", blogsRoutes);
app.use("/", usersRoutes);
app.use("/pay", payRoutes);

// Payment confirmation route
app.get("/paytm", (req, res) => {
  res.status(200).render("pay");
});

// health check route
app.get("/ready", (req, res) => {
  res.status(200).render("index");
});
// Home route
app.get("/", (req, res) => {
  res.status(200).render("home");
});
// forgot password route
app.get("/forgot", (req, res) => {
  res.status(200).render("forgot");
});
// admin route
app.get("/admin", (req, res) => {
  res.status(200).render("admin");
});
// blog route
app.get("/admin/blog", (req, res) => {
  res.status(200).render("createBlog");
});

// 404 route
app.use((req, res) => {
  res.status(404).render("404");
});

module.exports = app;
