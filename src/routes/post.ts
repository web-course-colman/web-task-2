import express from "express";
import {
  addPost,
  getAllPosts,
  getPostById,
  getPostsBySender,
  updatePost,
} from "../controllers/post";

const router = express.Router();

// @route   GET /post
// @desc    Get all posts
// @access  Private
router.get("/", getAllPosts);

// @route   GET /post/:id
// @desc    Get post by ID
// @access  Private
router.get("/:id", getPostById);

// @route   POST /post
// @desc    Add a new post
// @access  Private
router.post("/", addPost);

// @route   GET /post?sender=<sender_id>
// @desc    Get posts by sender
// @access  Private
router.get("/", getPostsBySender);

// @route   PUT /post/:id
// @desc    Update post by ID
// @access  Private
router.put("/:id", updatePost);

export default router;
