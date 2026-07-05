// Task Management Module
class TaskManager {
    constructor() {
        this.tasks = [];
        this.searchQuery = '';
        this.filter = 'all'; // all, active, completed
        this.sortBy = 'newest'; // newest, oldest, dueDate, priority, category, title
        this.currentEditTaskId = null;
        this.currentSubtasks = []; // For add form
        this.currentEditSubtasks = []; // For edit form
        this.currentTags = []; // For add form
        this.currentEditTags = []; // For edit form
        this.timers = {}; // Store running timers
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showAddTaskForm();
        });

        // Cancel add task button
        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            this.hideAddTaskForm();
        });

        // Cancel edit task button
        document.getElementById('cancelEditTaskBtn').addEventListener('click', () => {
            this.hideEditTaskForm();
        });

        // Task form submission
        document.getElementById('taskFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Edit task form submission
        document.getElementById('editTaskFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTaskUpdate();
        });

        // Search tasks
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this.renderTasks();
        });

        // Filter tasks
        document.getElementById('taskFilter').addEventListener('change', (e) => {
            this.filter = e.target.value;
            this.renderTasks();
        });

        // Sort tasks
        document.getElementById('taskSort').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderTasks();
        });

        // Add subtask buttons
        document.getElementById('addSubtaskBtn').addEventListener('click', () => {
            this.addSubtaskInput('subtasksContainer', this.currentSubtasks);
        });

        document.getElementById('addEditSubtaskBtn').addEventListener('click', () => {
            this.addSubtaskInput('editSubtasksContainer', this.currentEditSubtasks);
        });

        // Reminder toggle listeners
        document.getElementById('taskReminderEnabled').addEventListener('change', (e) => {
            document.getElementById('taskReminderTime').style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('editTaskReminderEnabled').addEventListener('change', (e) => {
            document.getElementById('editTaskReminderTime').style.display = e.target.checked ? 'block' : 'none';
        });

        // Tag input listeners
        document.getElementById('tagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag('tagInput', 'taskTags', this.currentTags);
            }
        });

        document.getElementById('editTagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag('editTagInput', 'editTaskTags', this.currentEditTags);
            }
        });

        // Close toast
        document.getElementById('closeToast').addEventListener('click', () => {
            document.getElementById('messageToast').style.display = 'none';
        });
    }

    showAddTaskForm() {
        document.getElementById('addTaskForm').style.display = 'block';
        document.getElementById('taskTitle').focus();
    }

    hideAddTaskForm() {
        document.getElementById('addTaskForm').style.display = 'none';
        document.getElementById('taskFormElement').reset();
        document.getElementById('subtasksContainer').innerHTML = '';
        this.currentSubtasks = [];
        document.getElementById('taskReminderEnabled').checked = false;
        document.getElementById('taskReminderTime').style.display = 'none';
        this.currentTags = [];
        document.getElementById('taskTags').innerHTML = '';
        document.getElementById('taskTimeTrackingEnabled').checked = false;
    }

    async loadTasks() {
        if (!window.authManager.isAuthenticated()) {
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('http://localhost:5002/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.tasks = data;
                this.renderTasks();
            } else {
                this.showMessage('Failed to load tasks', 'error');
            }
        } catch (error) {
            console.error('Load tasks error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async addTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const category = document.getElementById('taskCategory').value;
        const notes = document.getElementById('taskNotes').value.trim();
        
        // Collect subtasks
        const subtaskInputs = document.querySelectorAll('#subtasksContainer .subtask-item input[type="text"]');
        const subtasks = Array.from(subtaskInputs)
            .map(input => input.value.trim())
            .filter(text => text)
            .map(text => ({ title: text, completed: false }));

        // Collect reminder
        const reminderEnabled = document.getElementById('taskReminderEnabled').checked;
        const reminderTime = document.getElementById('taskReminderTime').value;
        const reminder = reminderEnabled ? { enabled: true, time: reminderTime || null } : { enabled: false, time: null };

        // Collect tags
        const tags = [...this.currentTags];

        // Collect time tracking
        const timeTrackingEnabled = document.getElementById('taskTimeTrackingEnabled').checked;
        const timeTracking = timeTrackingEnabled ? { enabled: true, timeSpent: 0, timerRunning: false, startTime: null } : { enabled: false, timeSpent: 0, timerRunning: false, startTime: null };

        if (!title) {
            this.showMessage('Task title is required', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('http://localhost:5002/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ title, description, priority, dueDate: dueDate || null, category, notes, subtasks, reminder, tags, timeTracking })
            });

            const data = await response.json();

            if (response.ok) {
                this.tasks.unshift(data);
                this.renderTasks();
                this.hideAddTaskForm();
                this.showMessage('Task added successfully!', 'success');
            } else {
                this.showMessage(data.message || 'Failed to add task', 'error');
            }
        } catch (error) {
            console.error('Add task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async updateTask(taskId, updates) {
        this.showLoading(true);

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (response.ok) {
                const index = this.tasks.findIndex(task => task._id === taskId);
                if (index !== -1) {
                    this.tasks[index] = data;
                    this.renderTasks();
                }
                this.showMessage('Task updated successfully!', 'success');
            } else {
                this.showMessage(data.message || 'Failed to update task', 'error');
            }
        } catch (error) {
            console.error('Update task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        this.currentEditTaskId = taskId;
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description || '';
        document.getElementById('editTaskPriority').value = task.priority || 'medium';
        document.getElementById('editTaskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';
        document.getElementById('editTaskCategory').value = task.category || 'other';
        document.getElementById('editTaskNotes').value = task.notes || '';
        
        // Load subtasks
        this.currentEditSubtasks = task.subtasks ? [...task.subtasks] : [];
        this.renderSubtasks('editSubtasksContainer', this.currentEditSubtasks);
        
        // Load reminder
        if (task.reminder && task.reminder.enabled) {
            document.getElementById('editTaskReminderEnabled').checked = true;
            document.getElementById('editTaskReminderTime').style.display = 'block';
            document.getElementById('editTaskReminderTime').value = task.reminder.time ? task.reminder.time.slice(0, 16) : '';
        } else {
            document.getElementById('editTaskReminderEnabled').checked = false;
            document.getElementById('editTaskReminderTime').style.display = 'none';
        }
        
        // Load tags
        this.currentEditTags = task.tags ? [...task.tags] : [];
        this.renderTags('editTaskTags', this.currentEditTags);
        
        // Load time tracking
        if (task.timeTracking && task.timeTracking.enabled) {
            document.getElementById('editTaskTimeTrackingEnabled').checked = true;
        } else {
            document.getElementById('editTaskTimeTrackingEnabled').checked = false;
        }
        
        document.getElementById('editTaskForm').style.display = 'block';
        document.getElementById('addTaskForm').style.display = 'none';
        document.getElementById('editTaskTitle').focus();
    }

    hideEditTaskForm() {
        this.currentEditTaskId = null;
        document.getElementById('editTaskFormElement').reset();
        document.getElementById('editSubtasksContainer').innerHTML = '';
        this.currentEditSubtasks = [];
        document.getElementById('editTaskReminderEnabled').checked = false;
        document.getElementById('editTaskReminderTime').style.display = 'none';
        this.currentEditTags = [];
        document.getElementById('editTaskTags').innerHTML = '';
        document.getElementById('editTaskTimeTrackingEnabled').checked = false;
        document.getElementById('editTaskForm').style.display = 'none';
    }

    async saveTaskUpdate() {
        if (!this.currentEditTaskId) return;

        const title = document.getElementById('editTaskTitle').value.trim();
        const description = document.getElementById('editTaskDescription').value.trim();
        const priority = document.getElementById('editTaskPriority').value;
        const dueDate = document.getElementById('editTaskDueDate').value;
        const category = document.getElementById('editTaskCategory').value;
        const notes = document.getElementById('editTaskNotes').value.trim();
        
        // Collect subtasks
        const subtaskInputs = document.querySelectorAll('#editSubtasksContainer .subtask-item input[type="text"]');
        const subtasks = Array.from(subtaskInputs)
            .map(input => input.value.trim())
            .filter(text => text)
            .map(text => ({ title: text, completed: false }));

        // Collect reminder
        const reminderEnabled = document.getElementById('editTaskReminderEnabled').checked;
        const reminderTime = document.getElementById('editTaskReminderTime').value;
        const reminder = reminderEnabled ? { enabled: true, time: reminderTime || null } : { enabled: false, time: null };

        // Collect tags
        const tags = [...this.currentEditTags];

        // Collect time tracking
        const timeTrackingEnabled = document.getElementById('editTaskTimeTrackingEnabled').checked;
        const timeTracking = timeTrackingEnabled ? { enabled: true, timeSpent: 0, timerRunning: false, startTime: null } : { enabled: false, timeSpent: 0, timerRunning: false, startTime: null };

        if (!title) {
            this.showMessage('Task title is required', 'error');
            return;
        }

        await this.updateTask(this.currentEditTaskId, { title, description, priority, dueDate: dueDate || null, category, notes, subtasks, reminder, tags, timeTracking });
        this.hideEditTaskForm();
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const taskCounter = document.getElementById('taskCounter');

        let filteredTasks = this.tasks.filter(task => {
            // Apply search filter
            if (this.searchQuery) {
                const titleMatch = task.title.toLowerCase().includes(this.searchQuery);
                const descriptionMatch = (task.description || '').toLowerCase().includes(this.searchQuery);
                if (!titleMatch && !descriptionMatch) return false;
            }

            // Apply status filter
            if (this.filter === 'active' && task.completed) return false;
            if (this.filter === 'completed' && !task.completed) return false;

            return true;
        });

        // Apply sorting
        filteredTasks = this.sortTasks(filteredTasks);

        // Update task counter
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        taskCounter.textContent = `${totalTasks} tasks (${completedTasks} completed)`;

        // Update statistics dashboard
        this.updateStats();

        if (filteredTasks.length === 0) {
            taskList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        taskList.style.display = 'grid';
        emptyState.style.display = 'none';

        // Clear existing content
        taskList.innerHTML = '';

        // Add tasks
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.taskId = task._id;
            
            taskElement.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <span class="priority-badge ${task.priority || 'medium'}">${task.priority || 'medium'}</span>
                    <span class="category-badge ${task.category || 'other'}">${this.getCategoryIcon(task.category)} ${task.category || 'other'}</span>
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    ${task.notes ? `<div class="task-notes"><i class="fas fa-sticky-note"></i> ${this.escapeHtml(task.notes)}</div>` : ''}
                    ${this.renderSubtasksDisplay(task.subtasks)}
                    ${this.renderReminderBadge(task.reminder)}
                    ${this.renderTagsDisplay(task.tags)}
                    ${this.renderTimeTracking(task.timeTracking, task._id)}
                    ${this.getDueDateBadge(task.dueDate)}
                </div>
                <div class="task-meta">
                    <div class="task-date">Created: ${new Date(task.createdAt).toLocaleDateString()}</div>
                    <div class="task-actions">
                        <button class="btn btn-outline btn-sm" data-action="edit">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" data-action="delete">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            
            taskList.appendChild(taskElement);
        });

        // Add single event listener to task list
        taskList.onclick = (e) => {
            const action = e.target.dataset.action || e.target.closest('[data-action]')?.dataset.action;
            const taskItem = e.target.closest('.task-item');
            
            if (!action) return;
            
            // Handle timer actions (they have data-task-id directly on button)
            const timerTaskId = e.target.dataset.taskId || e.target.closest('[data-task-id]')?.dataset.taskId;
            if (timerTaskId && ['startTimer', 'stopTimer', 'resetTimer'].includes(action)) {
                switch(action) {
                    case 'startTimer':
                        this.startTimer(timerTaskId);
                        break;
                    case 'stopTimer':
                        this.stopTimer(timerTaskId);
                        break;
                    case 'resetTimer':
                        this.resetTimer(timerTaskId);
                        break;
                }
                return;
            }
            
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.taskId;
            
            switch(action) {
                case 'toggle':
                    this.toggleTask(taskId);
                    break;
                case 'edit':
                    this.editTask(taskId);
                    break;
                case 'delete':
                    this.deleteTask(taskId);
                    break;
            }
        };
    }

    async toggleTask(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        this.showLoading(true);

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const index = this.tasks.findIndex(task => task._id === taskId);
                if (index !== -1) {
                    this.tasks[index] = data;
                    this.renderTasks();
                }
            } else {
                this.showMessage(data.message || 'Failed to toggle task', 'error');
            }
        } catch (error) {
            console.error('Toggle task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.tasks = this.tasks.filter(task => task._id !== taskId);
                this.renderTasks();
                this.showMessage('Task deleted successfully!', 'success');
            } else {
                this.showMessage(data.message || 'Failed to delete task', 'error');
            }
        } catch (error) {
            console.error('Delete task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getDueDateBadge(dueDate) {
        if (!dueDate) {
            return '<span class="due-date-badge none"><i class="fas fa-calendar-times"></i> No due date</span>';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `<span class="due-date-badge overdue"><i class="fas fa-exclamation-circle"></i> Overdue by ${Math.abs(diffDays)} day(s)</span>`;
        } else if (diffDays === 0) {
            return '<span class="due-date-badge today"><i class="fas fa-clock"></i> Due today</span>';
        } else if (diffDays === 1) {
            return '<span class="due-date-badge upcoming"><i class="fas fa-calendar-day"></i> Due tomorrow</span>';
        } else {
            return `<span class="due-date-badge upcoming"><i class="fas fa-calendar"></i> Due in ${diffDays} days</span>`;
        }
    }

    getCategoryIcon(category) {
        const icons = {
            work: '💼',
            personal: '👤',
            shopping: '🛒',
            health: '🏥',
            finance: '💰',
            other: '📌'
        };
        return icons[category] || icons.other;
    }

    addSubtaskInput(containerId, subtasksArray) {
        const container = document.getElementById(containerId);
        const subtaskItem = document.createElement('div');
        subtaskItem.className = 'subtask-item';
        subtaskItem.innerHTML = `
            <input type="text" placeholder="Enter subtask..." class="subtask-input">
            <button type="button" class="btn-remove-subtask">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        subtaskItem.querySelector('.btn-remove-subtask').addEventListener('click', () => {
            subtaskItem.remove();
        });
        
        container.appendChild(subtaskItem);
    }

    renderSubtasks(containerId, subtasks) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        subtasks.forEach(subtask => {
            const subtaskItem = document.createElement('div');
            subtaskItem.className = 'subtask-item';
            subtaskItem.innerHTML = `
                <input type="text" value="${this.escapeHtml(subtask.title)}" placeholder="Enter subtask..." class="subtask-input">
                <button type="button" class="btn-remove-subtask">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            subtaskItem.querySelector('.btn-remove-subtask').addEventListener('click', () => {
                subtaskItem.remove();
            });
            
            container.appendChild(subtaskItem);
        });
    }

    renderSubtasksDisplay(subtasks) {
        if (!subtasks || subtasks.length === 0) return '';
        
        const totalSubtasks = subtasks.length;
        const completedSubtasks = subtasks.filter(s => s.completed).length;
        const progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
        
        const subtasksHtml = subtasks.map(subtask => `
            <div class="task-subtask ${subtask.completed ? 'completed' : ''}">
                <input type="checkbox" ${subtask.completed ? 'checked' : ''} disabled>
                <span>${this.escapeHtml(subtask.title)}</span>
            </div>
        `).join('');
        
        const progressHtml = `
            <div class="task-progress">
                <div class="task-progress-bar">
                    <div class="task-progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="task-progress-text">${completedSubtasks}/${totalSubtasks} subtasks completed (${progressPercentage}%)</div>
            </div>
        `;
        
        return `<div class="task-subtasks">${progressHtml}${subtasksHtml}</div>`;
    }

    renderReminderBadge(reminder) {
        if (!reminder || !reminder.enabled || !reminder.time) return '';
        
        const reminderDate = new Date(reminder.time);
        const formattedDate = reminderDate.toLocaleString();
        
        return `<span class="reminder-badge"><i class="fas fa-bell"></i> Reminder: ${formattedDate}</span>`;
    }

    addTag(inputId, displayId, tagsArray) {
        const input = document.getElementById(inputId);
        const tag = input.value.trim();
        
        if (tag && !tagsArray.includes(tag)) {
            tagsArray.push(tag);
            this.renderTags(displayId, tagsArray);
            input.value = '';
        }
    }

    removeTag(tag, tagsArray, displayId) {
        const index = tagsArray.indexOf(tag);
        if (index > -1) {
            tagsArray.splice(index, 1);
            this.renderTags(displayId, tagsArray);
        }
    }

    renderTags(displayId, tagsArray) {
        const display = document.getElementById(displayId);
        display.innerHTML = '';
        
        tagsArray.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${this.escapeHtml(tag)}
                <span class="tag-remove" data-tag="${this.escapeHtml(tag)}">&times;</span>
            `;
            
            tagElement.querySelector('.tag-remove').addEventListener('click', () => {
                this.removeTag(tag, tagsArray, displayId);
            });
            
            display.appendChild(tagElement);
        });
    }

    renderTagsDisplay(tags) {
        if (!tags || tags.length === 0) return '';
        
        const tagsHtml = tags.map(tag => `
            <span class="tag">${this.escapeHtml(tag)}</span>
        `).join('');
        
        return `<div class="task-tags" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.25rem;">${tagsHtml}</div>`;
    }

    renderTimeTracking(timeTracking, taskId) {
        if (!timeTracking || !timeTracking.enabled) return '';
        
        const isRunning = timeTracking.timerRunning;
        const timeSpent = this.formatTime(timeTracking.timeSpent || 0);
        
        return `
            <div class="time-tracking">
                <span class="time-display ${isRunning ? 'timer-running' : ''}">${timeSpent}</span>
                <button class="timer-btn ${isRunning ? 'timer-btn-stop' : 'timer-btn-start'}" 
                        data-action="${isRunning ? 'stopTimer' : 'startTimer'}" 
                        data-task-id="${taskId}">
                    <i class="fas ${isRunning ? 'fa-stop' : 'fa-play'}"></i>
                </button>
                <button class="timer-btn timer-btn-reset" 
                        data-action="resetTimer" 
                        data-task-id="${taskId}">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
        `;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    async startTimer(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;
        
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/timer/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = data;
                    this.renderTasks();
                    this.startLocalTimer(taskId);
                }
            }
        } catch (error) {
            console.error('Error starting timer:', error);
        }
    }

    async stopTimer(taskId) {
        this.stopLocalTimer(taskId);
        
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/timer/stop`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = data;
                    this.renderTasks();
                }
            }
        } catch (error) {
            console.error('Error stopping timer:', error);
        }
    }

    async resetTimer(taskId) {
        this.stopLocalTimer(taskId);
        
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/timer/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = data;
                    this.renderTasks();
                }
            }
        } catch (error) {
            console.error('Error resetting timer:', error);
        }
    }

    startLocalTimer(taskId) {
        if (this.timers[taskId]) return;
        
        const task = this.tasks.find(t => t._id === taskId);
        if (!task || !task.timeTracking || !task.timeTracking.startTime) return;
        
        const startTime = new Date(task.timeTracking.startTime).getTime();
        
        this.timers[taskId] = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const totalSpent = (task.timeTracking.timeSpent || 0) + elapsed;
            
            const timeDisplay = document.querySelector(`[data-task-id="${taskId}"]`).closest('.time-tracking').querySelector('.time-display');
            if (timeDisplay) {
                timeDisplay.textContent = this.formatTime(totalSpent);
            }
        }, 1000);
    }

    stopLocalTimer(taskId) {
        if (this.timers[taskId]) {
            clearInterval(this.timers[taskId]);
            delete this.timers[taskId];
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = this.tasks.filter(t => {
            if (!t.dueDate || t.completed) return false;
            const due = new Date(t.dueDate);
            due.setHours(0, 0, 0, 0);
            return due < today;
        }).length;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('overdueTasks').textContent = overdue;
    }

    sortTasks(tasks) {
        const sorted = [...tasks];
        
        switch (this.sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'dueDate':
                sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                sorted.sort((a, b) => {
                    const aPriority = priorityOrder[a.priority] || 1;
                    const bPriority = priorityOrder[b.priority] || 1;
                    return aPriority - bPriority;
                });
                break;
            case 'category':
                sorted.sort((a, b) => (a.category || 'other').localeCompare(b.category || 'other'));
                break;
            case 'title':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                break;
        }
        
        return sorted;
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = show ? 'flex' : 'none';
    }

    showMessage(message, type = 'info') {
        const toast = document.getElementById('messageToast');
        const messageText = document.getElementById('messageText');
        
        messageText.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'flex';

        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// Initialize task manager
window.taskManager = new TaskManager();
