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
        this.currentCommentTaskId = null; // Track current task for comments
        this.templates = []; // Store templates
        this.selectedTasks = new Set(); // Store selected task IDs for bulk actions
        this.userTags = []; // Store user's custom tags
        this.activeTagFilter = null; // Store active tag filter
        this.advancedFilters = {
            priority: '',
            category: '',
            status: '',
            dueDateFrom: '',
            dueDateTo: '',
            tags: '',
            subtasks: '',
            attachments: '',
            dependencies: '',
            recurring: ''
        };
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

        // Comments modal
        document.getElementById('closeCommentsModal').addEventListener('click', () => {
            this.hideCommentsModal();
        });

        document.getElementById('addCommentBtn').addEventListener('click', () => {
            this.addComment();
        });

        // Templates modal
        document.getElementById('showTemplatesBtn').addEventListener('click', () => {
            this.showTemplatesModal();
        });

        document.getElementById('closeTemplatesModal').addEventListener('click', () => {
            this.hideTemplatesModal();
        });

        document.getElementById('createTemplateBtn').addEventListener('click', () => {
            this.hideTemplatesModal();
            this.showAddTaskForm();
        });

        // Template toggle
        document.getElementById('taskIsTemplate').addEventListener('change', (e) => {
            document.getElementById('templateNameGroup').style.display = e.target.checked ? 'block' : 'none';
        });

        // Recurring toggle
        document.getElementById('taskRecurringEnabled').addEventListener('change', (e) => {
            document.getElementById('recurringOptionsGroup').style.display = e.target.checked ? 'block' : 'none';
            document.getElementById('recurringIntervalGroup').style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('taskRecurringFrequency').addEventListener('change', (e) => {
            const intervalGroup = document.getElementById('recurringIntervalGroup');
            if (e.target.value === 'custom') {
                intervalGroup.style.display = 'block';
            } else {
                intervalGroup.style.display = 'none';
            }
        });

        // Bulk actions
        document.getElementById('bulkActionsBtn').addEventListener('click', () => {
            this.showBulkActionsModal();
        });

        document.getElementById('closeBulkActionsModal').addEventListener('click', () => {
            this.hideBulkActionsModal();
        });

        document.getElementById('bulkCompleteBtn').addEventListener('click', () => {
            this.bulkComplete();
        });

        document.getElementById('bulkIncompleteBtn').addEventListener('click', () => {
            this.bulkIncomplete();
        });

        document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
            this.bulkDelete();
        });

        document.getElementById('bulkPriorityBtn').addEventListener('click', () => {
            this.bulkChangePriority();
        });

        document.getElementById('clearSelectionBtn').addEventListener('click', () => {
            this.clearSelection();
        });

        document.getElementById('bulkSelectToggle').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        // Tags management
        document.getElementById('showTagsBtn').addEventListener('click', () => {
            this.showTagsModal();
        });

        document.getElementById('closeTagsModal').addEventListener('click', () => {
            this.hideTagsModal();
        });

        document.getElementById('addTagBtn').addEventListener('click', () => {
            this.addNewTag();
        });

        document.getElementById('newTagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewTag();
            }
        });

        document.getElementById('clearTagFilter').addEventListener('click', () => {
            this.clearTagFilter();
        });

        // Statistics management
        document.getElementById('showStatsBtn').addEventListener('click', () => {
            this.showStatsModal();
        });

        document.getElementById('closeStatsModal').addEventListener('click', () => {
            this.hideStatsModal();
        });

        // Advanced search
        document.getElementById('advancedSearchBtn').addEventListener('click', () => {
            this.showAdvancedSearchModal();
        });

        document.getElementById('closeAdvancedSearchModal').addEventListener('click', () => {
            this.hideAdvancedSearchModal();
        });

        document.getElementById('applyFiltersBtn').addEventListener('click', () => {
            this.applyAdvancedFilters();
        });

        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearAdvancedFilters();
        });
    }

    showAddTaskForm() {
        document.getElementById('addTaskForm').style.display = 'block';
        document.getElementById('taskTitle').focus();
        this.populateDependenciesSelect('taskDependencies');
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
        document.getElementById('taskAttachment').value = '';
        document.getElementById('taskIsTemplate').checked = false;
        document.getElementById('templateNameGroup').style.display = 'none';
        document.getElementById('taskRecurringEnabled').checked = false;
        document.getElementById('recurringOptionsGroup').style.display = 'none';
        document.getElementById('recurringIntervalGroup').style.display = 'none';
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
                this.loadUserTags();
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

        // Collect dependencies
        const dependencySelect = document.getElementById('taskDependencies');
        const dependencies = Array.from(dependencySelect.selectedOptions).map(option => option.value);

        // Collect template info
        const isTemplate = document.getElementById('taskIsTemplate').checked;
        const templateName = document.getElementById('taskTemplateName').value.trim();

        // Collect recurring info
        const recurringEnabled = document.getElementById('taskRecurringEnabled').checked;
        const recurringFrequency = document.getElementById('taskRecurringFrequency').value;
        const recurringInterval = parseInt(document.getElementById('taskRecurringInterval').value) || 1;
        const recurring = recurringEnabled ? { enabled: true, frequency: recurringFrequency, interval: recurringInterval } : { enabled: false, frequency: 'daily', interval: 1 };

        if (!title) {
            this.showMessage('Task title is required', 'error');
            return;
        }

        if (isTemplate && !templateName) {
            this.showMessage('Template name is required', 'error');
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
                body: JSON.stringify({ title, description, priority, dueDate: dueDate || null, category, notes, subtasks, reminder, tags, timeTracking, dependencies, isTemplate, templateName, recurring })
            });

            const data = await response.json();

            if (response.ok) {
                this.tasks.unshift(data);
                this.renderTasks();
                
                // Handle file uploads after task creation
                const fileInput = document.getElementById('taskAttachment');
                if (fileInput.files.length > 0) {
                    Array.from(fileInput.files).forEach(file => {
                        this.uploadAttachment(data._id, file);
                    });
                    fileInput.value = '';
                }
                
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
        
        // Load attachments
        this.renderAttachmentsList('editTaskAttachmentsList', task.attachments, taskId);
        
        // Load dependencies
        this.populateDependenciesSelect('editTaskDependencies', taskId);
        this.renderDependenciesList('editTaskDependenciesList', task.dependencies, taskId);
        
        // Load recurring
        if (task.recurring && task.recurring.enabled) {
            document.getElementById('editTaskRecurringEnabled').checked = true;
            document.getElementById('editRecurringOptionsGroup').style.display = 'block';
            document.getElementById('editRecurringIntervalGroup').style.display = 'block';
            document.getElementById('editTaskRecurringFrequency').value = task.recurring.frequency;
            document.getElementById('editTaskRecurringInterval').value = task.recurring.interval;
        } else {
            document.getElementById('editTaskRecurringEnabled').checked = false;
            document.getElementById('editRecurringOptionsGroup').style.display = 'none';
            document.getElementById('editRecurringIntervalGroup').style.display = 'none';
        }
        
        // Setup file upload handler
        const fileInput = document.getElementById('editTaskAttachment');
        fileInput.onchange = (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    this.uploadAttachment(taskId, file);
                });
                fileInput.value = '';
            }
        };
        
        // Setup dependency selection handler
        const dependencySelect = document.getElementById('editTaskDependencies');
        dependencySelect.onchange = (e) => {
            const selectedOptions = Array.from(dependencySelect.selectedOptions);
            selectedOptions.forEach(option => {
                if (option.value) {
                    this.addDependency(taskId, option.value);
                }
            });
            dependencySelect.selectedIndex = 0;
        };
        
        // Setup edit recurring toggle
        document.getElementById('editTaskRecurringEnabled').addEventListener('change', (e) => {
            document.getElementById('editRecurringOptionsGroup').style.display = e.target.checked ? 'block' : 'none';
            document.getElementById('editRecurringIntervalGroup').style.display = e.target.checked ? 'block' : 'none';
        });
        
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
        document.getElementById('editTaskAttachmentsList').innerHTML = '';
        document.getElementById('editTaskDependenciesList').innerHTML = '';
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

        // Collect dependencies (from current task state since we add/remove dynamically)
        const task = this.tasks.find(t => t._id === this.currentEditTaskId);
        const dependencies = task ? task.dependencies.map(dep => dep._id) : [];

        // Collect recurring info
        const recurringEnabled = document.getElementById('editTaskRecurringEnabled').checked;
        const recurringFrequency = document.getElementById('editTaskRecurringFrequency').value;
        const recurringInterval = parseInt(document.getElementById('editTaskRecurringInterval').value) || 1;
        const recurring = recurringEnabled ? { enabled: true, frequency: recurringFrequency, interval: recurringInterval } : { enabled: false, frequency: 'daily', interval: 1 };

        if (!title) {
            this.showMessage('Task title is required', 'error');
            return;
        }

        await this.updateTask(this.currentEditTaskId, { title, description, priority, dueDate: dueDate || null, category, notes, subtasks, reminder, tags, timeTracking, dependencies, recurring });
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

            // Apply tag filter
            if (this.activeTagFilter) {
                const hasTag = task.tags && task.tags.some(tag => 
                    tag.toLowerCase() === this.activeTagFilter.toLowerCase()
                );
                if (!hasTag) return false;
            }

            // Apply advanced filters
            if (this.advancedFilters.priority && task.priority !== this.advancedFilters.priority) return false;
            if (this.advancedFilters.category && task.category !== this.advancedFilters.category) return false;
            if (this.advancedFilters.status === 'active' && task.completed) return false;
            if (this.advancedFilters.status === 'completed' && !task.completed) return false;
            if (this.advancedFilters.dueDateFrom) {
                const fromDate = new Date(this.advancedFilters.dueDateFrom);
                if (!task.dueDate || new Date(task.dueDate) < fromDate) return false;
            }
            if (this.advancedFilters.dueDateTo) {
                const toDate = new Date(this.advancedFilters.dueDateTo);
                if (!task.dueDate || new Date(task.dueDate) > toDate) return false;
            }
            if (this.advancedFilters.tags && (!task.tags || !task.tags.includes(this.advancedFilters.tags))) return false;
            if (this.advancedFilters.subtasks === 'yes' && (!task.subtasks || task.subtasks.length === 0)) return false;
            if (this.advancedFilters.subtasks === 'no' && task.subtasks && task.subtasks.length > 0) return false;
            if (this.advancedFilters.attachments === 'yes' && (!task.attachments || task.attachments.length === 0)) return false;
            if (this.advancedFilters.attachments === 'no' && task.attachments && task.attachments.length > 0) return false;
            if (this.advancedFilters.dependencies === 'yes' && (!task.dependencies || task.dependencies.length === 0)) return false;
            if (this.advancedFilters.dependencies === 'no' && task.dependencies && task.dependencies.length > 0) return false;
            if (this.advancedFilters.recurring === 'yes' && (!task.recurring || !task.recurring.enabled)) return false;
            if (this.advancedFilters.recurring === 'no' && task.recurring && task.recurring.enabled) return false;

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
            taskElement.className = `task-item ${task.completed ? 'completed' : ''} ${this.selectedTasks.has(task._id) ? 'bulk-selected' : ''}`;
            taskElement.dataset.taskId = task._id;
            
            taskElement.innerHTML = `
                <input type="checkbox" class="task-bulk-checkbox" data-bulk-select="${task._id}" ${this.selectedTasks.has(task._id) ? 'checked' : ''}>
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
                    ${this.renderAttachmentsDisplay(task.attachments)}
                    ${this.renderDependenciesDisplay(task.dependencies)}
                    ${this.renderRecurringBadge(task.recurring)}
                    ${this.getDueDateBadge(task.dueDate)}
                </div>
                <div class="task-meta">
                    <div class="task-date">Created: ${new Date(task.createdAt).toLocaleDateString()}</div>
                    <div class="task-actions">
                        <button class="btn btn-outline btn-sm" data-action="edit">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline btn-sm" data-action="comments">
                            <i class="fas fa-comments"></i> Comments
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
            const bulkSelect = e.target.dataset.bulkSelect;
            const taskItem = e.target.closest('.task-item');
            
            // Handle bulk selection
            if (bulkSelect) {
                const taskId = bulkSelect;
                if (e.target.checked) {
                    this.selectedTasks.add(taskId);
                    taskItem.classList.add('bulk-selected');
                } else {
                    this.selectedTasks.delete(taskId);
                    taskItem.classList.remove('bulk-selected');
                }
                document.getElementById('bulkSelectToggle').checked = false;
                return;
            }
            
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
                case 'comments':
                    this.showCommentsModal(taskId);
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

        // Check if it's a recurring task being completed
        if (task.recurring && task.recurring.enabled && !task.completed) {
            try {
                const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/complete-recurring`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${window.authManager.getToken()}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Remove completed task and add new task
                    this.tasks = this.tasks.filter(t => t._id !== taskId);
                    this.tasks.unshift(data.nextTask);
                    this.renderTasks();
                    this.showMessage('Task completed! Next occurrence created.', 'success');
                } else {
                    const error = await response.json();
                    this.showMessage(error.message || 'Failed to complete recurring task', 'error');
                }
            } catch (error) {
                console.error('Complete recurring task error:', error);
                this.showMessage('Failed to complete recurring task', 'error');
            } finally {
                this.showLoading(false);
            }
            return;
        }

        // Normal toggle
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
            const userTag = this.userTags.find(ut => ut.name.toLowerCase() === tag.toLowerCase());
            const color = userTag ? userTag.color : '#6b7280';
            
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.style.backgroundColor = color + '20';
            tagElement.style.color = color;
            tagElement.style.borderColor = color;
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
        
        const tagsHtml = tags.map(tag => {
            const userTag = this.userTags.find(ut => ut.name.toLowerCase() === tag.toLowerCase());
            const color = userTag ? userTag.color : '#6b7280';
            return `<span class="task-tag" style="background-color: ${color}20; color: ${color}; border-color: ${color};">${this.escapeHtml(tag)}</span>`;
        }).join('');
        
        return `<div class="task-tags" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.25rem;">${tagsHtml}</div>`;
    }

    // Statistics Methods
    showStatsModal() {
        this.calculateStatistics();
        document.getElementById('statsModal').classList.remove('hidden');
    }

    hideStatsModal() {
        document.getElementById('statsModal').classList.add('hidden');
    }

    calculateStatistics() {
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

        // Update overview stats
        document.getElementById('statTotalTasks').textContent = total;
        document.getElementById('statCompletedTasks').textContent = completed;
        document.getElementById('statPendingTasks').textContent = pending;
        document.getElementById('statOverdueTasks').textContent = overdue;

        // Calculate completion rate
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        document.getElementById('completionRateBar').style.width = `${completionRate}%`;
        document.getElementById('completionRateText').textContent = `${completionRate}%`;

        // Calculate priority distribution
        const highPriority = this.tasks.filter(t => t.priority === 'high').length;
        const mediumPriority = this.tasks.filter(t => t.priority === 'medium').length;
        const lowPriority = this.tasks.filter(t => t.priority === 'low').length;
        
        const maxPriority = Math.max(highPriority, mediumPriority, lowPriority, 1);
        
        document.getElementById('highPriorityBar').style.width = `${(highPriority / maxPriority) * 100}%`;
        document.getElementById('highPriorityCount').textContent = highPriority;
        document.getElementById('mediumPriorityBar').style.width = `${(mediumPriority / maxPriority) * 100}%`;
        document.getElementById('mediumPriorityCount').textContent = mediumPriority;
        document.getElementById('lowPriorityBar').style.width = `${(lowPriority / maxPriority) * 100}%`;
        document.getElementById('lowPriorityCount').textContent = lowPriority;

        // Calculate category distribution
        this.renderCategoryChart();

        // Calculate activity (last 7 days)
        this.renderActivityChart();

        // Generate insights
        this.generateInsights(total, completed, pending, overdue, completionRate);
    }

    renderCategoryChart() {
        const categories = ['work', 'personal', 'shopping', 'health', 'finance', 'other'];
        const categoryCounts = {};
        
        categories.forEach(cat => {
            categoryCounts[cat] = this.tasks.filter(t => t.category === cat).length;
        });

        const maxCount = Math.max(...Object.values(categoryCounts), 1);
        const categoryChart = document.getElementById('categoryChart');
        categoryChart.innerHTML = '';

        categories.forEach(cat => {
            const count = categoryCounts[cat];
            const percentage = (count / maxCount) * 100;
            
            const bar = document.createElement('div');
            bar.className = 'category-bar';
            bar.innerHTML = `
                <span class="category-bar-label">${this.getCategoryIcon(cat)} ${cat}</span>
                <div class="category-bar-fill" style="width: ${percentage}%"></div>
                <span class="category-bar-count">${count}</span>
            `;
            categoryChart.appendChild(bar);
        });
    }

    renderActivityChart() {
        const activityChart = document.getElementById('activityChart');
        activityChart.innerHTML = '';

        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            days.push({
                date: date,
                label: date.toLocaleDateString('en-US', { weekday: 'short' })
            });
        }

        const activityCounts = days.map(day => {
            const nextDay = new Date(day.date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const count = this.tasks.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate >= day.date && taskDate < nextDay;
            }).length;

            return { ...day, count };
        });

        const maxCount = Math.max(...activityCounts.map(d => d.count), 1);

        activityCounts.forEach(day => {
            const percentage = (day.count / maxCount) * 100;
            
            const bar = document.createElement('div');
            bar.className = 'activity-bar';
            bar.innerHTML = `
                <span class="activity-bar-label">${day.label}</span>
                <div class="activity-bar-fill" style="width: ${percentage}%"></div>
                <span class="activity-bar-count">${day.count}</span>
            `;
            activityChart.appendChild(bar);
        });
    }

    generateInsights(total, completed, pending, overdue, completionRate) {
        const insightsList = document.getElementById('insightsList');
        insightsList.innerHTML = '';

        const insights = [];

        // Completion rate insight
        if (completionRate >= 80) {
            insights.push({
                icon: '🎯',
                text: `Excellent! You've completed ${completionRate}% of your tasks. Keep up the great work!`
            });
        } else if (completionRate >= 50) {
            insights.push({
                icon: '👍',
                text: `Good progress! ${completionRate}% completion rate. Focus on pending tasks to improve.`
            });
        } else if (completionRate > 0) {
            insights.push({
                icon: '💪',
                text: `You're making progress! ${completionRate}% completed. Try to complete more tasks.`
            });
        }

        // Overdue insight
        if (overdue > 0) {
            insights.push({
                icon: '⚠️',
                text: `You have ${overdue} overdue task${overdue > 1 ? 's' : ''}. Consider prioritizing them.`
            });
        }

        // Pending tasks insight
        if (pending > 10) {
            insights.push({
                icon: '📋',
                text: `You have ${pending} pending tasks. Consider breaking them into smaller subtasks.`
            });
        }

        // Recent activity insight
        const recentTasks = this.tasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return taskDate >= weekAgo;
        }).length;

        if (recentTasks > 5) {
            insights.push({
                icon: '🚀',
                text: `Very active! You created ${recentTasks} tasks this week.`
            });
        } else if (recentTasks === 0) {
            insights.push({
                icon: '💡',
                text: `No new tasks this week. Consider adding some tasks to stay productive.`
            });
        }

        // Default insight if none generated
        if (insights.length === 0) {
            insights.push({
                icon: '✨',
                text: `Start adding tasks to see personalized productivity insights!`
            });
        }

        insights.forEach(insight => {
            const item = document.createElement('div');
            item.className = 'insight-item';
            item.innerHTML = `
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-text">${insight.text}</span>
            `;
            insightsList.appendChild(item);
        });
    }

    // Advanced Search Methods
    showAdvancedSearchModal() {
        this.populateFilterTags();
        document.getElementById('advancedSearchModal').classList.remove('hidden');
    }

    hideAdvancedSearchModal() {
        document.getElementById('advancedSearchModal').classList.add('hidden');
    }

    populateFilterTags() {
        const filterTags = document.getElementById('filterTags');
        filterTags.innerHTML = '<option value="">All Tags</option>';
        
        // Get all unique tags from tasks
        const allTags = new Set();
        this.tasks.forEach(task => {
            if (task.tags) {
                task.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        // Add user tags
        this.userTags.forEach(userTag => {
            allTags.add(userTag.name);
        });
        
        Array.from(allTags).sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            filterTags.appendChild(option);
        });
    }

    applyAdvancedFilters() {
        this.advancedFilters = {
            priority: document.getElementById('filterPriority').value,
            category: document.getElementById('filterCategory').value,
            status: document.getElementById('filterStatus').value,
            dueDateFrom: document.getElementById('filterDueDateFrom').value,
            dueDateTo: document.getElementById('filterDueDateTo').value,
            tags: document.getElementById('filterTags').value,
            subtasks: document.getElementById('filterSubtasks').value,
            attachments: document.getElementById('filterAttachments').value,
            dependencies: document.getElementById('filterDependencies').value,
            recurring: document.getElementById('filterRecurring').value
        };
        
        this.renderTasks();
        this.hideAdvancedSearchModal();
        
        // Show active filters count
        const activeCount = Object.values(this.advancedFilters).filter(v => v !== '').length;
        if (activeCount > 0) {
            this.showMessage(`${activeCount} filter${activeCount > 1 ? 's' : ''} applied`, 'info');
        }
    }

    clearAdvancedFilters() {
        this.advancedFilters = {
            priority: '',
            category: '',
            status: '',
            dueDateFrom: '',
            dueDateTo: '',
            tags: '',
            subtasks: '',
            attachments: '',
            dependencies: '',
            recurring: ''
        };
        
        // Reset form inputs
        document.getElementById('filterPriority').value = '';
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterDueDateFrom').value = '';
        document.getElementById('filterDueDateTo').value = '';
        document.getElementById('filterTags').value = '';
        document.getElementById('filterSubtasks').value = '';
        document.getElementById('filterAttachments').value = '';
        document.getElementById('filterDependencies').value = '';
        document.getElementById('filterRecurring').value = '';
        
        this.renderTasks();
        this.hideAdvancedSearchModal();
        this.showMessage('All filters cleared', 'info');
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

    renderAttachmentsDisplay(attachments) {
        if (!attachments || attachments.length === 0) return '';
        
        const attachmentsHtml = attachments.map(attachment => {
            const icon = this.getFileIcon(attachment.mimetype);
            const size = this.formatFileSize(attachment.size);
            return `
                <span class="task-attachment">
                    <i class="fas ${icon}"></i>
                    ${this.escapeHtml(attachment.originalName)}
                    <span class="attachment-size">(${size})</span>
                </span>
            `;
        }).join('');
        
        return `<div class="task-attachments">${attachmentsHtml}</div>`;
    }

    getFileIcon(mimetype) {
        const iconMap = {
            'image/jpeg': 'fa-image',
            'image/jpg': 'fa-image',
            'image/png': 'fa-image',
            'image/gif': 'fa-image',
            'application/pdf': 'fa-file-pdf',
            'application/msword': 'fa-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word',
            'text/plain': 'fa-file-alt',
            'application/zip': 'fa-file-archive',
            'application/x-zip-compressed': 'fa-file-archive'
        };
        return iconMap[mimetype] || 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    async uploadAttachment(taskId, file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/attachments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = data;
                    this.renderTasks();
                    this.renderAttachmentsList('editTaskAttachmentsList', data.attachments, taskId);
                }
            } else {
                const error = await response.json();
                this.showMessage(error.message || 'Failed to upload attachment', 'error');
            }
        } catch (error) {
            console.error('Upload attachment error:', error);
            this.showMessage('Failed to upload attachment', 'error');
        }
    }

    async deleteAttachment(taskId, attachmentId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/attachments/${attachmentId}`, {
                method: 'DELETE',
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
                    this.renderAttachmentsList('editTaskAttachmentsList', data.attachments, taskId);
                }
            } else {
                this.showMessage('Failed to delete attachment', 'error');
            }
        } catch (error) {
            console.error('Delete attachment error:', error);
            this.showMessage('Failed to delete attachment', 'error');
        }
    }

    renderAttachmentsList(containerId, attachments, taskId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!attachments || attachments.length === 0) return;
        
        attachments.forEach(attachment => {
            const item = document.createElement('div');
            item.className = 'attachment-item';
            item.innerHTML = `
                <div class="attachment-info">
                    <i class="fas ${this.getFileIcon(attachment.mimetype)} attachment-icon"></i>
                    <span class="attachment-name">${this.escapeHtml(attachment.originalName)}</span>
                    <span class="attachment-size">${this.formatFileSize(attachment.size)}</span>
                </div>
                <button class="attachment-remove" data-attachment-id="${attachment._id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            item.querySelector('.attachment-remove').addEventListener('click', () => {
                this.deleteAttachment(taskId, attachment._id);
            });
            
            container.appendChild(item);
        });
    }

    showCommentsModal(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        this.currentCommentTaskId = taskId;
        document.getElementById('commentsModal').classList.remove('hidden');
        this.renderCommentsList(task.comments);
        document.getElementById('commentText').value = '';
        document.getElementById('commentText').focus();
    }

    hideCommentsModal() {
        this.currentCommentTaskId = null;
        document.getElementById('commentsModal').classList.add('hidden');
    }

    renderCommentsList(comments) {
        const container = document.getElementById('commentsList');
        container.innerHTML = '';

        if (!comments || comments.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">No comments yet. Be the first to comment!</p>';
            return;
        }

        comments.forEach(comment => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${this.escapeHtml(comment.author)}</span>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                        <button class="comment-delete" data-comment-id="${comment._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            `;

            item.querySelector('.comment-delete').addEventListener('click', () => {
                this.deleteComment(this.currentCommentTaskId, comment._id);
            });

            container.appendChild(item);
        });
    }

    async addComment() {
        const text = document.getElementById('commentText').value.trim();
        if (!text) {
            this.showMessage('Comment text is required', 'error');
            return;
        }

        const author = window.authManager.getUsername() || 'Anonymous';
        if (!this.currentCommentTaskId) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentCommentTaskId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ text, author })
            });

            if (response.ok) {
                const data = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentCommentTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = data;
                    this.renderCommentsList(data.comments);
                    document.getElementById('commentText').value = '';
                    this.showMessage('Comment added successfully!', 'success');
                }
            } else {
                const error = await response.json();
                this.showMessage(error.message || 'Failed to add comment', 'error');
            }
        } catch (error) {
            console.error('Add comment error:', error);
            this.showMessage('Failed to add comment', 'error');
        }
    }

    async deleteComment(taskId, commentId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = data;
                    this.renderCommentsList(data.comments);
                    this.showMessage('Comment deleted successfully!', 'success');
                }
            } else {
                this.showMessage('Failed to delete comment', 'error');
            }
        } catch (error) {
            console.error('Delete comment error:', error);
            this.showMessage('Failed to delete comment', 'error');
        }
    }

    renderDependenciesDisplay(dependencies) {
        if (!dependencies || dependencies.length === 0) return '';
        
        const dependenciesHtml = dependencies.map(dep => {
            const isCompleted = dep.completed;
            const statusClass = isCompleted ? 'completed' : 'pending';
            const icon = isCompleted ? 'fa-check-circle' : 'fa-clock';
            return `
                <span class="task-dependency ${statusClass}">
                    <i class="fas ${icon}"></i>
                    ${this.escapeHtml(dep.title)}
                </span>
            `;
        }).join('');
        
        return `<div class="task-dependencies">${dependenciesHtml}</div>`;
    }

    renderRecurringBadge(recurring) {
        if (!recurring || !recurring.enabled) return '';
        
        const frequencyLabels = {
            daily: 'Daily',
            weekly: 'Weekly',
            monthly: 'Monthly',
            yearly: 'Yearly',
            custom: `Every ${recurring.interval} days`
        };
        
        const label = frequencyLabels[recurring.frequency] || 'Recurring';
        
        return `<span class="recurring-badge"><i class="fas fa-redo"></i> ${label}</span>`;
    }

    populateDependenciesSelect(selectId, currentTaskId = null) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="">Select tasks this depends on...</option>';
        
        this.tasks.forEach(task => {
            if (task._id !== currentTaskId) {
                const option = document.createElement('option');
                option.value = task._id;
                option.textContent = task.title;
                select.appendChild(option);
            }
        });
    }

    async addDependency(taskId, dependencyId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/dependencies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ dependencyId })
            });

            if (response.ok) {
                const data = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = data;
                    this.renderTasks();
                    this.renderDependenciesList('editTaskDependenciesList', data.dependencies, taskId);
                }
            } else {
                const error = await response.json();
                this.showMessage(error.message || 'Failed to add dependency', 'error');
            }
        } catch (error) {
            console.error('Add dependency error:', error);
            this.showMessage('Failed to add dependency', 'error');
        }
    }

    async removeDependency(taskId, dependencyId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/dependencies/${dependencyId}`, {
                method: 'DELETE',
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
                    this.renderDependenciesList('editTaskDependenciesList', data.dependencies, taskId);
                }
            } else {
                this.showMessage('Failed to remove dependency', 'error');
            }
        } catch (error) {
            console.error('Remove dependency error:', error);
            this.showMessage('Failed to remove dependency', 'error');
        }
    }

    renderDependenciesList(containerId, dependencies, taskId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!dependencies || dependencies.length === 0) return;
        
        dependencies.forEach(dep => {
            const item = document.createElement('div');
            const isCompleted = dep.completed;
            const statusClass = isCompleted ? 'completed' : 'pending';
            const icon = isCompleted ? 'fa-check-circle' : 'fa-clock';
            
            item.className = `dependency-item ${statusClass}`;
            item.innerHTML = `
                <i class="fas ${icon}"></i>
                ${this.escapeHtml(dep.title)}
                <button class="dependency-remove" data-dependency-id="${dep._id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            item.querySelector('.dependency-remove').addEventListener('click', () => {
                this.removeDependency(taskId, dep._id);
            });
            
            container.appendChild(item);
        });
    }

    showTemplatesModal() {
        this.loadTemplates();
        document.getElementById('templatesModal').classList.remove('hidden');
    }

    hideTemplatesModal() {
        document.getElementById('templatesModal').classList.add('hidden');
    }

    async loadTemplates() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/templates', {
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                this.templates = await response.json();
                this.renderTemplatesList();
            }
        } catch (error) {
            console.error('Load templates error:', error);
        }
    }

    renderTemplatesList() {
        const container = document.getElementById('templatesList');
        container.innerHTML = '';

        if (!this.templates || this.templates.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">No templates yet. Create your first template!</p>';
            return;
        }

        this.templates.forEach(template => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.innerHTML = `
                <div class="template-info">
                    <div class="template-name">${this.escapeHtml(template.templateName)}</div>
                    <div class="template-details">
                        <span class="template-detail">
                            <i class="fas fa-tasks"></i>
                            ${template.subtasks?.length || 0} subtasks
                        </span>
                        <span class="template-detail">
                            <i class="fas fa-tag"></i>
                            ${template.tags?.length || 0} tags
                        </span>
                        <span class="template-detail">
                            <i class="fas fa-flag"></i>
                            ${template.priority}
                        </span>
                    </div>
                </div>
                <div class="template-actions">
                    <button class="template-btn template-btn-use" data-template-id="${template._id}">
                        <i class="fas fa-plus"></i> Use
                    </button>
                    <button class="template-btn template-btn-delete" data-template-id="${template._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            item.querySelector('.template-btn-use').addEventListener('click', () => {
                this.useTemplate(template._id);
            });

            item.querySelector('.template-btn-delete').addEventListener('click', () => {
                this.deleteTemplate(template._id);
            });

            container.appendChild(item);
        });
    }

    async useTemplate(templateId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/from-template/${templateId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.tasks.unshift(data);
                this.renderTasks();
                this.hideTemplatesModal();
                this.showMessage('Task created from template!', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.message || 'Failed to create task from template', 'error');
            }
        } catch (error) {
            console.error('Use template error:', error);
            this.showMessage('Failed to create task from template', 'error');
        }
    }

    async deleteTemplate(templateId) {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                this.templates = this.templates.filter(t => t._id !== templateId);
                this.renderTemplatesList();
                this.showMessage('Template deleted successfully!', 'success');
            } else {
                this.showMessage('Failed to delete template', 'error');
            }
        } catch (error) {
            console.error('Delete template error:', error);
            this.showMessage('Failed to delete template', 'error');
        }
    }

    showBulkActionsModal() {
        document.getElementById('selectedTasksCount').textContent = `${this.selectedTasks.size} tasks selected`;
        document.getElementById('bulkActionsModal').classList.remove('hidden');
    }

    hideBulkActionsModal() {
        document.getElementById('bulkActionsModal').classList.add('hidden');
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.task-bulk-checkbox');
        checkboxes.forEach(checkbox => {
            const taskId = checkbox.dataset.bulkSelect;
            checkbox.checked = checked;
            const taskItem = checkbox.closest('.task-item');
            if (checked) {
                this.selectedTasks.add(taskId);
                taskItem.classList.add('bulk-selected');
            } else {
                this.selectedTasks.delete(taskId);
                taskItem.classList.remove('bulk-selected');
            }
        });
    }

    clearSelection() {
        this.selectedTasks.clear();
        const checkboxes = document.querySelectorAll('.task-bulk-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            const taskItem = checkbox.closest('.task-item');
            taskItem.classList.remove('bulk-selected');
        });
        document.getElementById('bulkSelectToggle').checked = false;
        this.hideBulkActionsModal();
    }

    async bulkComplete() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        if (!confirm(`Mark ${this.selectedTasks.size} tasks as complete?`)) return;

        this.showLoading(true);

        try {
            const promises = Array.from(this.selectedTasks).map(taskId =>
                fetch(`http://localhost:5002/api/tasks/${taskId}/toggle`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
                })
            );

            const responses = await Promise.all(promises);
            const allSuccessful = responses.every(r => r.ok);

            if (allSuccessful) {
                const data = await Promise.all(responses.map(r => r.json()));
                data.forEach(updatedTask => {
                    const index = this.tasks.findIndex(t => t._id === updatedTask._id);
                    if (index !== -1) {
                        this.tasks[index] = updatedTask;
                    }
                });
                this.renderTasks();
                this.clearSelection();
                this.showMessage('Tasks marked as complete!', 'success');
            } else {
                this.showMessage('Failed to complete some tasks', 'error');
            }
        } catch (error) {
            console.error('Bulk complete error:', error);
            this.showMessage('Failed to complete tasks', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async bulkIncomplete() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        if (!confirm(`Mark ${this.selectedTasks.size} tasks as incomplete?`)) return;

        this.showLoading(true);

        try {
            const promises = Array.from(this.selectedTasks).map(taskId =>
                fetch(`http://localhost:5002/api/tasks/${taskId}/toggle`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
                })
            );

            const responses = await Promise.all(promises);
            const allSuccessful = responses.every(r => r.ok);

            if (allSuccessful) {
                const data = await Promise.all(responses.map(r => r.json()));
                data.forEach(updatedTask => {
                    const index = this.tasks.findIndex(t => t._id === updatedTask._id);
                    if (index !== -1) {
                        this.tasks[index] = updatedTask;
                    }
                });
                this.renderTasks();
                this.clearSelection();
                this.showMessage('Tasks marked as incomplete!', 'success');
            } else {
                this.showMessage('Failed to mark some tasks as incomplete', 'error');
            }
        } catch (error) {
            console.error('Bulk incomplete error:', error);
            this.showMessage('Failed to mark tasks as incomplete', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async bulkDelete() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        if (!confirm(`Delete ${this.selectedTasks.size} tasks? This action cannot be undone.`)) return;

        this.showLoading(true);

        try {
            const promises = Array.from(this.selectedTasks).map(taskId =>
                fetch(`http://localhost:5002/api/tasks/${taskId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
                })
            );

            const responses = await Promise.all(promises);
            const allSuccessful = responses.every(r => r.ok);

            if (allSuccessful) {
                this.tasks = this.tasks.filter(t => !this.selectedTasks.has(t._id));
                this.renderTasks();
                this.clearSelection();
                this.showMessage('Tasks deleted successfully!', 'success');
            } else {
                this.showMessage('Failed to delete some tasks', 'error');
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
            this.showMessage('Failed to delete tasks', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async bulkChangePriority() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        const priority = document.getElementById('bulkPrioritySelect').value;
        if (!priority) {
            this.showMessage('Please select a priority', 'error');
            return;
        }

        if (!confirm(`Change priority of ${this.selectedTasks.size} tasks to ${priority}?`)) return;

        this.showLoading(true);

        try {
            const promises = Array.from(this.selectedTasks).map(taskId =>
                fetch(`http://localhost:5002/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.authManager.getToken()}`
                    },
                    body: JSON.stringify({ priority })
                })
            );

            const responses = await Promise.all(promises);
            const allSuccessful = responses.every(r => r.ok);

            if (allSuccessful) {
                const data = await Promise.all(responses.map(r => r.json()));
                data.forEach(updatedTask => {
                    const index = this.tasks.findIndex(t => t._id === updatedTask._id);
                    if (index !== -1) {
                        this.tasks[index] = updatedTask;
                    }
                });
                this.renderTasks();
                this.clearSelection();
                this.showMessage('Priority changed successfully!', 'success');
            } else {
                this.showMessage('Failed to change priority of some tasks', 'error');
            }
        } catch (error) {
            console.error('Bulk change priority error:', error);
            this.showMessage('Failed to change priority', 'error');
        } finally {
            this.showLoading(false);
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

    // Tags Management Methods
    loadUserTags() {
        // Load tags from localStorage
        const storedTags = localStorage.getItem('userTags');
        if (storedTags) {
            this.userTags = JSON.parse(storedTags);
        } else {
            // Initialize with default tags
            this.userTags = [
                { name: 'urgent', color: '#ef4444' },
                { name: 'important', color: '#f59e0b' },
                { name: 'work', color: '#3b82f6' },
                { name: 'personal', color: '#10b981' }
            ];
            this.saveUserTags();
        }
    }

    saveUserTags() {
        localStorage.setItem('userTags', JSON.stringify(this.userTags));
    }

    showTagsModal() {
        this.renderTagsList();
        this.renderTagFilters();
        document.getElementById('tagsModal').classList.remove('hidden');
    }

    hideTagsModal() {
        document.getElementById('tagsModal').classList.add('hidden');
    }

    renderTagsList() {
        const container = document.getElementById('tagsList');
        container.innerHTML = '';

        this.userTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'managed-tag';
            tagElement.style.backgroundColor = tag.color + '20';
            tagElement.style.color = tag.color;
            tagElement.style.borderColor = tag.color;
            tagElement.innerHTML = `
                ${this.escapeHtml(tag.name)}
                <button class="managed-tag-delete" data-tag-name="${tag.name}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            tagElement.querySelector('.managed-tag-delete').addEventListener('click', () => {
                this.deleteTag(tag.name);
            });
            container.appendChild(tagElement);
        });
    }

    renderTagFilters() {
        const container = document.getElementById('tagFilters');
        container.innerHTML = '';

        this.userTags.forEach(tag => {
            const filterElement = document.createElement('span');
            filterElement.className = `managed-tag filter-tag ${this.activeTagFilter === tag.name ? 'active' : ''}`;
            filterElement.style.backgroundColor = tag.color + '20';
            filterElement.style.color = tag.color;
            filterElement.style.borderColor = tag.color;
            filterElement.textContent = tag.name;
            filterElement.addEventListener('click', () => {
                this.filterByTag(tag.name);
            });
            container.appendChild(filterElement);
        });
    }

    addNewTag() {
        const input = document.getElementById('newTagInput');
        const colorInput = document.getElementById('newTagColor');
        const tagName = input.value.trim();
        const tagColor = colorInput.value;

        if (!tagName) {
            this.showMessage('Please enter a tag name', 'error');
            return;
        }

        if (this.userTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
            this.showMessage('Tag already exists', 'error');
            return;
        }

        this.userTags.push({ name: tagName, color: tagColor });
        this.saveUserTags();
        this.renderTagsList();
        this.renderTagFilters();
        input.value = '';
        this.showMessage('Tag added successfully!', 'success');
    }

    deleteTag(tagName) {
        if (!confirm(`Delete tag "${tagName}"?`)) return;

        this.userTags = this.userTags.filter(tag => tag.name !== tagName);
        this.saveUserTags();
        this.renderTagsList();
        this.renderTagFilters();

        // Clear filter if deleted tag was active
        if (this.activeTagFilter === tagName) {
            this.clearTagFilter();
        }

        this.showMessage('Tag deleted successfully!', 'success');
    }

    filterByTag(tagName) {
        if (this.activeTagFilter === tagName) {
            this.clearTagFilter();
        } else {
            this.activeTagFilter = tagName;
            this.renderTagFilters();
            this.renderTasks();
        }
    }

    clearTagFilter() {
        this.activeTagFilter = null;
        this.renderTagFilters();
        this.renderTasks();
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
