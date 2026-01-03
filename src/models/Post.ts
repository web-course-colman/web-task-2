import mongoose from "mongoose";

interface IPost {
  message: string;
  sender: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const postSchema = new mongoose.Schema<IPost>({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IPost>("Post", postSchema);
