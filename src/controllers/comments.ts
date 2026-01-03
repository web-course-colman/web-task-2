import { Request, Response } from "express";
import Comment from "../models/Comments";

const addComment = async (req: Request, res: Response) => {
    try {
        const { postId, message, sender } = req.body;

        if (!postId || !message || !sender) {
            return res
                .status(400)
                .json({ message: "Post ID, message, and sender are required" });
        }

        const comment = new Comment({
            postId,
            message,
            sender,
        });

        const savedComment = await comment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

const getAllComments = async (req: Request, res: Response) => {
    try {
        const filter: any = {};
        if (req.query.postId) {
            filter.postId = req.query.postId;
        }
        const comments = await Comment.find(filter).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

const getCommentById = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

const updateComment = async (req: Request, res: Response) => {
    try {
        const { message, sender, postId } = req.body;

        if (!message || !sender || !postId) {
            return res
                .status(400)
                .json({ message: "Post ID, message, and sender are required" });
        }

        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.message = message;
        comment.sender = sender;
        comment.postId = postId;

        const updatedComment = await comment.save();
        res.json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

const deleteComment = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export {
    addComment,
    getAllComments,
    getCommentById,
    updateComment,
    deleteComment,
};
