const express = require("express");
const {
  addPost,
  getAllPosts,
  getPostById,
  getPostsBySender,
  updatePost,
} = require("../controllers/post");

const router = express.Router();

// @route   GET /post
// @desc    Get all posts
// @access  Public
router.get("/", getAllPosts);

// @route   GET /post/:id
// @desc    Get post by ID
// @access  Public
router.get("/:id", getPostById);

// @route   POST /post
// @desc    Add a new post
// @access  Public
router.post("/", addPost);

// @route   PUT /post/:id
// @desc    Update post by ID
// @access  Public
router.put("/:id", updatePost);

module.exports = router;
