const Post = require("../models/Post");

const addPost = async (req, res) => {
  try {
    const { message, sender } = req.body;

    if (!message || !sender) {
      return res
        .status(400)
        .json({ message: "Message and sender are required" });
    }

    const post = new Post({
      message,
      sender,
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { sender } = req.query;
    let query = {};
    if (sender) {
      query.sender = sender;
    }
    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostsBySender = async (req, res) => {
  try {
    const { sender } = req.query;
    if (!sender) {
      return res
        .status(400)
        .json({ message: "Sender query parameter is required" });
    }
    const posts = await Post.find({ sender }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { message, sender } = req.body;

    if (!message || !sender) {
      return res
        .status(400)
        .json({ message: "Message and sender are required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.message = message;
    post.sender = sender;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addPost,
  getAllPosts,
  getPostById,
  getPostsBySender,
  updatePost,
};
