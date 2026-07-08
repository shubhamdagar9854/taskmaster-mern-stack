const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const router = express.Router();

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
    const tasks = await Task.find({ user: req.userId })
      .populate('dependencies')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, notes, subtasks, reminder, tags, timeTracking, dependencies } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
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
      user: req.userId
    });

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
    const { title, description, priority, dueDate, category, notes, subtasks, reminder, tags, timeTracking, dependencies } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, description, priority, dueDate, category, notes, subtasks, reminder, tags, timeTracking, dependencies },
      { new: true }
    ).populate('dependencies');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

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
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Toggle task error:', error);
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

module.exports = router;
