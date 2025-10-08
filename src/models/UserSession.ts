import mongoose from "mongoose";

const UserSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  linkedInId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-expire sessions after 30 days of inactivity
UserSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Check if model already exists (prevents recompilation errors in dev)
const UserSession = mongoose.models.UserSession || mongoose.model('UserSession', UserSessionSchema);

export default UserSession;
