const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const User = require('../models/User');
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

// Share task with another user
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find the user to share with
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToShare._id.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot share task with yourself' });
    }

    // Check if already shared
    if (task.sharedWith && task.sharedWith.includes(userToShare._id)) {
      return res.status(400).json({ message: 'Task already shared with this user' });
    }

    // Add to sharedWith array
    if (!task.sharedWith) {
      task.sharedWith = [];
    }
    task.sharedWith.push(userToShare._id);
    
    logActivity(task, 'shared', `Task shared with ${userToShare.username}`);
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Share task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove sharing
router.delete('/:id/share/:userId', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.sharedWith = task.sharedWith.filter(id => id.toString() !== req.params.userId);
    logActivity(task, 'unshared', 'Task sharing removed');
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Remove sharing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shared tasks (tasks shared with current user)
router.get('/shared', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ sharedWith: req.userId })
      .populate('user', 'username email')
      .populate('sharedWith', 'username email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get shared tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add manual time entry
router.post('/:id/time/manual', authenticateToken, async (req, res) => {
  try {
    const { duration, note } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.timeTracking) {
      task.timeTracking = { enabled: true, timeSpent: 0, timerRunning: false, startTime: null, manualEntries: [] };
    }

    if (!task.timeTracking.manualEntries) {
      task.timeTracking.manualEntries = [];
    }

    task.timeTracking.manualEntries.push({
      duration: Number(duration),
      date: new Date(),
      note: note || ''
    });

    task.timeTracking.timeSpent += Number(duration);
    task.timeTracking.enabled = true;
    
    logActivity(task, 'time_logged', `Manual time entry: ${duration} minutes added`);
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Add manual time entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get time tracking report
router.get('/time/report', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, 'timeTracking.enabled': true });
    
    const report = {
      totalTasks: tasks.length,
      totalMinutes: 0,
      tasks: []
    };

    tasks.forEach(task => {
      const taskTime = task.timeTracking.timeSpent || 0;
      report.totalMinutes += taskTime;
      
      report.tasks.push({
        id: task._id,
        title: task.title,
        timeSpent: taskTime,
        manualEntries: task.timeTracking.manualEntries || [],
        completed: task.completed
      });
    });

    report.totalHours = (report.totalMinutes / 60).toFixed(2);

    res.json(report);
  } catch (error) {
    console.error('Get time report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get priority statistics
router.get('/priority/stats', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    
    const stats = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
      none: 0
    };

    tasks.forEach(task => {
      if (!task.priority) {
        stats.none++;
      } else {
        stats[task.priority]++;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Get priority stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dependency graph
router.get('/dependencies/graph', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    
    const graph = {
      nodes: [],
      edges: []
    };

    tasks.forEach(task => {
      graph.nodes.push({
        id: task._id,
        title: task.title,
        completed: task.completed,
        priority: task.priority
      });

      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          graph.edges.push({
            from: depId,
            to: task._id,
            type: 'blocks'
          });
        });
      }
    });

    res.json(graph);
  } catch (error) {
    console.error('Get dependency graph error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks blocking a specific task
router.get('/:id/blocking', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let blockingTasks = [];
    
    if (task.dependencies && task.dependencies.length > 0) {
      const dependencyTasks = await Task.find({
        _id: { $in: task.dependencies },
        user: req.userId
      });
      
      blockingTasks = dependencyTasks.filter(t => !t.completed);
    }

    res.json(blockingTasks);
  } catch (error) {
    console.error('Get blocking tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks blocked by a specific task
router.get('/:id/blocked', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const blockedTasks = await Task.find({
      dependencies: task._id,
      user: req.userId
    });

    res.json(blockedTasks);
  } catch (error) {
    console.error('Get blocked tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update tasks
router.put('/bulk', authenticateToken, async (req, res) => {
  try {
    const { taskIds, updates } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: 'Task IDs are required' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: 'Updates are required' });
    }

    const tasks = await Task.find({ _id: { $in: taskIds }, user: req.userId });

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found' });
    }

    const updatedTasks = [];
    tasks.forEach(task => {
      Object.keys(updates).forEach(key => {
        if (key !== 'user' && key !== '_id') {
          task[key] = updates[key];
        }
      });
      task.updatedAt = Date.now();
      updatedTasks.push(task);
    });

    await Task.bulkSave(updatedTasks);

    // Log activity for each task
    updatedTasks.forEach(task => {
      logActivity(task._id, req.userId, 'bulk_update', `Bulk updated: ${Object.keys(updates).join(', ')}`);
    });

    res.json(updatedTasks);
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk delete tasks
router.delete('/bulk', authenticateToken, async (req, res) => {
  try {
    const { taskIds } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: 'Task IDs are required' });
    }

    const result = await Task.deleteMany({ _id: { $in: taskIds }, user: req.userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No tasks found' });
    }

    res.json({ message: `Deleted ${result.deletedCount} tasks`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Advanced search tasks
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const { query, priority, category, status, dueDateFrom, dueDateTo, tags } = req.body;

    const searchFilter = { user: req.userId };

    // Text search in title and description
    if (query && query.trim()) {
      searchFilter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ];
    }

    // Priority filter
    if (priority) {
      searchFilter.priority = priority;
    }

    // Category filter
    if (category) {
      searchFilter.category = category;
    }

    // Status filter
    if (status === 'active') {
      searchFilter.completed = false;
    } else if (status === 'completed') {
      searchFilter.completed = true;
    }

    // Due date range filter
    if (dueDateFrom || dueDateTo) {
      searchFilter.dueDate = {};
      if (dueDateFrom) {
        searchFilter.dueDate.$gte = new Date(dueDateFrom);
      }
      if (dueDateTo) {
        searchFilter.dueDate.$lte = new Date(dueDateTo);
      }
    }

    // Tags filter
    if (tags && tags.trim()) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      if (tagArray.length > 0) {
        searchFilter.tags = { $in: tagArray };
      }
    }

    const tasks = await Task.find(searchFilter).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send reminder notification
router.post('/:id/reminder/send', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.reminder || !task.reminder.enabled) {
      return res.status(400).json({ message: 'Reminder not enabled for this task' });
    }

    // Simulate sending reminder based on type
    let notificationSent = false;
    let notificationDetails = {};

    switch (type) {
      case 'email':
        notificationSent = true;
        notificationDetails = {
          type: 'email',
          message: `Reminder sent via email for task: ${task.title}`,
          sentAt: new Date()
        };
        break;
      case 'push':
        notificationSent = true;
        notificationDetails = {
          type: 'push',
          message: `Push notification sent for task: ${task.title}`,
          sentAt: new Date()
        };
        break;
      case 'in-app':
        notificationSent = true;
        notificationDetails = {
          type: 'in-app',
          message: `In-app notification created for task: ${task.title}`,
          sentAt: new Date()
        };
        break;
      case 'all':
        notificationSent = true;
        notificationDetails = {
          type: 'all',
          message: `All notifications sent for task: ${task.title}`,
          sentAt: new Date()
        };
        break;
      default:
        return res.status(400).json({ message: 'Invalid reminder type' });
    }

    // Update reminder status
    task.reminder.sent = true;
    task.reminder.sentAt = new Date();
    await task.save();

    logActivity(task._id, req.userId, 'reminder_sent', `Reminder sent via ${type}`);

    res.json({
      success: notificationSent,
      notificationDetails,
      task
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reminder history
router.get('/:id/reminder/history', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const reminderHistory = {
      enabled: task.reminder?.enabled || false,
      time: task.reminder?.time,
      type: task.reminder?.type,
      sent: task.reminder?.sent || false,
      sentAt: task.reminder?.sentAt
    };

    res.json(reminderHistory);
  } catch (error) {
    console.error('Get reminder history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task activity feed
router.get('/:id/activity', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Combine activity log with comments for comprehensive feed
    const activityFeed = [];

    // Add activity log entries
    if (task.activityLog && task.activityLog.length > 0) {
      task.activityLog.forEach(log => {
        activityFeed.push({
          type: 'activity',
          action: log.action,
          description: log.description,
          timestamp: log.timestamp
        });
      });
    }

    // Add comment entries
    if (task.comments && task.comments.length > 0) {
      task.comments.forEach(comment => {
        activityFeed.push({
          type: 'comment',
          action: 'comment_added',
          description: `${comment.author} commented: "${comment.text.substring(0, 50)}${comment.text.length > 50 ? '...' : ''}"`,
          timestamp: comment.createdAt,
          author: comment.author,
          commentId: comment._id
        });

        // Add reply entries
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(reply => {
            activityFeed.push({
              type: 'reply',
              action: 'reply_added',
              description: `${reply.author} replied: "${reply.text.substring(0, 50)}${reply.text.length > 50 ? '...' : ''}"`,
              timestamp: reply.createdAt,
              author: reply.author,
              commentId: comment._id
            });
          });
        }
      });
    }

    // Add reaction entries
    if (task.comments && task.comments.length > 0) {
      task.comments.forEach(comment => {
        if (comment.reactions && comment.reactions.length > 0) {
          comment.reactions.forEach(reaction => {
            activityFeed.push({
              type: 'reaction',
              action: 'reaction_added',
              description: `${reaction.user} reacted with ${reaction.emoji}`,
              timestamp: reaction.createdAt,
              author: reaction.user,
              commentId: comment._id
            });
          });
        }
      });
    }

    // Sort by timestamp (newest first)
    activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activityFeed);
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comprehensive task statistics
router.get('/stats/comprehensive', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });

    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      active: tasks.filter(t => !t.completed).length,
      favorites: tasks.filter(t => t.isFavorite).length,
      archived: tasks.filter(t => t.isArchived).length,
      withSubtasks: tasks.filter(t => t.subtasks && t.subtasks.length > 0).length,
      withAttachments: tasks.filter(t => t.attachments && t.attachments.length > 0).length,
      withComments: tasks.filter(t => t.comments && t.comments.length > 0).length,
      withDependencies: tasks.filter(t => t.dependencies && t.dependencies.length > 0).length,
      withReminders: tasks.filter(t => t.reminder && t.reminder.enabled).length,
      recurring: tasks.filter(t => t.recurring && t.recurring.enabled).length,
      shared: tasks.filter(t => t.sharedWith && t.sharedWith.length > 0).length,
      templates: tasks.filter(t => t.isTemplate).length,
      byPriority: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length
      },
      byCategory: {
        work: tasks.filter(t => t.category === 'work').length,
        personal: tasks.filter(t => t.category === 'personal').length,
        shopping: tasks.filter(t => t.category === 'shopping').length,
        health: tasks.filter(t => t.category === 'health').length,
        finance: tasks.filter(t => t.category === 'finance').length,
        other: tasks.filter(t => t.category === 'other').length
      },
      byDueDate: {
        overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length,
        dueToday: tasks.filter(t => {
          if (!t.dueDate) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(t.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime() && !t.completed;
        }).length,
        dueThisWeek: tasks.filter(t => {
          if (!t.dueDate) return false;
          const today = new Date();
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          return new Date(t.dueDate) >= today && new Date(t.dueDate) <= weekFromNow && !t.completed;
        }).length,
        noDueDate: tasks.filter(t => !t.dueDate).length
      },
      timeTracking: {
        withTimeTracking: tasks.filter(t => t.timeTracking && t.timeTracking.enabled).length,
        totalTimeSpent: tasks.reduce((sum, t) => sum + (t.timeTracking?.timeSpent || 0), 0),
        averageTimeSpent: tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + (t.timeTracking?.timeSpent || 0), 0) / tasks.length) : 0
      },
      subtasks: {
        totalSubtasks: tasks.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0),
        completedSubtasks: tasks.reduce((sum, t) => sum + (t.subtasks?.filter(s => s.completed).length || 0), 0)
      },
      comments: {
        totalComments: tasks.reduce((sum, t) => sum + (t.comments?.length || 0), 0),
        totalReplies: tasks.reduce((sum, t) => {
          if (!t.comments) return sum;
          return sum + t.comments.reduce((replySum, c) => replySum + (c.replies?.length || 0), 0);
        }, 0)
      },
      attachments: {
        totalAttachments: tasks.reduce((sum, t) => sum + (t.attachments?.length || 0), 0)
      },
      completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Get comprehensive stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Duplicate task
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const originalTask = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!originalTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Create a duplicate task
    const duplicateTask = new Task({
      title: `${originalTask.title} (Copy)`,
      description: originalTask.description,
      priority: originalTask.priority,
      dueDate: originalTask.dueDate,
      category: originalTask.category,
      notes: originalTask.notes,
      subtasks: originalTask.subtasks,
      tags: originalTask.tags,
      user: req.userId,
      completed: false,
      isFavorite: false,
      isArchived: false
    });

    const savedTask = await duplicateTask.save();

    logActivity(savedTask._id, req.userId, 'task_duplicated', `Task duplicated from ${originalTask.title}`);

    res.json(savedTask);
  } catch (error) {
    console.error('Duplicate task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Move task to category
router.patch('/:id/move-category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldCategory = task.category;
    task.category = category;
    await task.save();

    logActivity(task._id, req.userId, 'category_changed', `Task moved from ${oldCategory} to ${category}`);

    res.json(task);
  } catch (error) {
    console.error('Move category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create template from task
router.post('/:id/create-template', authenticateToken, async (req, res) => {
  try {
    const originalTask = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!originalTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Create a template task
    const templateTask = new Task({
      title: `${originalTask.title} (Template)`,
      description: originalTask.description,
      priority: originalTask.priority,
      category: originalTask.category,
      notes: originalTask.notes,
      subtasks: originalTask.subtasks,
      tags: originalTask.tags,
      user: req.userId,
      completed: false,
      isFavorite: false,
      isArchived: false,
      isTemplate: true
    });

    const savedTemplate = await templateTask.save();

    logActivity(savedTemplate._id, req.userId, 'template_created', `Template created from ${originalTask.title}`);

    res.json(savedTemplate);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = await Task.find({ user: req.userId, isTemplate: true });
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task from template
router.post('/templates/:id/create-task', authenticateToken, async (req, res) => {
  try {
    const template = await Task.findOne({ _id: req.params.id, user: req.userId, isTemplate: true });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Create a new task from template
    const newTask = new Task({
      title: template.title.replace(' (Template)', ''),
      description: template.description,
      priority: template.priority,
      category: template.category,
      notes: template.notes,
      subtasks: template.subtasks,
      tags: template.tags,
      user: req.userId,
      completed: false,
      isFavorite: false,
      isArchived: false,
      isTemplate: false
    });

    const savedTask = await newTask.save();

    logActivity(savedTask._id, req.userId, 'task_from_template', `Task created from template ${template.title}`);

    res.json(savedTask);
  } catch (error) {
    console.error('Create task from template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete template
router.delete('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const template = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId, isTemplate: true });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reaction to comment
router.post('/:id/comments/:commentId/reactions', authenticateToken, async (req, res) => {
  try {
    const { emoji } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user already reacted with this emoji
    const existingReaction = comment.reactions.find(
      r => r.user === req.userId && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      comment.reactions = comment.reactions.filter(r => 
        !(r.user === req.userId && r.emoji === emoji)
      );
    } else {
      // Add reaction
      comment.reactions.push({
        user: req.userId,
        emoji,
        createdAt: new Date()
      });
    }

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reply to comment
router.post('/:id/comments/:commentId/replies', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push({
      text,
      author: req.userId,
      createdAt: new Date()
    });

    logActivity(task, 'comment_replied', 'A reply was added to a comment');
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Add reply error:', error);
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
