const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const router = express.Router();

// Helper function to log activity
const logActivity = (task, action, description) => {
  task.activityLog.push({
    action,
    description,
    timestamp: new Date()
  });
  // Keep only last 50 activities
  if (task.activityLog.length > 50) {
    task.activityLog = task.activityLog.slice(-50);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, documents, and ZIP files are allowed'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all tasks for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, isTemplate: false })
      .populate('dependencies')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all templates for a user
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = await Task.find({ user: req.userId, isTemplate: true })
      .sort({ createdAt: -1 });
    
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, notes, subtasks, reminder, tags, timeTracking, dependencies, isTemplate, templateName, recurring } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (isTemplate && !templateName) {
      return res.status(400).json({ message: 'Template name is required for templates' });
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      category,
      notes,
      subtasks,
      reminder,
      tags,
      timeTracking,
      dependencies,
      isTemplate: isTemplate || false,
      templateName,
      recurring,
      user: req.userId
    });

    logActivity(task, 'created', 'Task created');
    await task.save();
    await task.populate('dependencies');
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, notes, subtasks, reminder, tags, timeTracking, dependencies, recurring } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Log changes
    const changes = [];
    if (title && title !== task.title) changes.push(`title changed to "${title}"`);
    if (description !== undefined && description !== task.description) changes.push('description updated');
    if (priority && priority !== task.priority) changes.push(`priority changed to ${priority}`);
    if (dueDate !== undefined && dueDate !== task.dueDate) changes.push('due date updated');
    if (category && category !== task.category) changes.push(`category changed to ${category}`);
    if (notes !== undefined && notes !== task.notes) changes.push('notes updated');
    if (subtasks) changes.push('subtasks updated');
    if (tags) changes.push('tags updated');
    if (dependencies) changes.push('dependencies updated');
    if (recurring) changes.push('recurring settings updated');

    if (changes.length > 0) {
      logActivity(task, 'updated', changes.join(', '));
    }

    Object.assign(task, { title, description, priority, dueDate, category, notes, subtasks, reminder, tags, timeTracking, dependencies, recurring });
    await task.save();
    await task.populate('dependencies');
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle task completion
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = !task.completed;
    logActivity(task, 'toggled', task.completed ? 'Task marked as completed' : 'Task marked as incomplete');
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle task favorite
router.patch('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isFavorite = !task.isFavorite;
    logActivity(task, 'favorited', task.isFavorite ? 'Task added to favorites' : 'Task removed from favorites');
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle task archive
router.patch('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isArchived = !task.isArchived;
    logActivity(task, 'archived', task.isArchived ? 'Task archived' : 'Task unarchived');
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Toggle archive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get due reminders
router.get('/reminders/due', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const tasks = await Task.find({
      user: req.userId,
      'reminder.enabled': true,
      'reminder.time': { $lte: now },
      'reminder.sent': false,
      completed: false
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark reminder as sent
router.patch('/:id/reminder/sent', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.reminder) {
      task.reminder.sent = true;
      await task.save();
    }

    res.json(task);
  } catch (error) {
    console.error('Mark reminder sent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start timer
router.post('/:id/timer/start', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.timeTracking) {
      task.timeTracking = {
        enabled: true,
        timeSpent: 0,
        timerRunning: false,
        startTime: null
      };
    }

    task.timeTracking.enabled = true;
    task.timeTracking.timerRunning = true;
    task.timeTracking.startTime = new Date();

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stop timer
router.post('/:id/timer/stop', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.timeTracking || !task.timeTracking.timerRunning) {
      return res.status(400).json({ message: 'Timer is not running' });
    }

    const startTime = new Date(task.timeTracking.startTime);
    const endTime = new Date();
    const elapsedSeconds = Math.floor((endTime - startTime) / 1000);

    task.timeTracking.timeSpent += elapsedSeconds;
    task.timeTracking.timerRunning = false;
    task.timeTracking.startTime = null;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset timer
router.post('/:id/timer/reset', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.timeTracking) {
      task.timeTracking = {
        enabled: true,
        timeSpent: 0,
        timerRunning: false,
        startTime: null
      };
    }

    task.timeTracking.timeSpent = 0;
    task.timeTracking.timerRunning = false;
    task.timeTracking.startTime = null;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Reset timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload attachment
router.post('/:id/attachments', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date()
    };

    task.attachments.push(attachment);
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete attachment
router.delete('/:id/attachments/:attachmentId', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    attachment.remove();
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { text, author } = req.body;

    if (!text || !author) {
      return res.status(400).json({ message: 'Text and author are required' });
    }

    task.comments.push({
      text,
      author,
      createdAt: new Date()
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.remove();
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add dependency
router.post('/:id/dependencies', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { dependencyId } = req.body;

    if (!dependencyId) {
      return res.status(400).json({ message: 'Dependency ID is required' });
    }

    // Check if dependency exists and belongs to the same user
    const dependencyTask = await Task.findOne({ _id: dependencyId, user: req.userId });

    if (!dependencyTask) {
      return res.status(404).json({ message: 'Dependency task not found' });
    }

    // Check if already exists
    if (task.dependencies.includes(dependencyId)) {
      return res.status(400).json({ message: 'Dependency already exists' });
    }

    // Check for circular dependency
    if (dependencyTask.dependencies.includes(task._id)) {
      return res.status(400).json({ message: 'Circular dependency detected' });
    }

    task.dependencies.push(dependencyId);
    await task.save();

    // Populate dependencies for response
    await task.populate('dependencies');

    res.status(201).json(task);
  } catch (error) {
    console.error('Add dependency error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove dependency
router.delete('/:id/dependencies/:dependencyId', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.dependencies = task.dependencies.filter(dep => dep.toString() !== req.params.dependencyId);
    await task.save();

    // Populate dependencies for response
    await task.populate('dependencies');

    res.json(task);
  } catch (error) {
    console.error('Remove dependency error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task from template
router.post('/from-template/:templateId', authenticateToken, async (req, res) => {
  try {
    const template = await Task.findOne({ _id: req.params.templateId, user: req.userId, isTemplate: true });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const newTask = new Task({
      title: template.title,
      description: template.description,
      priority: template.priority,
      category: template.category,
      notes: template.notes,
      subtasks: template.subtasks,
      reminder: template.reminder,
      tags: template.tags,
      timeTracking: template.timeTracking,
      dependencies: [],
      isTemplate: false,
      templateName: null,
      recurring: template.recurring,
      user: req.userId
    });

    await newTask.save();
    await newTask.populate('dependencies');

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create from template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete recurring task and create next occurrence
router.post('/:id/complete-recurring', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.recurring || !task.recurring.enabled) {
      return res.status(400).json({ message: 'Task is not recurring' });
    }

    // Mark current task as completed
    task.completed = true;
    await task.save();

    // Calculate next due date
    const nextDueDate = new Date(task.dueDate || Date.now());
    const { frequency, interval } = task.recurring;

    switch (frequency) {
      case 'daily':
        nextDueDate.setDate(nextDueDate.getDate() + interval);
        break;
      case 'weekly':
        nextDueDate.setDate(nextDueDate.getDate() + (7 * interval));
        break;
      case 'monthly':
        nextDueDate.setMonth(nextDueDate.getMonth() + interval);
        break;
      case 'yearly':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + interval);
        break;
      default:
        nextDueDate.setDate(nextDueDate.getDate() + interval);
    }

    // Create next occurrence
    const nextTask = new Task({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: nextDueDate,
      category: task.category,
      notes: task.notes,
      subtasks: task.subtasks.map(st => ({ ...st, completed: false })),
      reminder: task.reminder,
      tags: task.tags,
      timeTracking: { enabled: false, timeSpent: 0, timerRunning: false, startTime: null },
      dependencies: [],
      recurring: task.recurring,
      user: req.userId
    });

    await nextTask.save();
    await nextTask.populate('dependencies');

    res.json({ completedTask: task, nextTask });
  } catch (error) {
    console.error('Complete recurring task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
