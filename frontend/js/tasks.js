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
        this.bulkMode = false; // Track bulk selection mode
        this.advancedSearchActive = false; // Track if advanced search is active
        this.currentMoveCategoryTaskId = null; // Track task for category move
        this.currentNotesTaskId = null; // Track current task for notes editing
        this.currentCalendarDate = new Date(); // Track current calendar date
        this.calendarTasks = {}; // Store tasks grouped by date for calendar
        this.searchTimeout = null; // Debounce timer for search
        this.draggedTask = null; // Track currently dragged task
        this.notifications = []; // Store notifications
        this.notificationRefreshInterval = null; // Auto-refresh interval
        this.contextMenuTaskId = null; // Track task for context menu
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
        this.currentCalendarDate = new Date();
        this.currentView = 'list'; // 'list' or 'kanban'
        this.notificationsShown = false;
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

        // Search tasks with real-time results
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            if (query.length > 0) {
                // Debounce search
                this.searchTimeout = setTimeout(() => {
                    this.performRealTimeSearch(query);
                }, 300);
            } else {
                // Hide results and load all tasks
                document.getElementById('searchResults').classList.add('hidden');
                this.searchQuery = '';
                this.loadTasks();
            }
        });

        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer && !searchContainer.contains(e.target)) {
                document.getElementById('searchResults').classList.add('hidden');
            }
        });

        // Filter tasks
        document.getElementById('taskFilter').addEventListener('change', (e) => {
            this.filter = e.target.value;
            this.renderTasks();
        });

        // Tag filter
        document.getElementById('tagFilter').addEventListener('change', (e) => {
            this.activeTagFilter = e.target.value;
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
            document.getElementById('taskReminderType').style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('editTaskReminderEnabled').addEventListener('change', (e) => {
            document.getElementById('editTaskReminderTime').style.display = e.target.checked ? 'block' : 'none';
            document.getElementById('editTaskReminderType').style.display = e.target.checked ? 'block' : 'none';
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

        // Notes modal
        document.getElementById('closeNotesModal').addEventListener('click', () => {
            this.hideNotesModal();
        });

        document.getElementById('saveNotesBtn').addEventListener('click', () => {
            this.saveNotes();
        });

        document.getElementById('showNotesHistoryBtn').addEventListener('click', () => {
            this.showNotesHistory();
        });

        document.getElementById('hideNotesHistoryBtn').addEventListener('click', () => {
            this.hideNotesHistory();
        });

        // Notes toolbar formatting
        document.querySelectorAll('.notes-toolbar [data-format]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const format = e.currentTarget.dataset.format;
                this.applyFormat(format);
            });
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

        // Calendar management
        document.getElementById('showCalendarBtn').addEventListener('click', () => {
            this.showCalendarModal();
        });

        document.getElementById('closeCalendarModal').addEventListener('click', () => {
            this.hideCalendarModal();
        });

        document.getElementById('prevMonth').addEventListener('click', () => {
            this.changeMonth(-1);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.changeMonth(1);
        });

        // Export/Import management
        document.getElementById('showExportImportBtn').addEventListener('click', () => {
            this.showExportImportModal();
        });

        document.getElementById('closeExportImportModal').addEventListener('click', () => {
            this.hideExportImportModal();
        });

        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            this.exportTasksAsJson();
        });

        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            this.exportTasksAsCsv();
        });

        document.getElementById('importFileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            this.importTasks();
        });

        // View toggle
        document.getElementById('listViewBtn').addEventListener('click', () => {
            this.switchView('list');
        });

        document.getElementById('kanbanViewBtn').addEventListener('click', () => {
            this.switchView('kanban');
        });

        // Activity log
        document.getElementById('closeActivityModal').addEventListener('click', () => {
            this.hideActivityModal();
        });

        // Notifications
        document.getElementById('notificationsBtn').addEventListener('click', () => {
            this.showNotificationsModal();
        });

        document.getElementById('closeNotificationsModal').addEventListener('click', () => {
            this.hideNotificationsModal();
        });

        // Check for reminders every minute
        setInterval(() => this.checkReminders(), 60000);
        this.checkReminders(); // Initial check

        // Share modal
        document.getElementById('closeShareModal').addEventListener('click', () => {
            this.hideShareModal();
        });

        document.getElementById('shareTaskBtn').addEventListener('click', () => {
            this.shareTask();
        });

        // Load shared tasks when filter changes
        document.getElementById('taskFilter').addEventListener('change', (e) => {
            this.filter = e.target.value;
            if (this.filter === 'shared') {
                this.loadSharedTasks();
            } else {
                this.renderTasks();
            }
        });

        // Time report
        document.getElementById('showTimeReportBtn').addEventListener('click', () => {
            this.showTimeReportModal();
        });

        document.getElementById('closeTimeReportModal').addEventListener('click', () => {
            this.hideTimeReportModal();
        });

        // Manual time entry
        document.getElementById('closeManualTimeModal').addEventListener('click', () => {
            this.hideManualTimeModal();
        });

        document.getElementById('addManualTimeBtn').addEventListener('click', () => {
            this.addManualTimeEntry();
        });

        // Priority stats
        document.getElementById('showPriorityStatsBtn').addEventListener('click', () => {
            this.showPriorityStatsModal();
        });

        document.getElementById('closePriorityStatsModal').addEventListener('click', () => {
            this.hidePriorityStatsModal();
        });

        // Dependency graph
        document.getElementById('showDependencyGraphBtn').addEventListener('click', () => {
            this.showDependencyGraphModal();
        });

        document.getElementById('closeDependencyGraphModal').addEventListener('click', () => {
            this.hideDependencyGraphModal();
        });

        // Export/Import
        document.getElementById('showExportImportBtn').addEventListener('click', () => {
            this.showExportImportModal();
        });

        document.getElementById('closeExportImportModal').addEventListener('click', () => {
            this.hideExportImportModal();
        });

        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            this.exportTasks('json');
        });

        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            this.exportTasks('csv');
        });

        document.getElementById('importJsonBtn').addEventListener('click', () => {
            this.importTasks();
        });

        // Templates modal
        document.getElementById('showTemplatesBtn').addEventListener('click', () => {
            this.showTemplatesModal();
        });

        document.getElementById('closeTemplatesModal').addEventListener('click', () => {
            this.hideTemplatesModal();
        });

        // Bulk actions
        document.getElementById('bulkActionsBtn').addEventListener('click', () => {
            this.toggleBulkMode();
        });

        document.getElementById('bulkCancelBtn').addEventListener('click', () => {
            this.toggleBulkMode();
        });

        document.getElementById('bulkCompleteBtn').addEventListener('click', () => {
            this.bulkComplete();
        });

        document.getElementById('bulkArchiveBtn').addEventListener('click', () => {
            this.bulkArchive();
        });

        document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
            this.bulkDelete();
        });

        // Initialize drag and drop
        this.initDragAndDrop();

        // Initialize notifications
        this.initNotifications();

        // Initialize context menu
        this.initContextMenu();
    }

    initContextMenu() {
        const taskList = document.getElementById('taskList');
        
        // Right-click on task items
        taskList.addEventListener('contextmenu', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                e.preventDefault();
                this.contextMenuTaskId = taskItem.dataset.taskId;
                this.showContextMenu(e.clientX, e.clientY);
            }
        });

        // Context menu item clicks
        document.getElementById('contextMenu').addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                this.handleContextMenuAction(action);
                this.hideContextMenu();
            }
        });

        // Hide context menu on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#contextMenu')) {
                this.hideContextMenu();
            }
        });
    }

    showContextMenu(x, y) {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.classList.remove('hidden');
        
        // Position menu
        const menuWidth = 200;
        const menuHeight = 250;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let finalX = x;
        let finalY = y;
        
        if (x + menuWidth > windowWidth) {
            finalX = windowWidth - menuWidth - 10;
        }
        
        if (y + menuHeight > windowHeight) {
            finalY = windowHeight - menuHeight - 10;
        }
        
        contextMenu.style.left = `${finalX}px`;
        contextMenu.style.top = `${finalY}px`;
    }

    hideContextMenu() {
        document.getElementById('contextMenu').classList.add('hidden');
        this.contextMenuTaskId = null;
    }

    async handleContextMenuAction(action) {
        if (!this.contextMenuTaskId) return;

        switch (action) {
            case 'duplicate':
                await this.duplicateTask(this.contextMenuTaskId);
                break;
            case 'archive':
                await this.toggleArchive(this.contextMenuTaskId, true);
                break;
            case 'unarchive':
                await this.toggleArchive(this.contextMenuTaskId, false);
                break;
            case 'move-category':
                this.showMoveCategoryModal(this.contextMenuTaskId);
                break;
            case 'set-priority':
                this.showSetPriorityModal(this.contextMenuTaskId);
                break;
            case 'toggle-favorite':
                await this.toggleFavorite(this.contextMenuTaskId);
                break;
            case 'delete':
                await this.deleteTask(this.contextMenuTaskId);
                break;
        }
    }

    async duplicateTask(taskId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/duplicate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                await this.loadTasks();
                this.showMessage('Task duplicated successfully!', 'success');
            } else {
                this.showMessage('Failed to duplicate task', 'error');
            }
        } catch (error) {
            console.error('Duplicate task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async toggleArchive(taskId, archive) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ isArchived: archive })
            });

            if (response.ok) {
                await this.loadTasks();
                this.showMessage(archive ? 'Task archived!' : 'Task unarchived!', 'success');
            } else {
                this.showMessage('Failed to update task', 'error');
            }
        } catch (error) {
            console.error('Toggle archive error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showMoveCategoryModal(taskId) {
        this.currentMoveCategoryTaskId = taskId;
        const task = this.tasks.find(t => t._id === taskId);
        if (task) {
            document.getElementById('editTaskCategory').value = task.category;
            this.showEditTaskModal(taskId);
        }
    }

    showSetPriorityModal(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (task) {
            document.getElementById('editTaskPriority').value = task.priority;
            this.showEditTaskModal(taskId);
        }
    }

    async toggleFavorite(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ isFavorite: !task.isFavorite })
            });

            if (response.ok) {
                await this.loadTasks();
                this.showMessage(!task.isFavorite ? 'Task favorited!' : 'Task unfavorited!', 'success');
            } else {
                this.showMessage('Failed to update task', 'error');
            }
        } catch (error) {
            console.error('Toggle favorite error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    initNotifications() {
        // Notification button click
        document.getElementById('notificationBtn').addEventListener('click', () => {
            this.toggleNotificationsDropdown();
        });

        // Clear notifications
        document.getElementById('clearNotificationsBtn').addEventListener('click', () => {
            this.clearNotifications();
        });

        // Close notifications when clicking outside
        document.addEventListener('click', (e) => {
            const notificationBtn = document.getElementById('notificationBtn');
            const dropdown = document.getElementById('notificationsDropdown');
            if (!notificationBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Load notifications initially
        this.loadNotifications();

        // Auto-refresh notifications every 5 minutes
        this.notificationRefreshInterval = setInterval(() => {
            this.loadNotifications();
        }, 5 * 60 * 1000);
    }

    async loadNotifications() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/notifications', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                this.notifications = await response.json();
                this.updateNotificationBadge();
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Load notifications error:', error);
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const count = this.notifications.length;
        
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    renderNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        
        if (!this.notifications || this.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = '';
        
        this.notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item priority-${notification.priority}`;
            
            const timeAgo = this.formatTimeAgo(notification.createdAt);
            
            item.innerHTML = `
                <div class="notification-item-header">
                    <span class="notification-title">${notification.title}</span>
                    <span class="notification-time">${timeAgo}</span>
                </div>
                <div class="notification-message">${notification.message}</div>
            `;
            
            item.addEventListener('click', () => {
                this.handleNotificationClick(notification);
            });
            
            notificationsList.appendChild(item);
        });
    }

    toggleNotificationsDropdown() {
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.classList.toggle('hidden');
        
        if (!dropdown.classList.contains('hidden')) {
            this.loadNotifications();
        }
    }

    clearNotifications() {
        this.notifications = [];
        this.updateNotificationBadge();
        this.renderNotifications();
        document.getElementById('notificationsDropdown').classList.add('hidden');
    }

    handleNotificationClick(notification) {
        // Navigate to the task
        if (notification.taskId) {
            const task = this.tasks.find(t => t._id === notification.taskId);
            if (task) {
                this.tasks = [task];
                this.renderTasks();
            }
        }
        
        // Close dropdown
        document.getElementById('notificationsDropdown').classList.add('hidden');
    }

    async loadStatistics() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/statistics', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const stats = await response.json();
                this.renderStatistics(stats);
            }
        } catch (error) {
            console.error('Load statistics error:', error);
        }
    }

    renderStatistics(stats) {
        // Update overview stats
        document.getElementById('totalTasks').textContent = stats.overview.total;
        document.getElementById('completedTasks').textContent = stats.overview.completed;
        document.getElementById('activeTasks').textContent = stats.overview.active;
        document.getElementById('favoriteTasks').textContent = stats.overview.favorites;
        document.getElementById('completionRate').textContent = `${stats.overview.completionRate}%`;
        document.getElementById('overdueTasks').textContent = stats.dueDates.overdue;

        // Render priority chart
        this.renderBarChart('priorityChart', stats.priorities, ['high', 'medium', 'low']);
        
        // Render category chart
        this.renderBarChart('categoryChart', stats.categories, ['work', 'personal', 'shopping', 'health', 'finance', 'other']);
        
        // Render weekly activity chart
        this.renderWeeklyActivityChart(stats.weeklyActivity);
    }

    renderBarChart(containerId, data, labels) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        const maxValue = Math.max(...Object.values(data), 1);
        
        labels.forEach(label => {
            const value = data[label] || 0;
            const heightPercent = (value / maxValue) * 100;
            
            const barChart = document.createElement('div');
            barChart.className = 'bar-chart';
            
            barChart.innerHTML = `
                <div class="bar ${label}" style="height: ${heightPercent}%">
                    <span class="bar-value">${value}</span>
                </div>
                <span class="bar-label">${label.charAt(0).toUpperCase() + label.slice(1)}</span>
            `;
            
            container.appendChild(barChart);
        });
    }

    renderWeeklyActivityChart(data) {
        const container = document.getElementById('weeklyActivityChart');
        container.innerHTML = '';
        
        const maxValue = Math.max(data.completedLast7Days, data.createdLast7Days, 1);
        
        const activities = [
            { label: 'Completed', value: data.completedLast7Days, class: 'completed' },
            { label: 'Created', value: data.createdLast7Days, class: 'created' }
        ];
        
        activities.forEach(activity => {
            const heightPercent = (activity.value / maxValue) * 100;
            
            const barChart = document.createElement('div');
            barChart.className = 'bar-chart';
            
            barChart.innerHTML = `
                <div class="bar ${activity.class}" style="height: ${heightPercent}%">
                    <span class="bar-value">${activity.value}</span>
                </div>
                <span class="bar-label">${activity.label}</span>
            `;
            
            container.appendChild(barChart);
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
        document.getElementById('taskReminderType').style.display = 'none';
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
        const reminderType = document.getElementById('taskReminderType').value;
        const reminder = reminderEnabled ? { enabled: true, time: reminderTime || null, type: reminderType } : { enabled: false, time: null, type: 'in-app' };

        // Collect tags
        const tagsString = document.getElementById('taskTags').value;
        const tags = this.parseTags(tagsString);

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
            document.getElementById('editTaskReminderType').style.display = 'block';
            document.getElementById('editTaskReminderTime').value = task.reminder.time ? task.reminder.time.slice(0, 16) : '';
            document.getElementById('editTaskReminderType').value = task.reminder.type || 'in-app';
        } else {
            document.getElementById('editTaskReminderEnabled').checked = false;
            document.getElementById('editTaskReminderTime').style.display = 'none';
            document.getElementById('editTaskReminderType').style.display = 'none';
        }
        
        // Load tags
        this.currentEditTags = task.tags ? [...task.tags] : [];
        document.getElementById('editTaskTags').value = this.currentEditTags.join(', ');
        
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
        document.getElementById('editTaskReminderType').style.display = 'none';
        this.currentEditTags = [];
        document.getElementById('editTaskTags').value = '';
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
        const reminderType = document.getElementById('editTaskReminderType').value;
        const reminder = reminderEnabled ? { enabled: true, time: reminderTime || null, type: reminderType } : { enabled: false, time: null, type: 'in-app' };

        // Collect tags
        const tagsString = document.getElementById('editTaskTags').value;
        const tags = this.parseTags(tagsString);

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
            // Apply search filter (only if not using advanced search)
            if (this.searchQuery && !this.advancedSearchActive) {
                const titleMatch = task.title.toLowerCase().includes(this.searchQuery.toLowerCase());
                const descriptionMatch = (task.description || '').toLowerCase().includes(this.searchQuery.toLowerCase());
                if (!titleMatch && !descriptionMatch) return false;
            }

            // Apply status filter
            if (this.filter === 'active' && task.completed) return false;
            if (this.filter === 'completed' && !task.completed) return false;
            if (this.filter === 'favorites' && !task.isFavorite) return false;
            if (this.filter === 'archived' && !task.isArchived) return false;
            if (this.filter === 'shared') {
                // Load shared tasks separately
                return false;
            }

            // Apply tag filter
            if (this.activeTagFilter) {
                const hasTag = task.tags && task.tags.some(tag => 
                    tag.toLowerCase() === this.activeTagFilter.toLowerCase()
                );
                if (!hasTag) return false;
            }

            // Apply advanced filters (only if not using advanced search)
            if (!this.advancedSearchActive) {
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
            }

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
            taskElement.draggable = true;
            
            taskElement.innerHTML = `
                <input type="checkbox" class="task-bulk-checkbox" data-bulk-select="${task._id}" ${this.selectedTasks.has(task._id) ? 'checked' : ''}>
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    ${this.getPriorityBadge(task.priority)}
                    <span class="category-badge ${task.category || 'other'}">${this.getCategoryIcon(task.category)} ${task.category || 'other'}</span>
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    ${task.tags && task.tags.length > 0 ? `<div class="task-tags">${this.renderTags(task.tags)}</div>` : ''}
                    ${task.formattedNotes ? `<div class="task-notes"><i class="fas fa-sticky-note"></i> ${task.formattedNotes}</div>` : ''}
                    ${this.renderSubtasksDisplay(task.subtasks)}
                    ${this.renderReminderBadge(task.reminder)}
                    ${this.renderTimeTracking(task.timeTracking, task._id)}
                    ${this.renderAttachmentsDisplay(task.attachments)}
                    ${this.renderDependenciesDisplay(task.dependencies)}
                    ${this.renderRecurringBadge(task.recurring)}
                    ${this.getDueDateBadge(task.dueDate)}
                </div>
                <div class="task-meta">
                    <div class="task-date">Created: ${new Date(task.createdAt).toLocaleDateString()}</div>
                    <div class="task-actions">
                        <button class="btn btn-outline btn-sm" data-action="favorite">
                            <i class="fas fa-star ${task.isFavorite ? 'favorite-active' : ''}"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" data-action="archive">
                            <i class="fas fa-archive ${task.isArchived ? 'archive-active' : ''}"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" data-action="share">
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" data-action="manual-time">
                            <i class="fas fa-clock"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" data-action="activity">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" data-action="notes">
                            <i class="fas fa-sticky-note"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" data-action="duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" data-action="move-category">
                            <i class="fas fa-folder"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" data-action="create-template">
                            <i class="fas fa-layer-group"></i>
                        </button>
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
                this.toggleTaskSelection(taskId);
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
                case 'favorite':
                    this.toggleFavorite(taskId);
                    break;
                case 'archive':
                    this.toggleArchive(taskId);
                    break;
                case 'share':
                    this.showShareModal(taskId);
                    break;
                case 'manual-time':
                    this.showManualTimeModal(taskId);
                    break;
                case 'activity':
                    this.showActivityModal(taskId);
                    break;
                case 'notes':
                    this.showNotesModal(taskId);
                    break;
                case 'duplicate':
                    this.duplicateTask(taskId);
                    break;
                case 'move-category':
                    this.showMoveCategoryModal(taskId);
                    break;
                case 'create-template':
                    this.createTemplateFromTask(taskId);
                    break;
            }
        };

        // Update kanban if in kanban view
        if (this.currentView === 'kanban') {
            this.renderKanban();
        }
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

    async toggleFavorite(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/favorite`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const index = this.tasks.findIndex(t => t._id === taskId);
                if (index !== -1) {
                    this.tasks[index] = data;
                    this.renderTasks();
                    this.showMessage(data.isFavorite ? 'Task added to favorites!' : 'Task removed from favorites!', 'success');
                }
            } else {
                this.showMessage(data.message || 'Failed to toggle favorite', 'error');
            }
        } catch (error) {
            console.error('Toggle favorite error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async toggleArchive(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/archive`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const index = this.tasks.findIndex(t => t._id === taskId);
                if (index !== -1) {
                    this.tasks[index] = data;
                    this.renderTasks();
                    this.showMessage(data.isArchived ? 'Task archived!' : 'Task unarchived!', 'success');
                }
            } else {
                this.showMessage(data.message || 'Failed to toggle archive', 'error');
            }
        } catch (error) {
            console.error('Toggle archive error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async showActivityModal(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        const activityFeedList = document.getElementById('activityFeedList');
        activityFeedList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading activity...</div>';

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/activity`, {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const activityFeed = await response.json();
                this.renderActivityFeed(activityFeed);
            } else {
                activityFeedList.innerHTML = '<div class="activity-feed-empty"><i class="fas fa-exclamation-circle"></i><p>Failed to load activity</p></div>';
            }
        } catch (error) {
            console.error('Load activity feed error:', error);
            activityFeedList.innerHTML = '<div class="activity-feed-empty"><i class="fas fa-exclamation-circle"></i><p>Network error</p></div>';
        }

        document.getElementById('activityModal').classList.remove('hidden');
    }

    renderActivityFeed(activityFeed) {
        const activityFeedList = document.getElementById('activityFeedList');
        activityFeedList.innerHTML = '';

        if (!activityFeed || activityFeed.length === 0) {
            activityFeedList.innerHTML = '<div class="activity-feed-empty"><i class="fas fa-clock"></i><p>No activity recorded yet</p></div>';
            return;
        }

        activityFeed.forEach(activity => {
            const icon = this.getActivityFeedIcon(activity.type);
            const time = this.formatTimeAgo(activity.timestamp);

            const feedItem = document.createElement('div');
            feedItem.className = `activity-feed-item ${activity.type}`;
            feedItem.innerHTML = `
                <div class="activity-feed-icon">${icon}</div>
                <div class="activity-feed-content">
                    <div class="activity-feed-description">${activity.description}</div>
                    <div class="activity-feed-time">${time}</div>
                </div>
            `;
            activityFeedList.appendChild(feedItem);
        });
    }

    getActivityFeedIcon(type) {
        const icons = {
            activity: '<i class="fas fa-history"></i>',
            comment: '<i class="fas fa-comment"></i>',
            reply: '<i class="fas fa-reply"></i>',
            reaction: '<i class="fas fa-heart"></i>'
        };
        return icons[type] || '<i class="fas fa-circle"></i>';
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return time.toLocaleDateString();
    }

    hideActivityModal() {
        document.getElementById('activityModal').classList.add('hidden');
    }

    getActivityIcon(action) {
        const icons = {
            created: '✨',
            updated: '✏️',
            toggled: '✅',
            favorited: '⭐',
            archived: '📦'
        };
        return icons[action] || '📝';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    async checkReminders() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/reminders/due', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const reminders = await response.json();
                this.updateNotificationBadge(reminders.length);
                
                if (reminders.length > 0 && !this.notificationsShown) {
                    this.notificationsShown = true;
                    reminders.forEach(reminder => {
                        this.showMessage(`Reminder: ${reminder.title} is due!`, 'warning');
                    });
                }
            }
        } catch (error) {
            console.error('Check reminders error:', error);
        }
    }

    updateNotificationBadge(count) {
        const badge = document.getElementById('notificationBadge');
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    async showNotificationsModal() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/reminders/due', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const reminders = await response.json();
                this.renderNotifications(reminders);
                document.getElementById('notificationsModal').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Show notifications error:', error);
        }
    }

    hideNotificationsModal() {
        document.getElementById('notificationsModal').classList.add('hidden');
    }

    renderNotifications(reminders) {
        const notificationsList = document.getElementById('notificationsList');
        notificationsList.innerHTML = '';

        if (!reminders || reminders.length === 0) {
            notificationsList.innerHTML = '<div class="empty-state"><p>No pending reminders.</p></div>';
            return;
        }

        reminders.forEach(reminder => {
            const reminderTime = new Date(reminder.reminder.time).toLocaleString();
            const dueDate = reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString() : 'No due date';
            
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            notificationItem.innerHTML = `
                <div class="notification-icon">🔔</div>
                <div class="notification-content">
                    <div class="notification-title">${this.escapeHtml(reminder.title)}</div>
                    <div class="notification-message">Reminder was set for: ${reminderTime}</div>
                    <div class="notification-time">Due: ${dueDate}</div>
                    <div class="notification-actions">
                        <button class="btn btn-sm btn-primary" data-dismiss-reminder="${reminder._id}">
                            Dismiss
                        </button>
                        <button class="btn btn-sm btn-outline" data-view-task="${reminder._id}">
                            View Task
                        </button>
                    </div>
                </div>
            `;
            
            notificationItem.querySelector('[data-dismiss-reminder]').addEventListener('click', () => {
                this.markReminderAsSent(reminder._id);
            });
            
            notificationItem.querySelector('[data-view-task]').addEventListener('click', () => {
                this.hideNotificationsModal();
                this.editTask(reminder._id);
            });
            
            notificationsList.appendChild(notificationItem);
        });
    }

    async markReminderAsSent(taskId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/reminder/sent`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const index = this.tasks.findIndex(t => t._id === taskId);
                if (index !== -1) {
                    this.tasks[index] = await response.json();
                }
                this.showNotificationsModal(); // Refresh notifications
                this.showMessage('Reminder dismissed!', 'success');
            }
        } catch (error) {
            console.error('Mark reminder sent error:', error);
        }
    }

    showShareModal(taskId) {
        this.currentShareTaskId = taskId;
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        document.getElementById('shareEmail').value = '';
        this.renderSharedUsers(task);
        document.getElementById('shareModal').classList.remove('hidden');
    }

    hideShareModal() {
        document.getElementById('shareModal').classList.add('hidden');
        this.currentShareTaskId = null;
    }

    async shareTask() {
        const email = document.getElementById('shareEmail').value.trim();
        if (!email) {
            this.showMessage('Please enter an email address', 'error');
            return;
        }

        if (!this.currentShareTaskId) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentShareTaskId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                const index = this.tasks.findIndex(t => t._id === this.currentShareTaskId);
                if (index !== -1) {
                    this.tasks[index] = data;
                }
                document.getElementById('shareEmail').value = '';
                this.renderSharedUsers(data);
                this.showMessage('Task shared successfully!', 'success');
            } else {
                this.showMessage(data.message || 'Failed to share task', 'error');
            }
        } catch (error) {
            console.error('Share task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    renderSharedUsers(task) {
        const sharedUsersList = document.getElementById('sharedUsersList');
        sharedUsersList.innerHTML = '';

        if (!task.sharedWith || task.sharedWith.length === 0) {
            sharedUsersList.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Task not shared with anyone yet.</p>';
            return;
        }

        task.sharedWith.forEach(user => {
            const userName = user.username || 'Unknown User';
            const userEmail = user.email || 'No email';
            const initial = userName.charAt(0).toUpperCase();

            const userItem = document.createElement('div');
            userItem.className = 'shared-user-item';
            userItem.innerHTML = `
                <div class="shared-user-info">
                    <div class="shared-user-avatar">${initial}</div>
                    <div>
                        <div class="shared-user-name">${this.escapeHtml(userName)}</div>
                        <div class="shared-user-email">${this.escapeHtml(userEmail)}</div>
                    </div>
                </div>
                <button class="remove-share-btn" data-remove-share="${user._id}">Remove</button>
            `;

            userItem.querySelector('[data-remove-share]').addEventListener('click', () => {
                this.removeShare(task._id, user._id);
            });

            sharedUsersList.appendChild(userItem);
        });
    }

    async removeShare(taskId, userId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/share/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            const data = await response.json();

            if (response.ok) {
                const index = this.tasks.findIndex(t => t._id === taskId);
                if (index !== -1) {
                    this.tasks[index] = data;
                }
                this.renderSharedUsers(data);
                this.showMessage('Sharing removed successfully!', 'success');
            } else {
                this.showMessage(data.message || 'Failed to remove sharing', 'error');
            }
        } catch (error) {
            console.error('Remove share error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async loadTasks() {
        this.advancedSearchActive = false;
        try {
            const response = await fetch('http://localhost:5002/api/tasks', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                this.tasks = await response.json();
                this.renderTasks();
                this.loadStatistics(); // Load statistics after tasks
                this.loadUserTags(); // Load user tags
            } else {
                this.showMessage('Failed to load tasks', 'error');
            }
        } catch (error) {
            console.error('Load tasks error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async loadUserTags() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/tags/all', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                this.userTags = await response.json();
                this.populateTagFilter();
            }
        } catch (error) {
            console.error('Load user tags error:', error);
        }
    }

    populateTagFilter() {
        const tagFilter = document.getElementById('tagFilter');
        tagFilter.innerHTML = '<option value="">All Tags</option>';
        
        this.userTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
    }

    parseTags(tagsString) {
        if (!tagsString) return [];
        return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    renderTags(tags) {
        if (!tags || tags.length === 0) return '';
        
        return tags.map(tag => `
            <span class="task-tag">${this.escapeHtml(tag)}</span>
        `).join('');
    }

    async advancedSearch() {
        this.advancedSearchActive = true;
        const searchFilters = {
            query: this.searchQuery,
            priority: this.advancedFilters.priority,
            category: this.advancedFilters.category,
            status: this.advancedFilters.status,
            dueDateFrom: this.advancedFilters.dueDateFrom,
            dueDateTo: this.advancedFilters.dueDateTo,
            tags: this.advancedFilters.tags
        };

        try {
            const response = await fetch('http://localhost:5002/api/tasks/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify(searchFilters)
            });

            if (response.ok) {
                this.tasks = await response.json();
                this.renderTasks();
            } else {
                this.showMessage('Search failed', 'error');
            }
        } catch (error) {
            console.error('Advanced search error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showTimeReportModal() {
        this.loadTimeReport();
        document.getElementById('timeReportModal').classList.remove('hidden');
    }

    hideTimeReportModal() {
        document.getElementById('timeReportModal').classList.add('hidden');
    }

    async loadTimeReport() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/time/report', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const report = await response.json();
                this.renderTimeReport(report);
            }
        } catch (error) {
            console.error('Load time report error:', error);
            this.showMessage('Failed to load time report', 'error');
        }
    }

    renderTimeReport(report) {
        document.getElementById('totalTasksTracked').textContent = report.totalTasks;
        
        const hours = Math.floor(report.totalMinutes / 60);
        const minutes = report.totalMinutes % 60;
        document.getElementById('totalTimeReport').textContent = `${hours}h ${minutes}m`;

        const timeReportTasks = document.getElementById('timeReportTasks');
        timeReportTasks.innerHTML = '';

        if (report.tasks.length === 0) {
            timeReportTasks.innerHTML = '<div class="empty-state"><p>No time tracking data available.</p></div>';
            return;
        }

        report.tasks.forEach(task => {
            const taskHours = Math.floor(task.timeSpent / 60);
            const taskMinutes = task.timeSpent % 60;
            const entriesCount = task.manualEntries ? task.manualEntries.length : 0;

            const taskItem = document.createElement('div');
            taskItem.className = 'time-report-task-item';
            taskItem.innerHTML = `
                <div class="time-report-task-title">${this.escapeHtml(task.title)}</div>
                <div class="time-report-task-time">${taskHours}h ${taskMinutes}m</div>
                <div class="time-report-task-entries">${entriesCount} manual entries</div>
            `;
            timeReportTasks.appendChild(taskItem);
        });
    }

    showManualTimeModal(taskId) {
        this.currentManualTimeTaskId = taskId;
        document.getElementById('manualTimeDuration').value = '';
        document.getElementById('manualTimeNote').value = '';
        document.getElementById('manualTimeModal').classList.remove('hidden');
    }

    hideManualTimeModal() {
        document.getElementById('manualTimeModal').classList.add('hidden');
        this.currentManualTimeTaskId = null;
    }

    async addManualTimeEntry() {
        const duration = document.getElementById('manualTimeDuration').value;
        const note = document.getElementById('manualTimeNote').value;

        if (!duration || duration <= 0) {
            this.showMessage('Please enter a valid duration', 'error');
            return;
        }

        if (!this.currentManualTimeTaskId) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentManualTimeTaskId}/time/manual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ duration, note })
            });

            const data = await response.json();

            if (response.ok) {
                const index = this.tasks.findIndex(t => t._id === this.currentManualTimeTaskId);
                if (index !== -1) {
                    this.tasks[index] = data;
                }
                this.hideManualTimeModal();
                this.renderTasks();
                this.showMessage('Time entry added successfully!', 'success');
            } else {
                this.showMessage(data.message || 'Failed to add time entry', 'error');
            }
        } catch (error) {
            console.error('Add manual time entry error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showPriorityStatsModal() {
        this.loadPriorityStats();
        document.getElementById('priorityStatsModal').classList.remove('hidden');
    }

    hidePriorityStatsModal() {
        document.getElementById('priorityStatsModal').classList.add('hidden');
    }

    async loadPriorityStats() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/priority/stats', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const stats = await response.json();
                this.renderPriorityStats(stats);
            }
        } catch (error) {
            console.error('Load priority stats error:', error);
            this.showMessage('Failed to load priority stats', 'error');
        }
    }

    renderPriorityStats(stats) {
        const grid = document.getElementById('priorityStatsGrid');
        grid.innerHTML = '';

        const priorityConfig = [
            { key: 'urgent', label: 'Urgent', icon: '🔴', class: 'urgent' },
            { key: 'high', label: 'High', icon: '🟠', class: 'high' },
            { key: 'medium', label: 'Medium', icon: '🟡', class: 'medium' },
            { key: 'low', label: 'Low', icon: '🟢', class: 'low' },
            { key: 'none', label: 'None', icon: '⚪', class: 'none' }
        ];

        priorityConfig.forEach(config => {
            const count = stats[config.key] || 0;
            const card = document.createElement('div');
            card.className = `priority-stat-card ${config.class}`;
            card.innerHTML = `
                <div class="priority-stat-icon">${config.icon}</div>
                <div class="priority-stat-value">${count}</div>
                <div class="priority-stat-label">${config.label}</div>
            `;
            grid.appendChild(card);
        });
    }

    getPriorityBadge(priority) {
        const priorityConfig = {
            urgent: { label: 'Urgent', icon: '🔴', class: 'urgent' },
            high: { label: 'High', icon: '🟠', class: 'high' },
            medium: { label: 'Medium', icon: '🟡', class: 'medium' },
            low: { label: 'Low', icon: '🟢', class: 'low' }
        };

        if (!priority || !priorityConfig[priority]) {
            return '<span class="priority-badge none">⚪ None</span>';
        }

        const config = priorityConfig[priority];
        return `<span class="priority-badge ${config.class}">${config.icon} ${config.label}</span>`;
    }

    showDependencyGraphModal() {
        // Show a prompt to select which task to view dependencies for
        const taskSelect = prompt('Enter task ID to view dependencies (or leave empty for all tasks):');
        if (taskSelect !== null) {
            this.loadDependencyGraph(taskSelect);
        }
    }

    hideDependencyGraphModal() {
        document.getElementById('dependencyGraphModal').classList.add('hidden');
    }

    async loadDependencyGraph(taskId = null) {
        try {
            let url = 'http://localhost:5002/api/tasks/dependencies/graph';
            if (taskId) {
                url = `http://localhost:5002/api/tasks/${taskId}/dependency-graph`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const graph = await response.json();
                this.renderDependencyGraph(graph, taskId);
            } else {
                const container = document.getElementById('dependencyGraphContainer');
                container.innerHTML = '<div class="no-dependencies"><p>Failed to load dependency graph.</p></div>';
            }
        } catch (error) {
            console.error('Load dependency graph error:', error);
            this.showMessage('Failed to load dependency graph', 'error');
        }
    }

    renderDependencyGraph(graph, taskId = null) {
        const container = document.getElementById('dependencyGraphContainer');
        container.innerHTML = '';

        if (taskId) {
            // Render single task dependency view
            this.renderSingleTaskDependencies(graph);
        } else {
            // Render all tasks dependency view
            this.renderAllTasksDependencies(graph);
        }
    }

    renderSingleTaskDependencies(data) {
        const container = document.getElementById('dependencyGraphContainer');
        
        if (!data.currentTask) {
            container.innerHTML = '<div class="no-dependencies"><p>Task not found.</p></div>';
            return;
        }

        let html = `
            <div class="dependency-view">
                <div class="current-task-card">
                    <h4>Current Task</h4>
                    <div class="task-card">
                        <span class="priority-badge priority-${data.currentTask.priority}">${data.currentTask.priority}</span>
                        <span class="task-title">${this.escapeHtml(data.currentTask.title)}</span>
                        ${data.currentTask.completed ? '<span class="status-badge completed">Completed</span>' : '<span class="status-badge pending">Pending</span>'}
                    </div>
                </div>
        `;

        if (data.blockingTasks && data.blockingTasks.length > 0) {
            html += `
                <div class="blocking-tasks-section">
                    <h4>Blocking Tasks (${data.blockingTasks.length})</h4>
                    <p class="section-description">These tasks must be completed before the current task can start:</p>
                    <div class="tasks-list">
            `;
            data.blockingTasks.forEach(task => {
                html += `
                    <div class="task-card ${task.completed ? 'completed' : ''}">
                        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                        <span class="task-title">${this.escapeHtml(task.title)}</span>
                        ${task.completed ? '<span class="status-badge completed">✓ Completed</span>' : '<span class="status-badge pending">Pending</span>'}
                    </div>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="blocking-tasks-section">
                    <h4>Blocking Tasks</h4>
                    <p class="section-description">No blocking tasks. This task can be started anytime.</p>
                </div>
            `;
        }

        if (data.blockedTasks && data.blockedTasks.length > 0) {
            html += `
                <div class="blocked-tasks-section">
                    <h4>Blocked Tasks (${data.blockedTasks.length})</h4>
                    <p class="section-description">These tasks are waiting for the current task to complete:</p>
                    <div class="tasks-list">
            `;
            data.blockedTasks.forEach(task => {
                html += `
                    <div class="task-card ${task.completed ? 'completed' : ''}">
                        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                        <span class="task-title">${this.escapeHtml(task.title)}</span>
                        ${task.completed ? '<span class="status-badge completed">✓ Completed</span>' : '<span class="status-badge pending">Pending</span>'}
                    </div>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="blocked-tasks-section">
                    <h4>Blocked Tasks</h4>
                    <p class="section-description">No tasks are blocked by this task.</p>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    renderAllTasksDependencies(graph) {
        const container = document.getElementById('dependencyGraphContainer');
        container.innerHTML = '';

        if (!graph.edges || graph.edges.length === 0) {
            container.innerHTML = '<div class="no-dependencies"><p>No task dependencies found.</p></div>';
            return;
        }

        const dependencyList = document.createElement('div');
        dependencyList.className = 'dependency-list';

        // Group dependencies by task
        const taskDependencies = {};
        graph.edges.forEach(edge => {
            if (!taskDependencies[edge.to]) {
                taskDependencies[edge.to] = [];
            }
            taskDependencies[edge.to].push(edge.from);
        });

        // Render each task with its dependencies
        Object.keys(taskDependencies).forEach(taskId => {
            const task = graph.nodes.find(n => n.id === taskId);
            if (!task) return;

            const blockingTaskIds = taskDependencies[taskId];
            const blockingTasks = blockingTaskIds.map(id => graph.nodes.find(n => n.id === id)).filter(Boolean);

            const dependencyItem = document.createElement('div');
            dependencyItem.className = 'dependency-item blocking';
            
            const blockingTasksHtml = blockingTasks.map(t => {
                const statusClass = t.completed ? 'completed' : '';
                const statusText = t.completed ? 'Completed' : 'In Progress';
                return `
                    <div class="dependency-header">
                        <span class="dependency-title">${this.escapeHtml(t.title)}</span>
                        <span class="dependency-status ${statusClass}">${statusText}</span>
                    </div>
                `;
            }).join('');

            dependencyItem.innerHTML = `
                <div class="dependency-relation">
                    <strong>${this.escapeHtml(task.title)}</strong> is blocked by:
                </div>
                ${blockingTasksHtml}
            `;

            dependencyList.appendChild(dependencyItem);
        });

        container.appendChild(dependencyList);
    }

    toggleBulkMode() {
        this.bulkMode = !this.bulkMode;
        const tasksContainer = document.getElementById('tasksContainer');
        const bulkActionsPanel = document.getElementById('bulkActionsPanel');
        
        if (this.bulkMode) {
            tasksContainer.classList.add('bulk-mode');
            bulkActionsPanel.classList.remove('hidden');
            this.selectedTasks.clear();
        } else {
            tasksContainer.classList.remove('bulk-mode');
            bulkActionsPanel.classList.add('hidden');
            this.selectedTasks.clear();
        }
        
        this.renderTasks();
    }

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        // Re-render to update UI
        this.renderTasks();
    }

    async bulkComplete() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('Please select tasks to complete', 'error');
            return;
        }

        if (!confirm(`Complete ${this.selectedTasks.size} tasks?`)) return;

        try {
            const response = await fetch('http://localhost:5002/api/tasks/bulk', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({
                    taskIds: Array.from(this.selectedTasks),
                    updates: { completed: true }
                })
            });

            if (response.ok) {
                const data = await response.json();
                data.forEach(updatedTask => {
                    const index = this.tasks.findIndex(t => t._id === updatedTask._id);
                    if (index !== -1) {
                        this.tasks[index] = updatedTask;
                    }
                });
                this.toggleBulkMode();
                this.renderTasks();
                this.showMessage(`Completed ${data.length} tasks!`, 'success');
            } else {
                this.showMessage('Failed to complete tasks', 'error');
            }
        } catch (error) {
            console.error('Bulk complete error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async bulkArchive() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('Please select tasks to archive', 'error');
            return;
        }

        if (!confirm(`Archive ${this.selectedTasks.size} tasks?`)) return;

        try {
            const response = await fetch('http://localhost:5002/api/tasks/bulk', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({
                    taskIds: Array.from(this.selectedTasks),
                    updates: { isArchived: true }
                })
            });

            if (response.ok) {
                const data = await response.json();
                data.forEach(updatedTask => {
                    const index = this.tasks.findIndex(t => t._id === updatedTask._id);
                    if (index !== -1) {
                        this.tasks[index] = updatedTask;
                    }
                });
                this.toggleBulkMode();
                this.renderTasks();
                this.showMessage(`Archived ${data.length} tasks!`, 'success');
            } else {
                this.showMessage('Failed to archive tasks', 'error');
            }
        } catch (error) {
            console.error('Bulk archive error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('Please select tasks to delete', 'error');
            return;
        }

        if (!confirm(`Delete ${this.selectedTasks.size} tasks? This action cannot be undone.`)) return;

        try {
            const response = await fetch('http://localhost:5002/api/tasks/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({
                    taskIds: Array.from(this.selectedTasks)
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.tasks = this.tasks.filter(t => !this.selectedTasks.has(t._id));
                this.toggleBulkMode();
                this.renderTasks();
                this.showMessage(`Deleted ${data.deletedCount} tasks!`, 'success');
            } else {
                this.showMessage('Failed to delete tasks', 'error');
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async sendReminder(taskId, type = 'in-app') {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/reminder/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ type })
            });

            if (response.ok) {
                const data = await response.json();
                const index = this.tasks.findIndex(t => t._id === taskId);
                if (index !== -1) {
                    this.tasks[index] = data.task;
                }
                this.renderTasks();
                this.showMessage(data.notificationDetails.message, 'success');
            } else {
                this.showMessage('Failed to send reminder', 'error');
            }
        } catch (error) {
            console.error('Send reminder error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async getReminderHistory(taskId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/reminder/history`, {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const history = await response.json();
                return history;
            }
        } catch (error) {
            console.error('Get reminder history error:', error);
        }
        return null;
    }

    async duplicateTask(taskId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/duplicate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const duplicatedTask = await response.json();
                this.tasks.unshift(duplicatedTask);
                this.renderTasks();
                this.showMessage('Task duplicated successfully!', 'success');
            } else {
                this.showMessage('Failed to duplicate task', 'error');
            }
        } catch (error) {
            console.error('Duplicate task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showMoveCategoryModal(taskId) {
        this.currentMoveCategoryTaskId = taskId;
        const category = prompt('Enter new category (work, personal, shopping, health, finance, other):');
        
        if (category && ['work', 'personal', 'shopping', 'health', 'finance', 'other'].includes(category.toLowerCase())) {
            this.moveTaskCategory(taskId, category.toLowerCase());
        } else if (category) {
            this.showMessage('Invalid category. Please use: work, personal, shopping, health, finance, or other', 'error');
        }
    }

    async moveTaskCategory(taskId, category) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/move-category`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ category })
            });

            if (response.ok) {
                const updatedTask = await response.json();
                const index = this.tasks.findIndex(t => t._id === taskId);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }
                this.renderTasks();
                this.showMessage('Task moved successfully!', 'success');
            } else {
                this.showMessage('Failed to move task', 'error');
            }
        } catch (error) {
            console.error('Move category error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async createTemplateFromTask(taskId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/create-template`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const template = await response.json();
                this.showMessage('Template created successfully!', 'success');
                this.loadTemplates();
            } else {
                this.showMessage('Failed to create template', 'error');
            }
        } catch (error) {
            console.error('Create template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async loadTemplates() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/templates', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                this.templates = await response.json();
            }
        } catch (error) {
            console.error('Load templates error:', error);
        }
    }

    showTemplatesModal() {
        this.loadTemplates();
        this.renderTemplates();
        document.getElementById('templatesModal').classList.remove('hidden');
    }

    hideTemplatesModal() {
        document.getElementById('templatesModal').classList.add('hidden');
    }

    renderTemplates() {
        const templatesList = document.getElementById('templatesList');
        templatesList.innerHTML = '';

        if (this.templates.length === 0) {
            templatesList.innerHTML = '<div class="empty-state"><i class="fas fa-layer-group"></i><p>No templates yet. Create a template from any task!</p></div>';
            return;
        }

        this.templates.forEach(template => {
            const templateElement = document.createElement('div');
            templateElement.className = 'template-item';
            templateElement.innerHTML = `
                <div class="template-info">
                    <h4>${this.escapeHtml(template.title)}</h4>
                    <p class="template-meta">
                        <span class="priority-badge priority-${template.priority}">${template.priority}</span>
                        <span class="category-badge">${template.category}</span>
                        ${template.subtasks && template.subtasks.length > 0 ? `<span class="subtasks-count"><i class="fas fa-check-square"></i> ${template.subtasks.length} subtasks</span>` : ''}
                    </p>
                </div>
                <div class="template-actions">
                    <button class="btn btn-primary btn-sm" data-template-action="use" data-template-id="${template._id}">
                        <i class="fas fa-plus"></i> Use
                    </button>
                    <button class="btn btn-danger btn-sm" data-template-action="delete" data-template-id="${template._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            templatesList.appendChild(templateElement);
        });

        // Add event listeners for template actions
        templatesList.onclick = (e) => {
            const action = e.target.dataset.templateAction || e.target.closest('[data-template-action]')?.dataset.templateAction;
            const templateId = e.target.dataset.templateId || e.target.closest('[data-template-id]')?.dataset.templateId;

            if (action && templateId) {
                if (action === 'use') {
                    this.createTaskFromTemplate(templateId);
                } else if (action === 'delete') {
                    this.deleteTemplate(templateId);
                }
            }
        };
    }

    async createTaskFromTemplate(templateId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/templates/${templateId}/create-task`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const newTask = await response.json();
                this.tasks.unshift(newTask);
                this.renderTasks();
                this.showMessage('Task created from template!', 'success');
                this.hideTemplatesModal();
            } else {
                this.showMessage('Failed to create task from template', 'error');
            }
        } catch (error) {
            console.error('Create task from template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async deleteTemplate(templateId) {
        if (!confirm('Are you sure you want to delete this template?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/templates/${templateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                this.templates = this.templates.filter(t => t._id !== templateId);
                this.renderTemplates();
                this.showMessage('Template deleted successfully!', 'success');
            } else {
                this.showMessage('Failed to delete template', 'error');
            }
        } catch (error) {
            console.error('Delete template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showNotesModal(taskId) {
        this.currentNotesTaskId = taskId;
        const task = this.tasks.find(t => t._id === taskId);
        const editor = document.getElementById('notesEditor');
        editor.innerHTML = task.formattedNotes || task.notes || '';
        document.getElementById('notesHistoryPanel').classList.add('hidden');
        document.getElementById('notesModal').classList.remove('hidden');
    }

    hideNotesModal() {
        document.getElementById('notesModal').classList.add('hidden');
        this.currentNotesTaskId = null;
    }

    applyFormat(format) {
        const editor = document.getElementById('notesEditor');
        editor.focus();

        if (format.startsWith('formatBlock')) {
            const blockType = format.split('-')[1];
            document.execCommand('formatBlock', false, blockType);
        } else {
            document.execCommand(format, false, null);
        }
    }

    async saveNotes() {
        if (!this.currentNotesTaskId) return;

        const editor = document.getElementById('notesEditor');
        const formattedNotes = editor.innerHTML;
        const notes = editor.innerText;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentNotesTaskId}/notes`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ notes, formattedNotes })
            });

            if (response.ok) {
                const updatedTask = await response.json();
                const index = this.tasks.findIndex(t => t._id === this.currentNotesTaskId);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }
                this.renderTasks();
                this.showMessage('Notes saved successfully!', 'success');
                this.hideNotesModal();
            } else {
                this.showMessage('Failed to save notes', 'error');
            }
        } catch (error) {
            console.error('Save notes error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async showNotesHistory() {
        if (!this.currentNotesTaskId) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentNotesTaskId}/notes-history`, {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const history = await response.json();
                this.renderNotesHistory(history);
                document.getElementById('notesHistoryPanel').classList.remove('hidden');
            } else {
                this.showMessage('Failed to load notes history', 'error');
            }
        } catch (error) {
            console.error('Load notes history error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    hideNotesHistory() {
        document.getElementById('notesHistoryPanel').classList.add('hidden');
    }

    renderNotesHistory(history) {
        const historyList = document.getElementById('notesHistoryList');
        historyList.innerHTML = '';

        if (!history || history.length === 0) {
            historyList.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>No history available</p></div>';
            return;
       }

        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'notes-history-item';
            historyItem.innerHTML = `
                <div class="notes-history-item-header">
                    <span class="notes-history-item-version">Version ${history.length - index}</span>
                    <span class="notes-history-item-date">${this.formatTimeAgo(item.updatedAt)}</span>
                </div>
                <div class="notes-history-item-preview">${this.escapeHtml(item.notes.substring(0, 100))}${item.notes.length > 100 ? '...' : ''}</div>
            `;
            historyItem.addEventListener('click', () => {
                this.restoreNotes(index);
            });
            historyList.appendChild(historyItem);
        });
    }

    async restoreNotes(historyIndex) {
        if (!this.currentNotesTaskId) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentNotesTaskId}/notes/restore/${historyIndex}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const updatedTask = await response.json();
                const index = this.tasks.findIndex(t => t._id === this.currentNotesTaskId);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }
                const editor = document.getElementById('notesEditor');
                editor.innerHTML = updatedTask.formattedNotes || updatedTask.notes || '';
                this.renderTasks();
                this.showMessage('Notes restored successfully!', 'success');
            } else {
                this.showMessage('Failed to restore notes', 'error');
            }
        } catch (error) {
            console.error('Restore notes error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return time.toLocaleDateString();
    }

    showExportImportModal() {
        document.getElementById('exportImportModal').classList.remove('hidden');
    }

    hideExportImportModal() {
        document.getElementById('exportImportModal').classList.add('hidden');
        document.getElementById('importFileInput').value = '';
    }

    async exportTasks(format) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/export?format=${format}`, {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tasks-export.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                this.showMessage(`Tasks exported as ${format.toUpperCase()} successfully!`, 'success');
            } else {
                this.showMessage('Failed to export tasks', 'error');
            }
        } catch (error) {
            console.error('Export tasks error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async importTasks() {
        const fileInput = document.getElementById('importFileInput');
        const file = fileInput.files[0];

        if (!file) {
            this.showMessage('Please select a JSON file to import', 'error');
            return;
        }

        try {
            const text = await file.text();
            const tasks = JSON.parse(text);

            if (!Array.isArray(tasks)) {
                this.showMessage('Invalid JSON file format', 'error');
                return;
            }

            const response = await fetch('http://localhost:5002/api/tasks/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ tasks, format: 'json' })
            });

            if (response.ok) {
                const data = await response.json();
                await this.loadTasks();
                this.showMessage(`Imported ${data.imported} tasks successfully!${data.errors > 0 ? ` (${data.errors} errors)` : ''}`, 'success');
                this.hideExportImportModal();
            } else {
                this.showMessage('Failed to import tasks', 'error');
            }
        } catch (error) {
            console.error('Import tasks error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async performRealTimeSearch(query) {
        const searchResults = document.getElementById('searchResults');
        
        // Show loading state
        searchResults.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        searchResults.classList.remove('hidden');

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/search?q=${encodeURIComponent(query)}&limit=10`, {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const tasks = await response.json();
                this.renderSearchResults(tasks, query);
            } else {
                searchResults.innerHTML = '<div class="search-no-results">Failed to search</div>';
            }
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="search-no-results">Network error</div>';
        }
    }

    renderSearchResults(tasks, query) {
        const searchResults = document.getElementById('searchResults');
        
        if (!tasks || tasks.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No tasks found</div>';
            return;
        }

        searchResults.innerHTML = '';
        
        tasks.forEach(task => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            const highlightedTitle = this.highlightText(task.title, query);
            const priorityBadge = this.getPriorityBadge(task.priority);
            
            resultItem.innerHTML = `
                <div class="search-result-title">${highlightedTitle}</div>
                <div class="search-result-meta">
                    ${priorityBadge}
                    <span class="category-badge ${task.category || 'other'}">${this.getCategoryIcon(task.category)} ${task.category || 'other'}</span>
                    ${task.completed ? '<span class="status-badge completed">Completed</span>' : '<span class="status-badge pending">Active</span>'}
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                this.searchQuery = query;
                this.tasks = [task];
                this.renderTasks();
                searchResults.classList.add('hidden');
            });
            
            searchResults.appendChild(resultItem);
        });
    }

    highlightText(text, query) {
        if (!text || !query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-result-highlight">$1</span>');
    }

    initDragAndDrop() {
        const taskList = document.getElementById('taskList');
        
        taskList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                this.draggedTask = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        taskList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
                this.draggedTask = null;
            }
        });

        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const taskItem = e.target.closest('.task-item');
            if (taskItem && taskItem !== this.draggedTask) {
                const rect = taskItem.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                if (e.clientY < midY) {
                    taskItem.style.borderTop = '3px solid #3b82f6';
                    taskItem.style.borderBottom = '';
                } else {
                    taskItem.style.borderBottom = '3px solid #3b82f6';
                    taskItem.style.borderTop = '';
                }
            }
        });

        taskList.addEventListener('dragleave', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                taskItem.style.borderTop = '';
                taskItem.style.borderBottom = '';
            }
        });

        taskList.addEventListener('drop', async (e) => {
            e.preventDefault();
            const taskItem = e.target.closest('.task-item');
            
            if (taskItem && this.draggedTask && taskItem !== this.draggedTask) {
                taskItem.style.borderTop = '';
                taskItem.style.borderBottom = '';
                
                const draggedId = this.draggedTask.dataset.taskId;
                const targetId = taskItem.dataset.taskId;
                
                await this.reorderTasks(draggedId, targetId);
            }
        });
    }

    async reorderTasks(draggedId, targetId) {
        const taskElements = Array.from(document.querySelectorAll('.task-item'));
        const draggedIndex = taskElements.findIndex(el => el.dataset.taskId === draggedId);
        const targetIndex = taskElements.findIndex(el => el.dataset.taskId === targetId);
        
        const taskOrders = taskElements.map((el, index) => ({
            taskId: el.dataset.taskId,
            order: index
        }));
        
        // Swap the orders
        const temp = taskOrders[draggedIndex].order;
        taskOrders[draggedIndex].order = taskOrders[targetIndex].order;
        taskOrders[targetIndex].order = temp;

        try {
            const response = await fetch('http://localhost:5002/api/tasks/reorder', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ taskOrders })
            });

            if (response.ok) {
                await this.loadTasks();
                this.showMessage('Tasks reordered successfully!', 'success');
            } else {
                this.showMessage('Failed to reorder tasks', 'error');
            }
        } catch (error) {
            console.error('Reorder tasks error:', error);
            this.showMessage('Network error. Please try again.', 'error');
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
    async showStatsModal() {
        const statsContent = document.getElementById('comprehensiveStatsContent');
        statsContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading statistics...</div>';

        try {
            const response = await fetch('http://localhost:5002/api/tasks/stats/comprehensive', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const stats = await response.json();
                this.renderComprehensiveStats(stats);
            } else {
                statsContent.innerHTML = '<div class="comprehensive-stats-empty"><i class="fas fa-exclamation-circle"></i><p>Failed to load statistics</p></div>';
            }
        } catch (error) {
            console.error('Load comprehensive stats error:', error);
            statsContent.innerHTML = '<div class="comprehensive-stats-empty"><i class="fas fa-exclamation-circle"></i><p>Network error</p></div>';
        }

        document.getElementById('statsModal').classList.remove('hidden');
    }

    renderComprehensiveStats(stats) {
        const statsContent = document.getElementById('comprehensiveStatsContent');
        statsContent.innerHTML = '';

        if (!stats) {
            statsContent.innerHTML = '<div class="comprehensive-stats-empty"><i class="fas fa-chart-bar"></i><p>No statistics available</p></div>';
            return;
        }

        // Overview Section
        let html = `
            <div class="stats-section">
                <h4 class="stats-section-title">📊 Overview</h4>
                <div class="stats-grid">
                    <div class="stat-card highlight">
                        <div class="stat-card-value">${stats.total}</div>
                        <div class="stat-card-label">Total Tasks</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-card-value">${stats.completed}</div>
                        <div class="stat-card-label">Completed</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-card-value">${stats.active}</div>
                        <div class="stat-card-label">Active</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.completionRate}%</div>
                        <div class="stat-card-label">Completion Rate</div>
                    </div>
                </div>
            </div>
        `;

        // Task Features Section
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">🎯 Task Features</h4>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.favorites}</div>
                        <div class="stat-card-label">Favorites</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.archived}</div>
                        <div class="stat-card-label">Archived</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.withSubtasks}</div>
                        <div class="stat-card-label">With Subtasks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.withAttachments}</div>
                        <div class="stat-card-label">With Attachments</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.withComments}</div>
                        <div class="stat-card-label">With Comments</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.withDependencies}</div>
                        <div class="stat-card-label">With Dependencies</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.withReminders}</div>
                        <div class="stat-card-label">With Reminders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.recurring}</div>
                        <div class="stat-card-label">Recurring</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.shared}</div>
                        <div class="stat-card-label">Shared</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.templates}</div>
                        <div class="stat-card-label">Templates</div>
                    </div>
                </div>
            </div>
        `;

        // Priority Section
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">🎨 By Priority</h4>
                <div class="stats-row">
                    <span class="stats-row-label">Low Priority</span>
                    <span class="stats-row-value">${stats.byPriority.low}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">Medium Priority</span>
                    <span class="stats-row-value">${stats.byPriority.medium}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">High Priority</span>
                    <span class="stats-row-value">${stats.byPriority.high}</span>
                </div>
            </div>
        `;

        // Category Section
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">📂 By Category</h4>
                <div class="stats-row">
                    <span class="stats-row-label">💼 Work</span>
                    <span class="stats-row-value">${stats.byCategory.work}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">👤 Personal</span>
                    <span class="stats-row-value">${stats.byCategory.personal}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">🛒 Shopping</span>
                    <span class="stats-row-value">${stats.byCategory.shopping}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">🏥 Health</span>
                    <span class="stats-row-value">${stats.byCategory.health}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">💰 Finance</span>
                    <span class="stats-row-value">${stats.byCategory.finance}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">📌 Other</span>
                    <span class="stats-row-value">${stats.byCategory.other}</span>
                </div>
            </div>
        `;

        // Due Date Section
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">📅 By Due Date</h4>
                <div class="stats-row">
                    <span class="stats-row-label">⚠️ Overdue</span>
                    <span class="stats-row-value danger">${stats.byDueDate.overdue}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">📆 Due Today</span>
                    <span class="stats-row-value warning">${stats.byDueDate.dueToday}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">📋 Due This Week</span>
                    <span class="stats-row-value">${stats.byDueDate.dueThisWeek}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">📅 No Due Date</span>
                    <span class="stats-row-value">${stats.byDueDate.noDueDate}</span>
                </div>
            </div>
        `;

        // Time Tracking Section
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">⏱️ Time Tracking</h4>
                <div class="stats-row">
                    <span class="stats-row-label">With Time Tracking</span>
                    <span class="stats-row-value">${stats.timeTracking.withTimeTracking}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">Total Time Spent</span>
                    <span class="stats-row-value">${this.formatTime(stats.timeTracking.totalTimeSpent)}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">Average Time Spent</span>
                    <span class="stats-row-value">${this.formatTime(stats.timeTracking.averageTimeSpent)}</span>
                </div>
            </div>
        `;

        // Subtasks Section
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">✅ Subtasks</h4>
                <div class="stats-row">
                    <span class="stats-row-label">Total Subtasks</span>
                    <span class="stats-row-value">${stats.subtasks.totalSubtasks}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">Completed Subtasks</span>
                    <span class="stats-row-value success">${stats.subtasks.completedSubtasks}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">Subtask Completion Rate</span>
                    <span class="stats-row-value">${stats.subtasks.totalSubtasks > 0 ? Math.round((stats.subtasks.completedSubtasks / stats.subtasks.totalSubtasks) * 100) : 0}%</span>
                </div>
            </div>
        `;

        // Comments Section
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">💬 Comments</h4>
                <div class="stats-row">
                    <span class="stats-row-label">Total Comments</span>
                    <span class="stats-row-value">${stats.comments.totalComments}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-row-label">Total Replies</span>
                    <span class="stats-row-value">${stats.comments.totalReplies}</span>
                </div>
            </div>
        `;

        // Attachments Section
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">📎 Attachments</h4>
                <div class="stats-row">
                    <span class="stats-row-label">Total Attachments</span>
                    <span class="stats-row-value">${stats.attachments.totalAttachments}</span>
                </div>
            </div>
        `;

        statsContent.innerHTML = html;
    }

    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
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

    // Calendar Methods
    async showCalendarModal() {
        await this.loadCalendarTasks();
        this.renderCalendar();
        document.getElementById('calendarModal').classList.remove('hidden');
    }

    hideCalendarModal() {
        document.getElementById('calendarModal').classList.add('hidden');
    }

    changeMonth(delta) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + delta);
        this.loadCalendarTasks().then(() => this.renderCalendar());
    }

    async loadCalendarTasks() {
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/calendar?year=${year}&month=${month}`, {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                this.calendarTasks = await response.json();
            } else {
                this.calendarTasks = {};
            }
        } catch (error) {
            console.error('Load calendar tasks error:', error);
            this.calendarTasks = {};
        }
    }

    renderCalendar() {
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        // Update month display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        // Get previous month's last days for padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // Render calendar days
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';
        
        // Previous month days
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const dayElement = this.createCalendarDay(day, true, null, year, month);
            calendarDays.appendChild(dayElement);
        }
        
        // Current month days
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const isToday = today.getDate() === day && 
                           today.getMonth() === month && 
                           today.getFullYear() === year;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = this.calendarTasks[dateKey] || [];
            const dayElement = this.createCalendarDay(day, false, dayTasks, year, month, isToday);
            calendarDays.appendChild(dayElement);
        }
        
        // Next month days
        const totalCells = startingDay + totalDays;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createCalendarDay(day, true, null, year, month);
            calendarDays.appendChild(dayElement);
        }
    }

    createCalendarDay(day, isOtherMonth, tasks, year, month, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        if (tasks && tasks.length > 0) {
            const tasksContainer = document.createElement('div');
            tasksContainer.className = 'calendar-day-tasks';
            
            // Show up to 3 tasks
            tasks.slice(0, 3).forEach(task => {
                const taskDot = document.createElement('div');
                taskDot.className = `calendar-task-dot ${task.priority} ${task.completed ? 'completed' : ''}`;
                taskDot.textContent = task.title;
                taskDot.title = task.title;
                tasksContainer.appendChild(taskDot);
            });
            
            // Show count if more than 3 tasks
            if (tasks.length > 3) {
                const moreDot = document.createElement('div');
                moreDot.className = 'calendar-task-dot';
                moreDot.textContent = `+${tasks.length - 3} more`;
                moreDot.style.background = '#6b7280';
                tasksContainer.appendChild(moreDot);
            }
            
            dayElement.appendChild(tasksContainer);
        }
        
        return dayElement;
    }

    // Export/Import Methods
    showExportImportModal() {
        document.getElementById('exportImportModal').classList.remove('hidden');
    }

    hideExportImportModal() {
        document.getElementById('exportImportModal').classList.add('hidden');
        // Reset file input
        document.getElementById('importFileInput').value = '';
        document.getElementById('selectedFileName').textContent = 'No file selected';
        document.getElementById('importBtn').disabled = true;
    }

    exportTasksAsJson() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            tasks: this.tasks,
            userTags: this.userTags
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Tasks exported as JSON successfully!', 'success');
    }

    exportTasksAsCsv() {
        const headers = ['Title', 'Description', 'Priority', 'Due Date', 'Category', 'Status', 'Tags'];
        const rows = this.tasks.map(task => [
            `"${task.title.replace(/"/g, '""')}"`,
            `"${(task.description || '').replace(/"/g, '""')}"`,
            task.priority,
            task.dueDate || '',
            task.category || '',
            task.completed ? 'Completed' : 'Active',
            `"${(task.tags || []).join(', ')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Tasks exported as CSV successfully!', 'success');
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            document.getElementById('selectedFileName').textContent = file.name;
            document.getElementById('importBtn').disabled = false;
        } else {
            document.getElementById('selectedFileName').textContent = 'No file selected';
            document.getElementById('importBtn').disabled = true;
        }
    }

    async importTasks() {
        const fileInput = document.getElementById('importFileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showMessage('Please select a file to import', 'error');
            return;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();

        try {
            const content = await file.text();

            if (fileExtension === 'json') {
                await this.importFromJson(content);
            } else if (fileExtension === 'csv') {
                await this.importFromCsv(content);
            } else {
                this.showMessage('Unsupported file format. Please use JSON or CSV.', 'error');
                return;
            }

            this.hideExportImportModal();
            this.showMessage('Tasks imported successfully!', 'success');
        } catch (error) {
            console.error('Import error:', error);
            this.showMessage('Failed to import tasks. Please check the file format.', 'error');
        }
    }

    async importFromJson(content) {
        try {
            const data = JSON.parse(content);
            
            if (!data.tasks || !Array.isArray(data.tasks)) {
                throw new Error('Invalid JSON format');
            }

            // Import user tags if available
            if (data.userTags && Array.isArray(data.userTags)) {
                data.userTags.forEach(importedTag => {
                    if (!this.userTags.some(existingTag => 
                        existingTag.name.toLowerCase() === importedTag.name.toLowerCase()
                    )) {
                        this.userTags.push(importedTag);
                    }
                });
                this.saveUserTags();
            }

            // Import tasks
            for (const task of data.tasks) {
                try {
                    const response = await fetch('http://localhost:5002/api/tasks', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${window.authManager.getToken()}`
                        },
                        body: JSON.stringify(task)
                    });

                    if (response.ok) {
                        const newTask = await response.json();
                        this.tasks.unshift(newTask);
                    }
                } catch (error) {
                    console.error('Failed to import task:', task.title, error);
                }
            }

            this.renderTasks();
        } catch (error) {
            throw new Error('Invalid JSON file');
        }
    }

    async importFromCsv(content) {
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = this.parseCsvLine(lines[i]);
            const task = {
                title: values[0] || '',
                description: values[1] || '',
                priority: values[2] || 'medium',
                dueDate: values[3] || null,
                category: values[4] || 'other',
                completed: values[5] === 'Completed',
                tags: values[6] ? values[6].split(',').map(t => t.trim()) : []
            };

            try {
                const response = await fetch('http://localhost:5002/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.authManager.getToken()}`
                    },
                    body: JSON.stringify(task)
                });

                if (response.ok) {
                    const newTask = await response.json();
                    this.tasks.unshift(newTask);
                }
            } catch (error) {
                console.error('Failed to import task:', task.title, error);
            }
        }

        this.renderTasks();
    }

    parseCsvLine(line) {
        const values = [];
        let currentValue = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentValue += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }

        values.push(currentValue.trim());
        return values;
    }

    // View Methods
    switchView(view) {
        this.currentView = view;
        
        const listViewBtn = document.getElementById('listViewBtn');
        const kanbanViewBtn = document.getElementById('kanbanViewBtn');
        const taskList = document.getElementById('taskList');
        const kanbanBoard = document.getElementById('kanbanBoard');
        
        if (view === 'list') {
            listViewBtn.classList.add('active');
            kanbanViewBtn.classList.remove('active');
            taskList.classList.remove('hidden');
            kanbanBoard.classList.add('hidden');
        } else {
            listViewBtn.classList.remove('active');
            kanbanViewBtn.classList.add('active');
            taskList.classList.add('hidden');
            kanbanBoard.classList.remove('hidden');
            this.renderKanban();
        }
    }

    renderKanban() {
        const todoTasks = [];
        const inProgressTasks = [];
        const doneTasks = [];
        
        // Group tasks by status
        this.tasks.forEach(task => {
            if (task.completed) {
                doneTasks.push(task);
            } else if (task.priority === 'high') {
                inProgressTasks.push(task);
            } else {
                todoTasks.push(task);
            }
        });
        
        // Update counts
        document.getElementById('todoCount').textContent = todoTasks.length;
        document.getElementById('inprogressCount').textContent = inProgressTasks.length;
        document.getElementById('doneCount').textContent = doneTasks.length;
        
        // Render columns
        this.renderKanbanColumn('todoTasks', todoTasks);
        this.renderKanbanColumn('inprogressTasks', inProgressTasks);
        this.renderKanbanColumn('doneTasks', doneTasks);
    }

    renderKanbanColumn(columnId, tasks) {
        const column = document.getElementById(columnId);
        column.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'kanban-task';
            taskElement.dataset.taskId = task._id;
            
            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
            
            taskElement.innerHTML = `
                <div class="kanban-task-title">${this.escapeHtml(task.title)}</div>
                <div class="kanban-task-meta">
                    ${this.getPriorityBadge(task.priority)}
                    ${dueDate ? `<span class="kanban-task-due">📅 ${dueDate}</span>` : ''}
                </div>
            `;
            
            taskElement.addEventListener('click', () => {
                this.editTask(task._id);
            });
            
            column.appendChild(taskElement);
        });
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
            
            // Get reactions grouped by emoji
            const reactions = comment.reactions || [];
            const reactionGroups = {};
            reactions.forEach(r => {
                if (!reactionGroups[r.emoji]) {
                    reactionGroups[r.emoji] = [];
                }
                reactionGroups[r.emoji].push(r);
            });

            // Build reaction buttons HTML
            const availableEmojis = ['👍', '❤️', '😂', '🎉'];
            let reactionsHtml = '<div class="comment-reactions">';
            availableEmojis.forEach(emoji => {
                const count = reactionGroups[emoji] ? reactionGroups[emoji].length : 0;
                const hasReacted = reactionGroups[emoji] && reactionGroups[emoji].some(r => r.user === window.authManager.getUserId());
                reactionsHtml += `
                    <button class="reaction-btn ${hasReacted ? 'active' : ''}" data-emoji="${emoji}" data-comment-id="${comment._id}">
                        <span>${emoji}</span>
                        ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
                    </button>
                `;
            });
            reactionsHtml += '</div>';

            // Build replies HTML
            const replies = comment.replies || [];
            let repliesHtml = '';
            if (replies.length > 0) {
                repliesHtml = '<div class="comment-replies">';
                replies.forEach(reply => {
                    repliesHtml += `
                        <div class="reply-item">
                            <div class="reply-author">${this.escapeHtml(reply.author)}</div>
                            <div class="reply-text">${this.escapeHtml(reply.text)}</div>
                            <div class="reply-date">${new Date(reply.createdAt).toLocaleString()}</div>
                        </div>
                    `;
                });
                repliesHtml += '</div>';
            }

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
                ${reactionsHtml}
                ${repliesHtml}
                <div class="reply-form">
                    <textarea class="reply-input" placeholder="Write a reply..." data-reply-to="${comment._id}"></textarea>
                    <button class="reply-submit-btn" data-reply-to="${comment._id}">Reply</button>
                </div>
            `;

            // Delete button handler
            item.querySelector('.comment-delete').addEventListener('click', () => {
                this.deleteComment(this.currentCommentTaskId, comment._id);
            });

            // Reaction button handlers
            item.querySelectorAll('.reaction-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.toggleReaction(this.currentCommentTaskId, comment._id, btn.dataset.emoji);
                });
            });

            // Reply button handler
            item.querySelector('.reply-submit-btn').addEventListener('click', () => {
                const replyInput = item.querySelector('.reply-input');
                const replyText = replyInput.value.trim();
                if (replyText) {
                    this.addReply(this.currentCommentTaskId, comment._id, replyText);
                }
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

    async toggleReaction(taskId, commentId, emoji) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/comments/${commentId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ emoji })
            });

            if (response.ok) {
                const data = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = data;
                    this.renderCommentsList(data.comments);
                }
            }
        } catch (error) {
            console.error('Toggle reaction error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async addReply(taskId, commentId, text) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/comments/${commentId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const data = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = data;
                    this.renderCommentsList(data.comments);
                    this.showMessage('Reply added successfully!', 'success');
                }
            } else {
                this.showMessage('Failed to add reply', 'error');
            }
        } catch (error) {
            console.error('Add reply error:', error);
            this.showMessage('Network error. Please try again.', 'error');
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
