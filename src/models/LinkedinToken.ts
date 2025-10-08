import mongoose from "mongoose";

const LinkedinTokenSchema = new mongoose.Schema({
  linkedInId: {
    type: String,
    required: true,
    unique: true // Each LinkedIn user can only have one token
  },
  accessToken: {
    type: String,
    required: true
  },
  expiresIn: {
    type: Number,
    required: true
  },
  obtainedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  }
});

// Create index for cleanup of expired tokens
LinkedinTokenSchema.index({ obtainedAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 }); // 60 days

// Check if model already exists (prevents recompilation errors in dev)
const LinkedinToken = mongoose.models.LinkedinToken || mongoose.model('LinkedinToken', LinkedinTokenSchema);

export default LinkedinToken;
