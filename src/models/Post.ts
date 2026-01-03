import mongoose from "mongoose";

interface IPost {
  message: string;
  sender: string;
  createdAt: Date;
}

const postSchema = new mongoose.Schema<IPost>({
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

export default mongoose.model<IPost>("Post", postSchema);
