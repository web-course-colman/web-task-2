import express from "express";
import Post from "../models/Post";

const addPost = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  try {
    const { message } = req.body;
    const sender = (req as any).user.id;

    if (!message) {
      return res
        .status(400)
        .json({ message: "Message is required" });
    }

    const post = new Post({
      message,
      sender,
    });

    const savedPost = await post.save();
    return res.status(201).json(savedPost);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

const getAllPosts = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  try {
    const { sender } = req.query as { sender?: string };
    let query: any = {};
    if (sender) {
      query.sender = sender;
    }
    const posts = await Post.find(query).sort({ createdAt: -1 });
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

const getPostById = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

const updatePost = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  try {
    const { message } = req.body;
    const sender = (req as any).user.id;

    if (!message) {
      return res
        .status(400)
        .json({ message: "Message is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the sender
    if (post.sender.toString() !== sender) {
      return res.status(403).json({ message: "Unauthorized to update this post" });
    }

    post.message = message;

    const updatedPost = await post.save();
    return res.json(updatedPost);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export { addPost, getAllPosts, getPostById, updatePost };
