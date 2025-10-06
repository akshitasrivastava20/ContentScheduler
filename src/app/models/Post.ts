import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, default: "pending", enum: ["pending", "posted", "failed"] },
  publishedAt: { type: Date },
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Check if model already exists (prevents recompilation errors in dev)
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;
