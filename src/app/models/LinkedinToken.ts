import mongoose from "mongoose";

const LinkedinTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  expiresIn: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  userProfile: {
    linkedInId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    profilePicture: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Check if model already exists (prevents recompilation errors in dev)
const LinkedinToken = mongoose.models.LinkedinToken || mongoose.model("LinkedinToken", LinkedinTokenSchema);

export default LinkedinToken;
