const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tagColors: {
    type: Map,
    of: String,
    default: {}
  },
  undoStack: [{
    action: { type: String },
    taskId: { type: String },
    previousState: { type: Object },
    newState: { type: Object },
    timestamp: { type: Date, default: Date.now }
  }],
  redoStack: [{
    action: { type: String },
    taskId: { type: String },
    previousState: { type: Object },
    newState: { type: Object },
    timestamp: { type: Date, default: Date.now }
  }],
  customPriorities: [{
    name: { type: String, required: true },
    color: { type: String, default: '#6b7280' },
    order: { type: Number, default: 0 }
  }],
  taskTemplates: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    template: {
      title: { type: String, required: true },
      description: { type: String, default: '' },
      priority: { type: String, default: 'medium' },
      category: { type: String, default: 'Other' },
      tags: [{ type: String }],
      subtasks: [{
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }],
      colorLabel: { type: String, default: 'default' },
      reminder: {
        time: { type: Date },
        message: { type: String },
        type: { type: String, default: 'in-app' },
        repeat: { type: String, default: 'none' }
      }
    },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
