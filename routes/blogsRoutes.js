const express = require("express");
const router = express.Router();
const upload = require("../multerConfig.js");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const ObjectId = require("mongodb").ObjectId;
const blogsController = require("../Controllers/blogsController.js");

const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getAllBlogsPaginated,
  getTopBlogs,
  getBlogsByCategory,
} = blogsController;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

// Input validation middleware
const validateObjectId = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid Blog ID" });
  }
  next();
};

// Route to create a new blog with rate limiting and file upload
router.post(
  "/blogs",
  upload.single("image"),
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("content").not().isEmpty().withMessage("Content is required"),
  ],
  limiter,
  createBlog
);

// Route to get all blogs with pagination
router.get("/blogs/paginated", getAllBlogsPaginated);

// Route to get all blogs
router.get("/blogs", getAllBlogs);
// Route for getting blogs by category
router.get("/blogs/by-category/:category", getBlogsByCategory);

// Route to get a single blog by ID with input validation
router.get("/blogs/:id", validateObjectId, getBlogById);

// Route to update an existing blog with rate limiting and file upload
router.put(
  "/blogs/:id",
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("content").not().isEmpty().withMessage("Content is required"),
  ],
  limiter,
  upload.single("image"),
  updateBlog
);

// Route to delete a blog by ID
router.delete("/blogs/:id", deleteBlog);

// Route to get top 10 blogs with most likes and comments
router.get("/top-blogs", getTopBlogs);

// Route for searching blog by writter name

module.exports = router;
