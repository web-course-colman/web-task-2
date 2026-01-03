import express from "express";
import {
    addComment,
    getAllComments,
    getCommentById,
    updateComment,
    deleteComment,
} from "../controllers/comments";

const router = express.Router();

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments (optionally filtered by postId)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Filter comments by Post ID
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   postId:
 *                     type: string
 *                   message:
 *                     type: string
 *                   sender:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllComments);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 postId:
 *                   type: string
 *                 message:
 *                   type: string
 *                 sender:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getCommentById);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Add a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - message
 *               - sender
 *             properties:
 *               postId:
 *                 type: string
 *                 description: ID of the post the comment belongs to
 *               message:
 *                 type: string
 *                 description: Comment message
 *               sender:
 *                 type: string
 *                 description: Sender ID
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 postId:
 *                   type: string
 *                 message:
 *                   type: string
 *                 sender:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - missing fields
 *       500:
 *         description: Internal server error
 */
router.post("/", addComment);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - message
 *               - sender
 *             properties:
 *               postId:
 *                 type: string
 *                 description: Post ID (usually shouldn't change, but following controller logic)
 *               message:
 *                 type: string
 *                 description: Updated comment message
 *               sender:
 *                 type: string
 *                 description: Updated sender ID
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 postId:
 *                   type: string
 *                 message:
 *                   type: string
 *                 sender:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - missing fields
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteComment);

export default router;
