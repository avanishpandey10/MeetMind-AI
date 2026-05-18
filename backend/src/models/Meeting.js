import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Meeting'
  },
  transcript: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  actionItems: [{
    description: {
      type: String,
      required: true
    },
    assignee: {
      type: String,
      default: 'Unassigned'
    },
    deadline: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    }
  }],
  decisions: [{
    type: String
  }],
  followUpEmail: {
    type: String,
    default: null
  },
  metadata: {
    wordCount: Number,
    processedAt: Date,
    duration: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

meetingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

meetingSchema.index({ title: 'text', transcript: 'text' });

export default mongoose.model('Meeting', meetingSchema);