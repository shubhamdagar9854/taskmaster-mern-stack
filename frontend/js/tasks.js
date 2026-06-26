// Task Management Module
class TaskManager {
    constructor() {
        this.tasks = [];
        this.searchQuery = '';
        this.filter = 'all'; // all, active, completed
        this.currentEditTaskId = null;
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
                body: JSON.stringify({ title, description, priority, dueDate: dueDate || null, category })
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
        document.getElementById('editTaskForm').style.display = 'block';
        document.getElementById('addTaskForm').style.display = 'none';
        document.getElementById('editTaskTitle').focus();
    }

    hideEditTaskForm() {
        this.currentEditTaskId = null;
        document.getElementById('editTaskFormElement').reset();
        document.getElementById('editTaskForm').style.display = 'none';
    }

    async saveTaskUpdate() {
        if (!this.currentEditTaskId) return;

        const title = document.getElementById('editTaskTitle').value.trim();
        const description = document.getElementById('editTaskDescription').value.trim();
        const priority = document.getElementById('editTaskPriority').value;
        const dueDate = document.getElementById('editTaskDueDate').value;
        const category = document.getElementById('editTaskCategory').value;

        if (!title) {
            this.showMessage('Task title is required', 'error');
            return;
        }

        await this.updateTask(this.currentEditTaskId, { title, description, priority, dueDate: dueDate || null, category });
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

        // Update task counter
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        taskCounter.textContent = `${totalTasks} tasks (${completedTasks} completed)`;

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
            
            if (!action || !taskItem) return;
            
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
