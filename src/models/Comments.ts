import mongoose from "mongoose";

interface IComment {
    postId: mongoose.Schema.Types.ObjectId;
    message: string;
    sender: string;
    createdAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IComment>("Comment", commentSchema);
