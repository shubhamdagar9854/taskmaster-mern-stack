const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'shopping', 'health', 'finance', 'other'],
    default: 'other'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    time: {
      type: Date,
      default: null
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  timeTracking: {
    enabled: {
      type: Boolean,
      default: false
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    timerRunning: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: Date,
      default: null
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
