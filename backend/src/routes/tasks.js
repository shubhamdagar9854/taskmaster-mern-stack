const express = require('express');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');
const router = express.Router();

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
    const { title, description, priority, dueDate, category, notes, subtasks, reminder, tags, timeTracking } = req.body;

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
      user: req.userId
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, notes, subtasks, reminder, tags, timeTracking } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, description, priority, dueDate, category, notes, subtasks, reminder, tags, timeTracking },
      { new: true }
    );

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

module.exports = router;
