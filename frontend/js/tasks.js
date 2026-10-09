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
        this.currentHistoryTaskId = null; // Track task for history modal
        this.userTags = []; // Store user's custom tags
        this.activeTagFilter = null; // Store active tag filter
        this.isListening = false; // Track voice recognition state
        this.recognition = null; // Speech recognition instance
        this.gamification = {
            totalPoints: 0,
            currentLevel: 1,
            tasksCompleted: 0,
            streakDays: 0,
            badges: [],
            achievements: [],
            recentActivity: []
        };
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
        this.currentNotesTaskId = null;
        this.currentDependenciesTaskId = null;
        this.currentReminderTaskId = null;
        this.templates = [];
        this.currentTimeTrackingTaskId = null;
        this.timeTrackingInterval = null;
        this.currentCommentsTaskId = null;
        this.tagColors = {};
        this.customPriorities = [];
        this.searchQuery = '';
        this.advancedFilters = {};
        this.draggedTask = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initKeyboardShortcuts();
        this.setupDragAndDrop();
        this.setupQuickActions();
        this.initVoiceRecognition();
        this.loadTasks();
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            // Ctrl/Cmd + N: New task
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showAddTaskForm();
            }

            // Ctrl/Cmd + F: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                this.hideAddTaskForm();
                this.hideEditTaskForm();
                this.hideContextMenu();
                this.hideAdvancedSearchModal();
                this.hideKeyboardShortcutsModal();
                this.hideNotesModal();
                this.hideStatisticsModal();
                this.hideDependenciesModal();
                this.hideDependencyGraph();
                this.hideReminderModal();
                this.hideTemplatesModal();
                this.hideTemplatePreview();
                this.hideTimeTrackingModal();
                this.hideCommentsModal();
                this.hideTagsModal();
                this.hideExportImportModal();
                this.hidePrioritiesModal();
                this.hideAdvancedFiltersModal();
                this.hideBulkPriorityModal();
                this.hideBulkCategoryModal();
                this.hideBulkDueDateModal();
                this.hideActivityHistory();
            }

            // Ctrl+Z: Undo
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }

            // Ctrl+Y or Ctrl+Shift+Z: Redo
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                this.redo();
            }

            // Delete: Delete selected task (if one is selected)
            if (e.key === 'Delete' && this.selectedTasks.size === 1) {
                const taskId = Array.from(this.selectedTasks)[0];
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(taskId);
                }
            }

            // Space: Toggle completion of first selected task
            if (e.key === ' ' && this.selectedTasks.size === 1) {
                e.preventDefault();
                const taskId = Array.from(this.selectedTasks)[0];
                const task = this.tasks.find(t => t._id === taskId);
                if (task) {
                    this.toggleTask(taskId);
                }
            }

            // Ctrl/Cmd + A: Select all tasks
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.selectAllTasks();
            }

            // Ctrl/Cmd + D: Deselect all
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.deselectAllTasks();
            }

            // 1-5: Set filter
            if (e.key === '1') {
                document.getElementById('taskFilter').value = 'all';
                this.filter = 'all';
                this.renderTasks();
            }
            if (e.key === '2') {
                document.getElementById('taskFilter').value = 'active';
                this.filter = 'active';
                this.renderTasks();
            }
            if (e.key === '3') {
                document.getElementById('taskFilter').value = 'completed';
                this.filter = 'completed';
                this.renderTasks();
            }
            if (e.key === '4') {
                document.getElementById('taskFilter').value = 'favorites';
                this.filter = 'favorites';
                this.renderTasks();
            }
            if (e.key === '5') {
                document.getElementById('taskFilter').value = 'archived';
                this.filter = 'archived';
                this.renderTasks();
            }
        });
    }

    selectAllTasks() {
        this.tasks.forEach(task => this.selectedTasks.add(task._id));
        this.renderTasks();
        this.updateBulkActionButtons();
    }

    deselectAllTasks() {
        this.selectedTasks.clear();
        this.renderTasks();
        this.updateBulkActionButtons();
    }

    showKeyboardShortcutsModal() {
        document.getElementById('keyboardShortcutsModal').classList.remove('hidden');
    }

    hideKeyboardShortcutsModal() {
        document.getElementById('keyboardShortcutsModal').classList.add('hidden');
    }

    async showStatisticsModal() {
        document.getElementById('statisticsModal').classList.remove('hidden');
        await this.loadStatistics();
    }

    hideStatisticsModal() {
        document.getElementById('statisticsModal').classList.add('hidden');
    }

    async loadStatistics() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/statistics', {
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const stats = await response.json();
                this.renderStatistics(stats);
            } else {
                this.showMessage('Failed to load statistics', 'error');
            }
        } catch (error) {
            console.error('Load statistics error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    renderStatistics(stats) {
        // Overview cards
        document.getElementById('statTotalTasks').textContent = stats.totalTasks;
        document.getElementById('statCompletedTasks').textContent = stats.completedTasks;
        document.getElementById('statActiveTasks').textContent = stats.pendingTasks;
        document.getElementById('statCompletionRate').textContent = stats.completionRate + '%';

        // Task status
        document.getElementById('statPinnedTasks').textContent = stats.pinnedTasks;
        document.getElementById('statFavoriteTasks').textContent = stats.favoriteTasks;
        document.getElementById('statArchivedTasks').textContent = stats.archivedTasks;
        document.getElementById('statTasksDueToday').textContent = stats.tasksDueToday;
        document.getElementById('statOverdueTasks').textContent = stats.overdueTasks;
        document.getElementById('statTasksWithReminders').textContent = stats.tasksWithReminders;

        // Priority distribution
        document.getElementById('statHighPriority').textContent = stats.priorityBreakdown.high;
        document.getElementById('statMediumPriority').textContent = stats.priorityBreakdown.medium;
        document.getElementById('statLowPriority').textContent = stats.priorityBreakdown.low;

        // Category distribution
        const categoryContainer = document.getElementById('categoryDistribution');
        categoryContainer.innerHTML = '';
        Object.entries(stats.categoryBreakdown).forEach(([category, count]) => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <span>${this.getCategoryIcon(category)} ${category}</span>
                <span>${count}</span>
            `;
            categoryContainer.appendChild(item);
        });

        // Task features
        document.getElementById('statTasksWithSubtasks').textContent = stats.tasksWithSubtasks;
        document.getElementById('statTasksWithAttachments').textContent = stats.tasksWithAttachments;
        document.getElementById('statTasksWithDependencies').textContent = stats.tasksWithDependencies;

        // Productivity metrics
        document.getElementById('statAvgCompletionTime').textContent = stats.avgCompletionTime + ' days';
        document.getElementById('statWeeklyCompleted').textContent = stats.weeklyCompleted;

        // Completion rate bar
        document.getElementById('statCompletionRateBar').style.width = stats.completionRate + '%';
        document.getElementById('statCompletionRateLabel').textContent = stats.completionRate + '%';
    }

    getCategoryIcon(category) {
        const categoryIcons = {
            'Work': '🏢',
            'Personal': '👥',
            'Shopping': '🛍️',
            'Travel': '🗺️',
            'Food': '🍔',
            'Sports': '🏈',
            'Music': '🎵',
            'Movies': '🍿',
            'Books': '📚',
            'Games': '🎮',
            'Other': '🤔'
        };

        return categoryIcons[category] || '📝';
    }

    showTemplatesModal() {
        document.getElementById('templatesModal').classList.remove('hidden');
        this.loadTemplates();
    }

    hideTemplatesModal() {
        document.getElementById('templatesModal').classList.add('hidden');
    }

    async loadTemplates() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/templates', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                this.templates = await response.json();
                this.renderTemplates();
            } else {
                this.showMessage('Failed to load templates', 'error');
            }
        } catch (error) {
            console.error('Load templates error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    renderTemplates() {
        const templatesList = document.getElementById('templatesList');
        templatesList.innerHTML = '';

        if (this.templates.length === 0) {
            templatesList.innerHTML = '<p class="no-templates">No templates yet. Create one above!</p>';
            return;
        }

        this.templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.innerHTML = `
                <div class="template-info">
                    <div class="template-name">${template.name}</div>
                    <div class="template-description">${template.description || 'No description'}</div>
                    <div class="template-details">
                        <span class="template-detail"><i class="fas fa-flag"></i> ${template.template.priority}</span>
                        <span class="template-detail"><i class="fas fa-folder"></i> ${template.template.category}</span>
                        <span class="template-detail"><i class="fas fa-tasks"></i> ${template.template.subtasks?.length || 0} subtasks</span>
                    </div>
                </div>
                <div class="template-actions">
                    <button class="btn btn-sm btn-success" onclick="taskManager.createTaskFromTemplate('${template._id}')" title="Create Task">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="taskManager.editTemplate('${template._id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="taskManager.deleteTemplate('${template._id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            templatesList.appendChild(templateItem);
        });
    }

    async createTemplate() {
        const name = document.getElementById('templateName').value.trim();
        const description = document.getElementById('templateDescription').value.trim();
        const title = document.getElementById('templateTitle').value.trim();
        const taskDescription = document.getElementById('templateTaskDescription').value.trim();
        const priority = document.getElementById('templatePriority').value;
        const category = document.getElementById('templateCategory').value;
        const tags = document.getElementById('templateTags').value.split(',').map(t => t.trim()).filter(t => t);
        const colorLabel = document.getElementById('templateColorLabel').value;
        const subtasksText = document.getElementById('templateSubtasks').value.trim();
        const subtasks = subtasksText.split('\n').map(st => ({ title: st.trim(), completed: false })).filter(st => st.title);

        if (!name || !title) {
            this.showMessage('Template name and task title are required', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:5002/api/tasks/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    template: {
                        title,
                        description: taskDescription,
                        priority,
                        category,
                        tags,
                        colorLabel,
                        subtasks
                    }
                })
            });

            if (response.ok) {
                this.showMessage('Template created successfully!', 'success');
                this.loadTemplates();
                this.clearTemplateForm();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to create template', 'error');
            }
        } catch (error) {
            console.error('Create template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    clearTemplateForm() {
        document.getElementById('templateName').value = '';
        document.getElementById('templateDescription').value = '';
        document.getElementById('templateTitle').value = '';
        document.getElementById('templateTaskDescription').value = '';
        document.getElementById('templatePriority').value = 'medium';
        document.getElementById('templateCategory').value = 'Other';
        document.getElementById('templateTags').value = '';
        document.getElementById('templateColorLabel').value = 'default';
        document.getElementById('templateSubtasks').value = '';
    }

    async deleteTemplate(templateId) {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/templates/${templateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                this.showMessage('Template deleted successfully!', 'success');
                this.loadTemplates();
            } else {
                this.showMessage('Failed to delete template', 'error');
            }
        } catch (error) {
            console.error('Delete template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async createTaskFromTemplate(templateId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/templates/${templateId}/create`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const task = await response.json();
                this.tasks.push(task);
                this.renderTasks();
                this.showMessage('Task created from template!', 'success');
                this.hideTemplatesModal();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to create task from template', 'error');
            }
        } catch (error) {
            console.error('Create task from template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showCalendarView() {
        const taskList = document.getElementById('taskList');
        const kanbanBoard = document.getElementById('kanbanBoard');
        const calendarView = document.getElementById('calendarView');
        const toggleBtn = document.getElementById('toggleViewBtn');
        
        taskList.classList.add('hidden');
        kanbanBoard.classList.add('hidden');
        calendarView.classList.remove('hidden');
        this.currentView = 'calendar';
        toggleBtn.innerHTML = '<i class="fas fa-list"></i>';
        this.renderCalendar();
    }

    hideCalendarView() {
        document.getElementById('calendarView').classList.add('hidden');
        document.getElementById('taskList').classList.remove('hidden');
    }

    renderCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        const monthYear = document.getElementById('calendarMonthYear');
        
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        monthYear.textContent = `${monthNames[month]} ${year}`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        calendarDays.innerHTML = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarDays.appendChild(emptyCell);
        }
        
        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            // Check if this is today
            if (date.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }
            
            // Get tasks for this date
            const tasksForDate = this.getTasksForDate(date);
            
            dayCell.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-tasks">
                    ${tasksForDate.slice(0, 3).map(task => `
                        <div class="calendar-task ${task.completed ? 'completed' : ''} ${task.priority === 'high' ? 'high-priority' : ''}" 
                             onclick="taskManager.editTask('${task._id}')" 
                             title="${task.title}">
                            ${task.title.substring(0, 15)}${task.title.length > 15 ? '...' : ''}
                        </div>
                    `).join('')}
                    ${tasksForDate.length > 3 ? `<div class="calendar-more">+${tasksForDate.length - 3} more</div>` : ''}
                </div>
            `;
            
            calendarDays.appendChild(dayCell);
        }
    }

    getTasksForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
            return taskDate === dateStr;
        });
    }

    navigateMonth(direction) {
        if (direction === 'prev') {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
        } else {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
        }
        this.renderCalendar();
    }

    goToToday() {
        this.currentCalendarDate = new Date();
        this.renderCalendar();
    }

    showNotesModal(taskId) {
        this.currentNotesTaskId = taskId;
        const task = this.tasks.find(t => t._id === taskId);
        const editor = document.getElementById('notesEditor');
        
        if (task && task.formattedNotes) {
            editor.innerHTML = task.formattedNotes;
        } else if (task && task.notes) {
            editor.innerHTML = task.notes;
        } else {
            editor.innerHTML = '';
        }
        
        document.getElementById('notesModal').classList.remove('hidden');
    }

    hideNotesModal() {
        document.getElementById('notesModal').classList.add('hidden');
        this.currentNotesTaskId = null;
    }

    showDependenciesModal(taskId) {
        this.currentDependenciesTaskId = taskId;
        const task = this.tasks.find(t => t._id === taskId);
        
        // Populate dependency select with available tasks
        const select = document.getElementById('dependencySelect');
        select.innerHTML = '<option value="">Select a task...</option>';
        
        this.tasks
            .filter(t => t._id !== taskId && !(task.dependencies || []).includes(t._id))
            .forEach(t => {
                const option = document.createElement('option');
                option.value = t._id;
                option.textContent = t.title;
                select.appendChild(option);
            });
        
        this.renderDependenciesList(task);
        document.getElementById('dependenciesModal').classList.remove('hidden');
    }

    hideDependenciesModal() {
        document.getElementById('dependenciesModal').classList.add('hidden');
        this.currentDependenciesTaskId = null;
    }

    showDependencyGraph() {
        document.getElementById('dependencyGraphModal').classList.remove('hidden');
        this.renderDependencyGraph();
    }

    hideDependencyGraph() {
        document.getElementById('dependencyGraphModal').classList.add('hidden');
    }

    async renderDependencyGraph() {
        const canvas = document.getElementById('dependencyGraphCanvas');
        const ctx = canvas.getContext('2d');
        const wrapper = document.querySelector('.dependency-graph-wrapper');
        
        // Set canvas size
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
        
        // Build graph data
        const nodes = [];
        const edges = [];
        
        this.tasks.forEach(task => {
            nodes.push({
                id: task._id,
                title: task.title,
                completed: task.completed,
                priority: task.priority,
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height - 100) + 50,
                vx: 0,
                vy: 0
            });
            
            if (task.dependencies && task.dependencies.length > 0) {
                task.dependencies.forEach(dep => {
                    if (dep._id) {
                        edges.push({
                            from: dep._id,
                            to: task._id
                        });
                    }
                });
            }
        });
        
        // Force-directed layout
        this.applyForceLayout(nodes, edges, canvas.width, canvas.height);
        
        // Draw graph
        this.drawGraph(ctx, nodes, edges);
        
        // Store for interactions
        this.graphNodes = nodes;
        this.graphEdges = edges;
        this.graphCanvas = canvas;
        this.graphCtx = ctx;
        
        // Setup interactions
        this.setupGraphInteractions();
    }

    applyForceLayout(nodes, edges, width, height) {
        const iterations = 100;
        const k = Math.sqrt((width * height) / nodes.length);
        
        for (let i = 0; i < iterations; i++) {
            // Repulsion
            for (let j = 0; j < nodes.length; j++) {
                for (let l = j + 1; l < nodes.length; l++) {
                    const dx = nodes[l].x - nodes[j].x;
                    const dy = nodes[l].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = (k * k) / dist;
                    
                    nodes[j].vx -= (dx / dist) * force * 0.1;
                    nodes[j].vy -= (dy / dist) * force * 0.1;
                    nodes[l].vx += (dx / dist) * force * 0.1;
                    nodes[l].vy += (dy / dist) * force * 0.1;
                }
            }
            
            // Attraction (edges)
            edges.forEach(edge => {
                const source = nodes.find(n => n.id === edge.from);
                const target = nodes.find(n => n.id === edge.to);
                if (source && target) {
                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = (dist * dist) / k;
                    
                    source.vx += (dx / dist) * force * 0.1;
                    source.vy += (dy / dist) * force * 0.1;
                    target.vx -= (dx / dist) * force * 0.1;
                    target.vy -= (dy / dist) * force * 0.1;
                }
            });
            
            // Center gravity
            nodes.forEach(node => {
                node.vx -= (node.x - width / 2) * 0.01;
                node.vy -= (node.y - height / 2) * 0.01;
                
                // Apply velocity
                node.x += node.vx;
                node.y += node.vy;
                
                // Damping
                node.vx *= 0.9;
                node.vy *= 0.9;
                
                // Bounds
                node.x = Math.max(50, Math.min(width - 50, node.x));
                node.y = Math.max(50, Math.min(height - 50, node.y));
            });
        }
    }

    drawGraph(ctx, nodes, edges) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw edges
        edges.forEach(edge => {
            const source = nodes.find(n => n.id === edge.from);
            const target = nodes.find(n => n.id === edge.to);
            if (source && target) {
                ctx.beginPath();
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(target.x, target.y);
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Arrow
                const angle = Math.atan2(target.y - source.y, target.x - source.x);
                const arrowSize = 8;
                ctx.beginPath();
                ctx.moveTo(target.x, target.y);
                ctx.lineTo(
                    target.x - arrowSize * Math.cos(angle - Math.PI / 6),
                    target.y - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(
                    target.x - arrowSize * Math.cos(angle + Math.PI / 6),
                    target.y - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                ctx.closePath();
                ctx.fillStyle = '#cbd5e1';
                ctx.fill();
            }
        });
        
        // Draw nodes
        nodes.forEach(node => {
            // Determine color based on status
            let color = '#3b82f6'; // Default blue
            if (node.completed) {
                color = '#10b981'; // Green for completed
            } else {
                // Check if blocked
                const isBlocked = edges.some(e => e.to === node.id && !nodes.find(n => n.id === e.from)?.completed);
                if (isBlocked) {
                    color = '#ef4444'; // Red for blocked
                }
            }
            
            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw task title
            ctx.fillStyle = '#1f2937';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const title = node.title.length > 15 ? node.title.substring(0, 15) + '...' : node.title;
            ctx.fillText(title, node.x, node.y + 40);
        });
    }

    setupGraphInteractions() {
        const canvas = this.graphCanvas;
        if (!canvas) return;
        
        let isDragging = false;
        let draggedNode = null;
        
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Find clicked node
            draggedNode = this.graphNodes.find(node => {
                const dx = node.x - x;
                const dy = node.y - y;
                return Math.sqrt(dx * dx + dy * dy) < 25;
            });
            
            if (draggedNode) {
                isDragging = true;
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (isDragging && draggedNode) {
                const rect = canvas.getBoundingClientRect();
                draggedNode.x = e.clientX - rect.left;
                draggedNode.y = e.clientY - rect.top;
                this.drawGraph(this.graphCtx, this.graphNodes, this.graphEdges);
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            draggedNode = null;
        });
        
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            draggedNode = null;
        });
    }

    resetGraphView() {
        this.renderDependencyGraph();
    }

    fitGraphToScreen() {
        if (!this.graphNodes || !this.graphCanvas) return;
        
        const canvas = this.graphCanvas;
        const nodes = this.graphNodes;
        
        // Calculate bounds
        const minX = Math.min(...nodes.map(n => n.x));
        const maxX = Math.max(...nodes.map(n => n.x));
        const minY = Math.min(...nodes.map(n => n.y));
        const maxY = Math.max(...nodes.map(n => n.y));
        
        const padding = 50;
        const scaleX = (canvas.width - padding * 2) / (maxX - minX || 1);
        const scaleY = (canvas.height - padding * 2) / (maxY - minY || 1);
        const scale = Math.min(scaleX, scaleY);
        
        // Scale and center
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        nodes.forEach(node => {
            node.x = (node.x - centerX) * scale + canvas.width / 2;
            node.y = (node.y - centerY) * scale + canvas.height / 2;
        });
        
        this.drawGraph(this.graphCtx, nodes, this.graphEdges);
    }

    hideDependencyGraph() {
        document.getElementById('dependencyGraphModal').classList.add('hidden');
    }

    showActivityHistory(taskId) {
        this.currentActivityHistoryTaskId = taskId;
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        this.renderActivityHistory(task);
        document.getElementById('activityHistoryModal').classList.remove('hidden');
    }

    hideActivityHistory() {
        document.getElementById('activityHistoryModal').classList.add('hidden');
        this.currentActivityHistoryTaskId = null;
    }

    renderActivityHistory(task) {
        const container = document.getElementById('activityHistoryContent');
        const history = task.history || [];

        if (history.length === 0) {
            container.innerHTML = '<p class="no-activity">No activity history available</p>';
            return;
        }

        // Sort by timestamp descending
        const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        container.innerHTML = sortedHistory.map(entry => {
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString();

            return `
                <div class="activity-entry">
                    <div class="activity-icon">
                        <i class="fas ${this.getActivityIcon(entry.action)}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-action">${entry.action}</div>
                        <div class="activity-description">${entry.description}</div>
                        <div class="activity-timestamp">${formattedDate} at ${formattedTime}</div>
                        ${entry.changes && entry.changes.size > 0 ? `
                            <div class="activity-changes">
                                ${Array.from(entry.changes.entries()).map(([key, value]) => `
                                    <div class="activity-change">
                                        <span class="change-key">${key}:</span>
                                        <span class="change-value">${value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    getActivityIcon(action) {
        const iconMap = {
            'created': 'fa-plus-circle',
            'updated': 'fa-edit',
            'completed': 'fa-check-circle',
            'uncompleted': 'fa-times-circle',
            'deleted': 'fa-trash',
            'archived': 'fa-archive',
            'unarchived': 'fa-box-open',
            'pinned': 'fa-thumbtack',
            'unpinned': 'fa-thumbtack',
            'favorited': 'fa-star',
            'unfavorited': 'fa-star',
            'priority_changed': 'fa-flag',
            'category_changed': 'fa-folder',
            'due_date_changed': 'fa-calendar',
            'subtask_added': 'fa-plus',
            'subtask_completed': 'fa-check',
            'subtask_removed': 'fa-minus',
            'attachment_added': 'fa-paperclip',
            'attachment_removed': 'fa-times',
            'comment_added': 'fa-comment',
            'dependency_added': 'fa-link',
            'dependency_removed': 'fa-unlink',
            'reminder_set': 'fa-bell',
            'reminder_cleared': 'fa-bell-slash',
            'tag_added': 'fa-tag',
            'tag_removed': 'fa-tag',
            'time_tracking_started': 'fa-play',
            'time_tracking_stopped': 'fa-stop',
            'time_tracking_reset': 'fa-redo'
        };
        return iconMap[action] || 'fa-circle';
    }

    renderDependencyGraph() {
        const canvas = document.getElementById('dependencyGraphCanvas');
        canvas.innerHTML = '';

        // Build dependency graph
        const nodes = [];
        const edges = [];
        const taskMap = new Map();

        // Create nodes for all tasks
        this.tasks.forEach(task => {
            taskMap.set(task._id, {
                id: task._id,
                title: task.title,
                completed: task.completed,
                dependencies: task.dependencies || [],
                dependents: []
            });
        });

        // Build edges and track dependents
        taskMap.forEach(node => {
            node.dependencies.forEach(depId => {
                const depNode = taskMap.get(depId);
                if (depNode) {
                    depNode.dependents.push(node.id);
                    edges.push({ from: depId, to: node.id });
                }
            });
        });

        // Simple hierarchical layout
        const levels = new Map();
        const visited = new Set();
        
        // Calculate levels using BFS
        const calculateLevels = (nodeId, level) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            
            const currentLevel = Math.max(levels.get(nodeId) || 0, level);
            levels.set(nodeId, currentLevel);
            
            const node = taskMap.get(nodeId);
            node.dependents.forEach(depId => {
                calculateLevels(depId, currentLevel + 1);
            });
        };

        // Start from tasks with no dependencies
        taskMap.forEach(node => {
            if (node.dependencies.length === 0) {
                calculateLevels(node.id, 0);
            }
        });

        // Handle remaining tasks (cycles)
        taskMap.forEach(node => {
            if (!visited.has(node.id)) {
                calculateLevels(node.id, 0);
            }
        });

        // Group by levels
        const levelGroups = new Map();
        levels.forEach((level, nodeId) => {
            if (!levelGroups.has(level)) {
                levelGroups.set(level, []);
            }
            levelGroups.get(level).push(taskMap.get(nodeId));
        });

        // Render graph
        const maxLevel = Math.max(...levels.values());
        const canvasWidth = canvas.offsetWidth || 800;
        const canvasHeight = Math.max(400, (maxLevel + 1) * 150);

        canvas.style.height = `${canvasHeight}px`;

        levelGroups.forEach((nodesAtLevel, level) => {
            const y = level * 150 + 50;
            const nodeWidth = Math.min(200, (canvasWidth - 40) / nodesAtLevel.length - 10);
            const startX = (canvasWidth - (nodesAtLevel.length * (nodeWidth + 10))) / 2;

            nodesAtLevel.forEach((node, index) => {
                const x = startX + index * (nodeWidth + 10);
                
                const nodeEl = document.createElement('div');
                nodeEl.className = `dependency-node ${node.completed ? 'completed' : ''}`;
                nodeEl.style.left = `${x}px`;
                nodeEl.style.top = `${y}px`;
                nodeEl.style.width = `${nodeWidth}px`;
                nodeEl.innerHTML = `
                    <div class="node-title">${node.title.substring(0, 25)}${node.title.length > 25 ? '...' : ''}</div>
                `;
                nodeEl.dataset.nodeId = node.id;
                canvas.appendChild(nodeEl);
            });
        });

        // Draw edges using SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        canvas.appendChild(svg);

        edges.forEach(edge => {
            const fromNode = Array.from(canvas.querySelectorAll('.dependency-node')).find(n => n.dataset.nodeId === edge.from);
            const toNode = Array.from(canvas.querySelectorAll('.dependency-node')).find(n => n.dataset.nodeId === edge.to);

            if (fromNode && toNode) {
                const fromRect = fromNode.getBoundingClientRect();
                const toRect = toNode.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();

                const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
                const y1 = fromRect.bottom - canvasRect.top;
                const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
                const y2 = toRect.top - canvasRect.top;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('stroke', '#667eea');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('marker-end', 'url(#arrowhead)');
                svg.appendChild(line);
            }
        });

        // Add arrowhead marker
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#667eea');
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);
    }

    showReminderModal(taskId) {
        this.currentReminderTaskId = taskId;
        const task = this.tasks.find(t => t._id === taskId);
        
        // Initialize multiple reminders array
        this.multipleReminders = [];
        
        // Pre-fill with existing reminder if any
        if (task && task.reminder && task.reminder.time) {
            const reminderTime = new Date(task.reminder.time);
            const offset = reminderTime.getTimezoneOffset() * 60000;
            const localISOTime = new Date(reminderTime.getTime() - offset).toISOString().slice(0, 16);
            document.getElementById('reminderTime').value = localISOTime;
            document.getElementById('reminderType').value = task.reminder.type || 'in-app';
            document.getElementById('reminderRepeat').value = task.reminder.repeat || 'none';
            document.getElementById('reminderMessage').value = task.reminder.message || '';
            document.getElementById('removeReminderBtn').classList.remove('hidden');
            
            // Add to multiple reminders
            this.multipleReminders.push({
                time: localISOTime,
                type: task.reminder.type || 'in-app',
                repeat: task.reminder.repeat || 'none',
                message: task.reminder.message || ''
            });
        } else {
            document.getElementById('reminderTime').value = '';
            document.getElementById('reminderType').value = 'in-app';
            document.getElementById('reminderRepeat').value = 'none';
            document.getElementById('reminderMessage').value = '';
            document.getElementById('removeReminderBtn').classList.add('hidden');
        }
        
        // Render multiple reminders list
        this.renderMultipleReminders();
        
        document.getElementById('reminderModal').classList.remove('hidden');
    }

    hideReminderModal() {
        document.getElementById('reminderModal').classList.add('hidden');
        this.currentReminderTaskId = null;
        this.multipleReminders = [];
    }

    addMultipleReminder() {
        const time = document.getElementById('reminderTime').value;
        const type = document.getElementById('reminderType').value;
        const repeat = document.getElementById('reminderRepeat').value;
        const message = document.getElementById('reminderMessage').value;
        
        if (!time) {
            this.showMessage('Please select a reminder time', 'error');
            return;
        }
        
        this.multipleReminders.push({ time, type, repeat, message });
        this.renderMultipleReminders();
        
        // Clear form for next reminder
        document.getElementById('reminderTime').value = '';
        document.getElementById('reminderMessage').value = '';
    }

    removeMultipleReminder(index) {
        this.multipleReminders.splice(index, 1);
        this.renderMultipleReminders();
    }

    renderMultipleReminders() {
        const container = document.getElementById('multipleRemindersList');
        container.innerHTML = '';
        
        this.multipleReminders.forEach((reminder, index) => {
            const reminderEl = document.createElement('div');
            reminderEl.className = 'multiple-reminder-item';
            reminderEl.innerHTML = `
                <div class="reminder-info">
                    <i class="fas fa-clock"></i>
                    <span>${new Date(reminder.time).toLocaleString()}</span>
                    <span class="reminder-type-badge">${reminder.type}</span>
                    ${reminder.repeat !== 'none' ? `<span class="reminder-repeat-badge">${reminder.repeat}</span>` : ''}
                </div>
                <button class="btn btn-icon btn-sm remove-reminder-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(reminderEl);
        });
        
        // Add event listeners for remove buttons
        container.querySelectorAll('.remove-reminder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-reminder-btn').dataset.index);
                this.removeMultipleReminder(index);
            });
        });
    }

    showNotificationCenter() {
        document.getElementById('notificationCenter').classList.remove('hidden');
        this.renderNotifications();
    }

    hideNotificationCenter() {
        document.getElementById('notificationCenter').classList.add('hidden');
    }

    renderNotifications() {
        const container = document.getElementById('notificationList');
        container.innerHTML = '';
        
        if (!this.notifications || this.notifications.length === 0) {
            container.innerHTML = '<div class="no-notifications"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>';
            return;
        }
        
        this.notifications.forEach(notification => {
            const notificationEl = document.createElement('div');
            notificationEl.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
            notificationEl.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${new Date(notification.timestamp).toLocaleString()}</div>
                </div>
                <button class="btn btn-icon btn-sm mark-read-btn" data-id="${notification._id}">
                    <i class="fas fa-check"></i>
                </button>
            `;
            container.appendChild(notificationEl);
        });
        
        // Add event listeners for mark read buttons
        container.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.mark-read-btn').dataset.id;
                this.markNotificationRead(id);
            });
        });
        
        this.updateNotificationBadge();
    }

    getNotificationIcon(type) {
        const icons = {
            'reminder': 'fa-bell',
            'due-date': 'fa-calendar-exclamation',
            'overdue': 'fa-exclamation-circle',
            'completed': 'fa-check-circle',
            'dependency': 'fa-link',
            'default': 'fa-info-circle'
        };
        return icons[type] || icons['default'];
    }

    addNotification(title, message, type = 'default') {
        if (!this.notifications) {
            this.notifications = [];
        }
        
        const notification = {
            _id: Date.now().toString(),
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        this.notifications.unshift(notification);
        this.updateNotificationBadge();
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
            new Notification(title, { body: message });
        }
    }

    markNotificationRead(id) {
        const notification = this.notifications.find(n => n._id === id);
        if (notification) {
            notification.read = true;
            this.renderNotifications();
        }
    }

    markAllNotificationsRead() {
        this.notifications.forEach(n => n.read = true);
        this.renderNotifications();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.renderNotifications();
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const unreadCount = this.notifications ? this.notifications.filter(n => !n.read).length : 0;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    initVoiceRecognition() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceUI(true);
                document.getElementById('voiceStatusText').textContent = 'Listening...';
                this.animateVoiceWave(true);
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    document.getElementById('voiceStatusText').textContent = `Heard: "${finalTranscript}"`;
                    this.processVoiceCommand(finalTranscript.toLowerCase());
                } else if (interimTranscript) {
                    document.getElementById('voiceStatusText').textContent = `Hearing: "${interimTranscript}"`;
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceUI(false);
                this.animateVoiceWave(false);
                
                const errorMessages = {
                    'no-speech': 'No speech detected. Please try again.',
                    'audio-capture': 'No microphone found.',
                    'not-allowed': 'Microphone access denied.',
                    'network': 'Network error. Please check your connection.'
                };
                document.getElementById('voiceStatusText').textContent = errorMessages[event.error] || 'Error occurred. Please try again.';
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceUI(false);
                this.animateVoiceWave(false);
            };
        } else {
            console.log('Speech recognition not supported');
            document.getElementById('voiceStatusText').textContent = 'Speech recognition not supported in this browser.';
        }
    }

    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.showMessage('Speech recognition not supported', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    showVoicePanel() {
        document.getElementById('voiceCommandPanel').classList.remove('hidden');
    }

    hideVoicePanel() {
        document.getElementById('voiceCommandPanel').classList.add('hidden');
        if (this.isListening) {
            this.recognition.stop();
        }
    }

    updateVoiceUI(isListening) {
        const voiceStatus = document.getElementById('voiceStatus');
        if (isListening) {
            voiceStatus.classList.remove('hidden');
            voiceStatus.classList.add('listening');
        } else {
            voiceStatus.classList.add('hidden');
            voiceStatus.classList.remove('listening');
        }
    }

    animateVoiceWave(isAnimating) {
        const waveBars = document.querySelectorAll('.wave-bar');
        waveBars.forEach((bar, index) => {
            if (isAnimating) {
                bar.style.animation = `wave 0.5s ease-in-out ${index * 0.1}s infinite`;
            } else {
                bar.style.animation = 'none';
            }
        });
    }

    processVoiceCommand(command) {
        // Command patterns
        const patterns = {
            addTask: /add task (.+)/i,
            completeTask: /complete task (.+)/i,
            deleteTask: /delete task (.+)/i,
            showAll: /show all tasks/i,
            showCompleted: /show completed tasks/i,
            showPending: /show pending tasks/i,
            showHighPriority: /show high priority tasks/i,
            toggleDarkMode: /toggle dark mode/i
        };

        // Add task
        if (patterns.addTask.test(command)) {
            const taskName = command.match(patterns.addTask)[1].trim();
            this.addTaskByVoice(taskName);
        }
        // Complete task
        else if (patterns.completeTask.test(command)) {
            const taskName = command.match(patterns.completeTask)[1].trim();
            this.completeTaskByVoice(taskName);
        }
        // Delete task
        else if (patterns.deleteTask.test(command)) {
            const taskName = command.match(patterns.deleteTask)[1].trim();
            this.deleteTaskByVoice(taskName);
        }
        // Show all tasks
        else if (patterns.showAll.test(command)) {
            this.filter = 'all';
            document.getElementById('taskFilter').value = 'all';
            this.renderTasks();
            this.showMessage('Showing all tasks', 'success');
        }
        // Show completed tasks
        else if (patterns.showCompleted.test(command)) {
            this.filter = 'completed';
            document.getElementById('taskFilter').value = 'completed';
            this.renderTasks();
            this.showMessage('Showing completed tasks', 'success');
        }
        // Show pending tasks
        else if (patterns.showPending.test(command)) {
            this.filter = 'active';
            document.getElementById('taskFilter').value = 'active';
            this.renderTasks();
            this.showMessage('Showing pending tasks', 'success');
        }
        // Show high priority tasks
        else if (patterns.showHighPriority.test(command)) {
            this.filter = 'all';
            document.getElementById('taskFilter').value = 'all';
            this.renderTasks();
            this.showMessage('Filtering by high priority', 'success');
            // Additional filtering logic would go here
        }
        // Toggle dark mode
        else if (patterns.toggleDarkMode.test(command)) {
            document.getElementById('darkModeToggle').click();
            this.showMessage('Dark mode toggled', 'success');
        }
        // Unknown command
        else {
            this.showMessage('Command not recognized. Please try again.');
            setTimeout(() => {
                document.getElementById('voiceStatusText').textContent = 'Click the microphone to start listening...';
            }, 2000);
        }
    }

    async addTaskByVoice(taskName) {
        const task = {
            title: taskName,
            description: '',
            priority: 'medium',
            category: 'general',
            dueDate: null,
            completed: false
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

            const data = await response.json();

            if (response.ok) {
                this.tasks.unshift(data);
                this.renderTasks();
                this.showMessage(`Task "${taskName}" added successfully!`, 'success');
            } else {
                this.showMessage('Failed to add task', 'error');
            }
        } catch (error) {
            console.error('Add task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async completeTaskByVoice(taskName) {
        const task = this.tasks.find(t => t.title.toLowerCase() === taskName.toLowerCase());
        
        if (!task) {
            this.showMessage(`Task "${taskName}" not found`, 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ completed: true })
            });

            const data = await response.json();

            if (response.ok) {
                const index = this.tasks.findIndex(t => t._id === task._id);
                if (index !== -1) {
                    this.tasks[index] = data;
                }
                this.renderTasks();
                this.showMessage(`Task "${taskName}" marked as completed!`, 'success');
            } else {
                this.showMessage('Failed to complete task', 'error');
            }
        } catch (error) {
            console.error('Complete task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async deleteTaskByVoice(taskName) {
        const task = this.tasks.find(t => t.title.toLowerCase() === taskName.toLowerCase());
        
        if (!task) {
            this.showMessage(`Task "${taskName}" not found`, 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${task._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                this.tasks = this.tasks.filter(t => t._id !== task._id);
                this.renderTasks();
                this.showMessage(`Task "${taskName}" deleted successfully!`, 'success');
            } else {
                this.showMessage('Failed to delete task', 'error');
            }
        } catch (error) {
            console.error('Delete task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showGamificationModal() {
        this.loadGamificationData();
        document.getElementById('gamificationModal').classList.remove('hidden');
    }

    hideGamificationModal() {
        document.getElementById('gamificationModal').classList.add('hidden');
    }

    loadGamificationData() {
        // Calculate stats from tasks
        const completedTasks = this.tasks.filter(t => t.completed);
        this.gamification.tasksCompleted = completedTasks.length;
        
        // Calculate points (10 points per completed task)
        this.gamification.totalPoints = completedTasks.length * 10;
        
        // Calculate level (every 100 points = 1 level)
        this.gamification.currentLevel = Math.floor(this.gamification.totalPoints / 100) + 1;
        
        // Calculate streak (simplified - just count days with activity)
        this.gamification.streakDays = this.calculateStreak();
        
        // Initialize badges
        this.initializeBadges();
        
        // Initialize achievements
        this.initializeAchievements();
        
        // Render all gamification data
        this.renderGamificationStats();
        this.renderBadges();
        this.renderAchievements();
        this.renderRecentActivity();
    }

    calculateStreak() {
        // Simplified streak calculation
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const hasActivity = this.tasks.some(t => {
                const taskDate = new Date(t.createdAt).toISOString().split('T')[0];
                return taskDate === dateStr;
            });
            
            if (hasActivity) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    }

    initializeBadges() {
        this.gamification.badges = [
            { id: 'first-task', name: 'First Steps', icon: '🎯', description: 'Complete your first task', unlocked: this.gamification.tasksCompleted >= 1 },
            { id: 'ten-tasks', name: 'Getting Started', icon: '🌟', description: 'Complete 10 tasks', unlocked: this.gamification.tasksCompleted >= 10 },
            { id: 'fifty-tasks', name: 'Task Master', icon: '🏆', description: 'Complete 50 tasks', unlocked: this.gamification.tasksCompleted >= 50 },
            { id: 'hundred-tasks', name: 'Legendary', icon: '👑', description: 'Complete 100 tasks', unlocked: this.gamification.tasksCompleted >= 100 },
            { id: 'streak-7', name: 'Week Warrior', icon: '🔥', description: '7 day streak', unlocked: this.gamification.streakDays >= 7 },
            { id: 'streak-30', name: 'Month Master', icon: '💪', description: '30 day streak', unlocked: this.gamification.streakDays >= 30 },
            { id: 'level-5', name: 'Rising Star', icon: '⭐', description: 'Reach level 5', unlocked: this.gamification.currentLevel >= 5 },
            { id: 'level-10', name: 'Champion', icon: '🎖️', description: 'Reach level 10', unlocked: this.gamification.currentLevel >= 10 }
        ];
    }

    initializeAchievements() {
        this.gamification.achievements = [
            { id: 'early-bird', name: 'Early Bird', description: 'Complete a task before 9 AM', progress: 0, total: 1, unlocked: false },
            { id: 'night-owl', name: 'Night Owl', description: 'Complete a task after 9 PM', progress: 0, total: 1, unlocked: false },
            { id: 'speed-demon', name: 'Speed Demon', description: 'Complete 5 tasks in one day', progress: 0, total: 5, unlocked: false },
            { id: 'perfectionist', name: 'Perfectionist', description: 'Complete 10 tasks with high priority', progress: 0, total: 10, unlocked: false },
            { id: 'organizer', name: 'Organizer', description: 'Use 5 different categories', progress: 0, total: 5, unlocked: false },
            { id: 'social-butterfly', name: 'Social Butterfly', description: 'Share 5 tasks', progress: 0, total: 5, unlocked: false }
        ];
    }

    renderGamificationStats() {
        document.getElementById('totalPoints').textContent = this.gamification.totalPoints;
        document.getElementById('currentLevel').textContent = this.gamification.currentLevel;
        document.getElementById('tasksCompleted').textContent = this.gamification.tasksCompleted;
        document.getElementById('streakDays').textContent = this.gamification.streakDays;
        
        // Update level progress
        const pointsInCurrentLevel = this.gamification.totalPoints % 100;
        const progressPercentage = pointsInCurrentLevel;
        document.getElementById('levelProgressBar').style.width = `${progressPercentage}%`;
        document.getElementById('levelProgressText').textContent = `${pointsInCurrentLevel} / 100 XP`;
    }

    renderBadges() {
        const container = document.getElementById('badgesList');
        container.innerHTML = '';
        
        this.gamification.badges.forEach(badge => {
            const badgeItem = document.createElement('div');
            badgeItem.className = `badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`;
            badgeItem.innerHTML = `
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-info">
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-description">${badge.description}</div>
                </div>
                ${badge.unlocked ? '<div class="badge-status">✓</div>' : '<div class="badge-status">🔒</div>'}
            `;
            container.appendChild(badgeItem);
        });
    }

    renderAchievements() {
        const container = document.getElementById('achievementsList');
        container.innerHTML = '';
        
        this.gamification.achievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementItem.innerHTML = `
                <div class="achievement-header">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-status">${achievement.unlocked ? '✓ Unlocked' : '🔒 Locked'}</div>
                </div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(achievement.progress / achievement.total) * 100}%"></div>
                    </div>
                    <div class="progress-text">${achievement.progress} / ${achievement.total}</div>
                </div>
            `;
            container.appendChild(achievementItem);
        });
    }

    renderRecentActivity() {
        const container = document.getElementById('recentActivityList');
        container.innerHTML = '';
        
        // Generate some sample recent activity
        const activities = [
            { type: 'task-completed', message: 'Completed "Review project proposal"', points: 10, time: '2 hours ago' },
            { type: 'badge-earned', message: 'Earned "First Steps" badge', points: 0, time: '5 hours ago' },
            { type: 'level-up', message: 'Reached Level 2', points: 0, time: '1 day ago' },
            { type: 'task-completed', message: 'Completed "Update documentation"', points: 10, time: '1 day ago' }
        ];
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">${this.getActivityIconForType(activity.type)}</div>
                <div class="activity-content">
                    <div class="activity-message">${activity.message}</div>
                    <div class="activity-meta">
                        <span class="activity-points">${activity.points > 0 ? `+${activity.points} XP` : ''}</span>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `;
            container.appendChild(activityItem);
        });
    }

    getActivityIconForType(type) {
        const icons = {
            'task-completed': '✅',
            'badge-earned': '🎖️',
            'level-up': '⬆️',
            'streak': '🔥'
        };
        return icons[type] || '📌';
    }

    awardPoints(points, reason) {
        this.gamification.totalPoints += points;
        this.gamification.recentActivity.unshift({
            type: 'points-earned',
            message: reason,
            points: points,
            time: 'Just now'
        });
        
        // Check for level up
        const newLevel = Math.floor(this.gamification.totalPoints / 100) + 1;
        if (newLevel > this.gamification.currentLevel) {
            this.gamification.currentLevel = newLevel;
            this.showMessage(`🎉 Level Up! You reached Level ${newLevel}!`, 'success');
        }
        
        // Check for new badges
        this.checkBadges();
    }

    checkBadges() {
        this.gamification.badges.forEach(badge => {
            if (!badge.unlocked) {
                let shouldUnlock = false;
                
                switch(badge.id) {
                    case 'first-task':
                        shouldUnlock = this.gamification.tasksCompleted >= 1;
                        break;
                    case 'ten-tasks':
                        shouldUnlock = this.gamification.tasksCompleted >= 10;
                        break;
                    case 'fifty-tasks':
                        shouldUnlock = this.gamification.tasksCompleted >= 50;
                        break;
                    case 'hundred-tasks':
                        shouldUnlock = this.gamification.tasksCompleted >= 100;
                        break;
                    case 'streak-7':
                        shouldUnlock = this.gamification.streakDays >= 7;
                        break;
                    case 'streak-30':
                        shouldUnlock = this.gamification.streakDays >= 30;
                        break;
                    case 'level-5':
                        shouldUnlock = this.gamification.currentLevel >= 5;
                        break;
                    case 'level-10':
                        shouldUnlock = this.gamification.currentLevel >= 10;
                        break;
                }
                
                if (shouldUnlock) {
                    badge.unlocked = true;
                    this.showMessage(`🎖️ Badge Unlocked: ${badge.name}!`, 'success');
                }
            }
        });
    }

    showExportImportModal() {
        document.getElementById('exportImportModal').classList.remove('hidden');
    }

    hideExportImportModal() {
        document.getElementById('exportImportModal').classList.add('hidden');
    }

    exportTasks() {
        const format = document.getElementById('exportFormat').value;
        const includeCompleted = document.getElementById('exportCompleted').checked;
        const includeArchived = document.getElementById('exportArchived').checked;

        let tasksToExport = this.tasks;

        if (!includeCompleted) {
            tasksToExport = tasksToExport.filter(t => !t.completed);
        }

        if (!includeArchived) {
            tasksToExport = tasksToExport.filter(t => !t.isArchived);
        }

        if (format === 'json') {
            this.exportAsJSON(tasksToExport);
        } else if (format === 'csv') {
            this.exportAsCSV(tasksToExport);
        }
    }

    exportAsJSON(tasks) {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Tasks exported successfully!', 'success');
    }

    exportAsCSV(tasks) {
        if (tasks.length === 0) {
            this.showMessage('No tasks to export', 'error');
            return;
        }

        const headers = ['Title', 'Description', 'Priority', 'Category', 'Status', 'Due Date', 'Created At'];
        const csvContent = [
            headers.join(','),
            ...tasks.map(task => [
                `"${task.title.replace(/"/g, '""')}"`,
                `"${(task.description || '').replace(/"/g, '""')}"`,
                task.priority,
                task.category,
                task.completed ? 'Completed' : 'Pending',
                task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                new Date(task.createdAt).toISOString().split('T')[0]
            ].join(','))
        ].join('\n');

        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Tasks exported successfully!', 'success');
    }

    async importTasks() {
        const format = document.getElementById('importFormat').value;
        const fileInput = document.getElementById('importFile');
        const overwrite = document.getElementById('importOverwrite').checked;
        const merge = document.getElementById('importMerge').checked;

        if (!fileInput.files.length) {
            this.showMessage('Please select a file to import', 'error');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                let importedTasks = [];

                if (format === 'json') {
                    importedTasks = JSON.parse(e.target.result);
                } else if (format === 'csv') {
                    importedTasks = this.parseCSV(e.target.result);
                }

                if (!Array.isArray(importedTasks)) {
                    this.showMessage('Invalid file format', 'error');
                    return;
                }

                if (overwrite) {
                    // Delete all existing tasks
                    for (const task of this.tasks) {
                        await fetch(`http://localhost:5002/api/tasks/${task._id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
                        });
                    }
                    this.tasks = [];
                }

                // Import new tasks
                let importedCount = 0;
                for (const task of importedTasks) {
                    const newTask = {
                        title: task.title || 'Untitled Task',
                        description: task.description || '',
                        priority: task.priority || 'medium',
                        category: task.category || 'general',
                        dueDate: task.dueDate || null,
                        completed: task.completed || false
                    };

                    try {
                        const response = await fetch('http://localhost:5002/api/tasks', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${window.authManager.getToken()}`
                            },
                            body: JSON.stringify(newTask)
                        });

                        if (response.ok) {
                            const data = await response.json();
                            this.tasks.unshift(data);
                            importedCount++;
                        }
                    } catch (error) {
                        console.error('Error importing task:', error);
                    }
                }

                this.renderTasks();
                this.showMessage(`Successfully imported ${importedCount} tasks!`, 'success');
                fileInput.value = '';
            } catch (error) {
                console.error('Import error:', error);
                this.showMessage('Failed to import tasks. Please check the file format.', 'error');
            }
        };

        reader.readAsText(file);
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const tasks = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const task = {};

            headers.forEach((header, index) => {
                const value = values[index];
                switch(header.toLowerCase()) {
                    case 'title':
                        task.title = value;
                        break;
                    case 'description':
                        task.description = value;
                        break;
                    case 'priority':
                        task.priority = value.toLowerCase();
                        break;
                    case 'category':
                        task.category = value.toLowerCase();
                        break;
                    case 'status':
                        task.completed = value.toLowerCase() === 'completed';
                        break;
                    case 'due date':
                        task.dueDate = value ? new Date(value).toISOString() : null;
                        break;
                }
            });

            if (task.title) {
                tasks.push(task);
            }
        }

        return tasks;
    }

    showAiSuggestionsModal() {
        this.generateAISuggestions();
        document.getElementById('aiSuggestionsModal').classList.remove('hidden');
    }

    hideAiSuggestionsModal() {
        document.getElementById('aiSuggestionsModal').classList.add('hidden');
    }

    generateAISuggestions() {
        this.generateSmartTaskSuggestions();
        this.generateRecurringTaskSuggestions();
        this.generatePriorityRecommendations();
        this.generateTimeBasedSuggestions();
        this.generateProductivityInsights();
        this.generateGoalProgress();
    }

    generateSmartTaskSuggestions() {
        const container = document.getElementById('smartTaskSuggestions');
        container.innerHTML = '';

        const suggestions = this.getSmartTaskSuggestions();

        if (suggestions.length === 0) {
            container.innerHTML = '<div class="no-suggestions"><p>No suggestions available. Complete more tasks to get personalized suggestions!</p></div>';
            return;
        }

        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <div class="suggestion-icon">💡</div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-reason">${suggestion.reason}</div>
                </div>
                <button class="btn btn-sm btn-primary add-suggestion-btn" data-task-title="${suggestion.title}">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
            container.appendChild(suggestionItem);
        });

        // Add event listeners for add buttons
        container.querySelectorAll('.add-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskTitle = e.target.closest('.add-suggestion-btn').dataset.taskTitle;
                this.addSuggestedTask(taskTitle);
            });
        });
    }

    getSmartTaskSuggestions() {
        const suggestions = [];
        const categories = [...new Set(this.tasks.map(t => t.category))];
        const completedTasks = this.tasks.filter(t => t.completed);
        const pendingTasks = this.tasks.filter(t => !t.completed);

        // Suggest follow-up tasks based on completed tasks
        if (completedTasks.length > 0) {
            const lastCompleted = completedTasks[0];
            if (lastCompleted.category === 'work') {
                suggestions.push({
                    title: 'Review completed work tasks',
                    reason: 'Based on your recent work activity'
                });
            }
        }

        // Suggest tasks based on pending tasks
        if (pendingTasks.length > 5) {
            suggestions.push({
                title: 'Focus on high priority tasks',
                reason: 'You have many pending tasks'
            });
        }

        // Suggest category-based tasks
        if (categories.includes('work') && !categories.includes('personal')) {
            suggestions.push({
                title: 'Add personal tasks for work-life balance',
                reason: 'Balance your task categories'
            });
        }

        // Suggest based on time of day
        const hour = new Date().getHours();
        if (hour >= 9 && hour < 12) {
            suggestions.push({
                title: 'Plan your day\'s priorities',
                reason: 'Morning is a great time for planning'
            });
        } else if (hour >= 17) {
            suggestions.push({
                title: 'Review today\'s progress',
                reason: 'End of day review time'
            });
        }

        return suggestions;
    }

    generateRecurringTaskSuggestions() {
        const container = document.getElementById('recurringTaskSuggestions');
        container.innerHTML = '';

        const suggestions = this.getRecurringTaskSuggestions();

        if (suggestions.length === 0) {
            container.innerHTML = '<div class="no-suggestions"><p>No recurring patterns detected yet.</p></div>';
            return;
        }

        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <div class="suggestion-icon">🔄</div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-reason">${suggestion.reason}</div>
                </div>
                <button class="btn btn-sm btn-primary add-suggestion-btn" data-task-title="${suggestion.title}">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
            container.appendChild(suggestionItem);
        });

        // Add event listeners for add buttons
        container.querySelectorAll('.add-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskTitle = e.target.closest('.add-suggestion-btn').dataset.taskTitle;
                this.addSuggestedTask(taskTitle);
            });
        });
    }

    getRecurringTaskSuggestions() {
        const suggestions = [];
        const today = new Date().getDay();

        // Weekly suggestions based on day
        const daySuggestions = {
            0: [{ title: 'Weekly review and planning', reason: 'Sunday is perfect for weekly planning' }],
            1: [{ title: 'Set weekly goals', reason: 'Monday goal setting' }],
            5: [{ title: 'Weekly wrap-up', reason: 'Friday is great for wrapping up the week' }]
        };

        if (daySuggestions[today]) {
            suggestions.push(...daySuggestions[today]);
        }

        // Daily recurring tasks
        suggestions.push({
            title: 'Check emails',
            reason: 'Daily recurring task'
        });

        suggestions.push({
            title: 'Update task list',
            reason: 'Daily task management'
        });

        return suggestions;
    }

    generatePriorityRecommendations() {
        const container = document.getElementById('priorityRecommendations');
        container.innerHTML = '';

        const recommendations = this.getPriorityRecommendations();

        recommendations.forEach(rec => {
            const recItem = document.createElement('div');
            recItem.className = 'recommendation-item';
            recItem.innerHTML = `
                <div class="recommendation-icon">${rec.icon}</div>
                <div class="recommendation-content">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-description">${rec.description}</div>
                </div>
                <div class="recommendation-priority priority-${rec.priority}">
                    ${rec.priority.toUpperCase()}
                </div>
            `;
            container.appendChild(recItem);
        });
    }

    getPriorityRecommendations() {
        const recommendations = [];
        const pendingTasks = this.tasks.filter(t => !t.completed);
        const overdueTasks = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());

        // Overdue tasks
        if (overdueTasks.length > 0) {
            recommendations.push({
                icon: '⚠️',
                title: `${overdueTasks.length} overdue task(s)`,
                description: 'Complete these tasks immediately',
                priority: 'high'
            });
        }

        // High priority tasks
        const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
        if (highPriorityTasks.length > 0) {
            recommendations.push({
                icon: '🔴',
                title: `${highPriorityTasks.length} high priority task(s)`,
                description: 'Focus on these tasks first',
                priority: 'high'
            });
        }

        // Medium priority tasks
        const mediumPriorityTasks = pendingTasks.filter(t => t.priority === 'medium');
        if (mediumPriorityTasks.length > 3) {
            recommendations.push({
                icon: '🟡',
                title: `${mediumPriorityTasks.length} medium priority task(s)`,
                description: 'Consider prioritizing some of these',
                priority: 'medium'
            });
        }

        // Tasks due today
        const dueToday = pendingTasks.filter(t => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate).toDateString();
            const today = new Date().toDateString();
            return dueDate === today;
        });

        if (dueToday.length > 0) {
            recommendations.push({
                icon: '📅',
                title: `${dueToday.length} task(s) due today`,
                description: 'Complete these before the day ends',
                priority: 'high'
            });
        }

        return recommendations;
    }

    generateTimeBasedSuggestions() {
        const container = document.getElementById('timeBasedSuggestions');
        container.innerHTML = '';

        const suggestions = this.getTimeBasedSuggestions();

        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'time-suggestion-item';
            suggestionItem.innerHTML = `
                <div class="time-icon">${suggestion.icon}</div>
                <div class="time-content">
                    <div class="time-title">${suggestion.title}</div>
                    <div class="time-suggestion">${suggestion.suggestion}</div>
                </div>
            `;
            container.appendChild(suggestionItem);
        });
    }

    getTimeBasedSuggestions() {
        const suggestions = [];
        const hour = new Date().getHours();
        const day = new Date().getDay();

        // Morning suggestions
        if (hour >= 6 && hour < 12) {
            suggestions.push({
                icon: '🌅',
                title: 'Morning Block',
                suggestion: 'Tackle your most challenging tasks now'
            });
        }
        // Afternoon suggestions
        else if (hour >= 12 && hour < 17) {
            suggestions.push({
                icon: '☀️',
                title: 'Afternoon Block',
                suggestion: 'Good time for meetings and collaborative tasks'
            });
        }
        // Evening suggestions
        else if (hour >= 17 && hour < 21) {
            suggestions.push({
                icon: '🌆',
                title: 'Evening Block',
                suggestion: 'Review progress and plan for tomorrow'
            });
        }
        // Night suggestions
        else {
            suggestions.push({
                icon: '🌙',
                title: 'Night Block',
                suggestion: 'Best for low-energy tasks and planning'
            });
        }

        // Day-based suggestions
        if (day === 1) {
            suggestions.push({
                icon: '📋',
                title: 'Monday Planning',
                suggestion: 'Set your weekly goals today'
            });
        } else if (day === 5) {
            suggestions.push({
                icon: '✅',
                title: 'Friday Review',
                suggestion: 'Review your weekly accomplishments'
            });
        }

        return suggestions;
    }

    generateProductivityInsights() {
        const container = document.getElementById('productivityInsights');
        container.innerHTML = '';

        const insights = this.getProductivityInsights();

        insights.forEach(insight => {
            const insightItem = document.createElement('div');
            insightItem.className = 'insight-item';
            insightItem.innerHTML = `
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-value">${insight.value}</div>
                    <div class="insight-description">${insight.description}</div>
                </div>
            `;
            container.appendChild(insightItem);
        });
    }

    getProductivityInsights() {
        const insights = [];
        const completedTasks = this.tasks.filter(t => t.completed);
        const pendingTasks = this.tasks.filter(t => !t.completed);
        const totalTasks = this.tasks.length;

        // Completion rate
        const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
        insights.push({
            icon: '📊',
            title: 'Completion Rate',
            value: `${completionRate}%`,
            description: completionRate >= 70 ? 'Great productivity!' : 'Room for improvement'
        });

        // Task categories
        const categories = [...new Set(this.tasks.map(t => t.category))];
        insights.push({
            icon: '🏷️',
            title: 'Categories Used',
            value: categories.length.toString(),
            description: categories.length >= 3 ? 'Good variety!' : 'Try using more categories'
        });

        // Average tasks per day (simplified)
        const daysActive = Math.min(30, this.tasks.length);
        const avgTasksPerDay = daysActive > 0 ? (totalTasks / daysActive).toFixed(1) : 0;
        insights.push({
            icon: '📈',
            title: 'Avg Tasks/Day',
            value: avgTasksPerDay,
            description: avgTasksPerDay >= 3 ? 'Consistent productivity!' : 'Try to be more consistent'
        });

        // High priority completion
        const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length;
        const highPriorityTotal = this.tasks.filter(t => t.priority === 'high').length;
        const highPriorityRate = highPriorityTotal > 0 ? Math.round((highPriorityCompleted / highPriorityTotal) * 100) : 0;
        insights.push({
            icon: '🎯',
            title: 'High Priority Completion',
            value: `${highPriorityRate}%`,
            description: 'Focus on completing high priority tasks'
        });

        return insights;
    }

    generateGoalProgress() {
        const container = document.getElementById('goalProgress');
        container.innerHTML = '';

        const goals = this.getGoalProgress();

        goals.forEach(goal => {
            const goalItem = document.createElement('div');
            goalItem.className = 'goal-item';
            goalItem.innerHTML = `
                <div class="goal-header">
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-percentage">${goal.percentage}%</div>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${goal.percentage}%"></div>
                </div>
                <div class="goal-description">${goal.description}</div>
            `;
            container.appendChild(goalItem);
        });
    }

    getGoalProgress() {
        const goals = [];
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;

        // Weekly completion goal
        const weeklyGoal = Math.min(10, totalTasks);
        const weeklyProgress = Math.min(100, Math.round((completedTasks / weeklyGoal) * 100));
        goals.push({
            title: 'Weekly Task Goal',
            percentage: weeklyProgress,
            description: `${completedTasks}/${weeklyGoal} tasks completed this week`
        });

        // Category diversity goal
        const categories = [...new Set(this.tasks.map(t => t.category))];
        const categoryGoal = 5;
        const categoryProgress = Math.min(100, Math.round((categories.length / categoryGoal) * 100));
        goals.push({
            title: 'Category Diversity',
            percentage: categoryProgress,
            description: `${categories.length}/${categoryGoal} categories used`
        });

        // High priority completion goal
        const highPriorityCompleted = this.tasks.filter(t => t.completed && t.priority === 'high').length;
        const highPriorityTotal = this.tasks.filter(t => t.priority === 'high').length;
        const highPriorityProgress = highPriorityTotal > 0 ? Math.round((highPriorityCompleted / highPriorityTotal) * 100) : 0;
        goals.push({
            title: 'High Priority Completion',
            percentage: highPriorityProgress,
            description: `${highPriorityCompleted}/${highPriorityTotal} high priority tasks completed`
        });

        return goals;
    }

    async addSuggestedTask(title) {
        const task = {
            title: title,
            description: '',
            priority: 'medium',
            category: 'general',
            dueDate: null,
            completed: false
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

            const data = await response.json();

            if (response.ok) {
                this.tasks.unshift(data);
                this.renderTasks();
                this.showMessage(`Task "${title}" added successfully!`, 'success');
                this.hideAiSuggestionsModal();
            } else {
                this.showMessage('Failed to add task', 'error');
            }
        } catch (error) {
            console.error('Add task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showAnalyticsModal() {
        this.generateAnalytics();
        document.getElementById('analyticsModal').classList.remove('hidden');
    }

    hideAnalyticsModal() {
        document.getElementById('analyticsModal').classList.add('hidden');
    }

    generateAnalytics() {
        this.updateAnalyticsOverview();
        this.updatePriorityChart();
        this.updateCategoryChart();
        this.updateWeeklyActivityChart();
        this.updateCompletionTimeStats();
        this.updateProductivityScore();
    }

    updateAnalyticsOverview() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        document.getElementById('totalTasksAnalytics').textContent = totalTasks;
        document.getElementById('completedTasksAnalytics').textContent = completedTasks;
        document.getElementById('pendingTasksAnalytics').textContent = pendingTasks;
        document.getElementById('completionRateAnalytics').textContent = `${completionRate}%`;
    }

    updatePriorityChart() {
        const highPriority = this.tasks.filter(t => t.priority === 'high').length;
        const mediumPriority = this.tasks.filter(t => t.priority === 'medium').length;
        const lowPriority = this.tasks.filter(t => t.priority === 'low').length;
        const total = this.tasks.length;

        const highPercent = total > 0 ? (highPriority / total) * 100 : 0;
        const mediumPercent = total > 0 ? (mediumPriority / total) * 100 : 0;
        const lowPercent = total > 0 ? (lowPriority / total) * 100 : 0;

        document.getElementById('highPriorityBar').style.width = `${highPercent}%`;
        document.getElementById('mediumPriorityBar').style.width = `${mediumPercent}%`;
        document.getElementById('lowPriorityBar').style.width = `${lowPercent}%`;
    }

    updateCategoryChart() {
        const container = document.getElementById('categoryChart');
        container.innerHTML = '';

        const categories = {};
        this.tasks.forEach(task => {
            const category = task.category || 'general';
            categories[category] = (categories[category] || 0) + 1;
        });

        const total = this.tasks.length;
        const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);

        sortedCategories.forEach(([category, count]) => {
            const percent = total > 0 ? (count / total) * 100 : 0;
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-bar';
            categoryItem.innerHTML = `
                <div class="category-label">${category}</div>
                <div class="category-bar-fill" style="width: ${percent}%"></div>
                <div class="category-count">${count}</div>
            `;
            container.appendChild(categoryItem);
        });
    }

    updateWeeklyActivityChart() {
        const container = document.getElementById('weeklyActivityChart');
        container.innerHTML = '';

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const tasksOnDay = this.tasks.filter(t => {
                const taskDate = new Date(t.createdAt).toISOString().split('T')[0];
                return taskDate === dateStr;
            }).length;

            weekData.push({
                day: days[date.getDay()],
                count: tasksOnDay
            });
        }

        const maxCount = Math.max(...weekData.map(d => d.count), 1);

        weekData.forEach(data => {
            const height = (data.count / maxCount) * 100;
            const dayItem = document.createElement('div');
            dayItem.className = 'weekly-bar';
            dayItem.innerHTML = `
                <div class="weekly-bar-fill" style="height: ${height}%"></div>
                <div class="weekly-bar-label">${data.day}</div>
                <div class="weekly-bar-count">${data.count}</div>
            `;
            container.appendChild(dayItem);
        });
    }

    updateCompletionTimeStats() {
        const completedTasks = this.tasks.filter(t => t.completed && t.createdAt && t.updatedAt);
        
        if (completedTasks.length === 0) {
            document.getElementById('avgCompletionTime').textContent = '0 days';
            document.getElementById('fastestCompletion').textContent = '0 days';
            document.getElementById('slowestCompletion').textContent = '0 days';
            return;
        }

        const completionTimes = completedTasks.map(task => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.updatedAt);
            const diffTime = Math.abs(completed - created);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        });

        const avgTime = Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length);
        const fastestTime = Math.min(...completionTimes);
        const slowestTime = Math.max(...completionTimes);

        document.getElementById('avgCompletionTime').textContent = `${avgTime} days`;
        document.getElementById('fastestCompletion').textContent = `${fastestTime} days`;
        document.getElementById('slowestCompletion').textContent = `${slowestTime} days`;
    }

    updateProductivityScore() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const highPriorityCompleted = this.tasks.filter(t => t.completed && t.priority === 'high').length;
        const highPriorityTotal = this.tasks.filter(t => t.priority === 'high').length;

        // Task completion score (0-40)
        const completionScore = totalTasks > 0 ? Math.min(40, (completedTasks / totalTasks) * 40) : 0;

        // Consistency score (0-30) - based on weekly activity
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        let activeDays = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const hasActivity = this.tasks.some(t => {
                const taskDate = new Date(t.createdAt).toISOString().split('T')[0];
                return taskDate === dateStr;
            });
            
            if (hasActivity) activeDays++;
        }
        
        const consistencyScore = (activeDays / 7) * 30;

        // Priority focus score (0-30)
        const priorityFocusScore = highPriorityTotal > 0 ? (highPriorityCompleted / highPriorityTotal) * 30 : 0;

        const totalScore = Math.round(completionScore + consistencyScore + priorityFocusScore);

        document.getElementById('productivityScore').textContent = totalScore;
        document.getElementById('taskCompletionScore').textContent = Math.round(completionScore);
        document.getElementById('consistencyScore').textContent = Math.round(consistencyScore);
        document.getElementById('priorityFocusScore').textContent = Math.round(priorityFocusScore);
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
                this.renderTemplates();
            } else {
                this.showMessage('Failed to load templates', 'error');
            }
        } catch (error) {
            console.error('Load templates error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    renderTemplates() {
        const container = document.getElementById('templatesList');
        
        if (this.templates.length === 0) {
            container.innerHTML = '<div class="no-templates">No templates created yet. Click "Create Template" to get started!</div>';
            return;
        }

        container.innerHTML = '';
        this.templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <div class="template-header">
                    <div class="template-name">${template.templateName}</div>
                    <div class="template-actions">
                        <button class="template-action-btn delete" data-template-id="${template._id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="template-title">${template.title}</div>
                ${template.description ? `<div class="template-description">${template.description}</div>` : ''}
                <div class="template-meta">
                    ${template.priority ? `<div class="template-meta-item"><i class="fas fa-flag"></i> ${template.priority}</div>` : ''}
                    ${template.category ? `<div class="template-meta-item"><i class="fas fa-folder"></i> ${template.category}</div>` : ''}
                    ${template.subtasks && template.subtasks.length > 0 ? `<div class="template-meta-item"><i class="fas fa-tasks"></i> ${template.subtasks.length} subtasks</div>` : ''}
                </div>
                ${template.tags && template.tags.length > 0 ? `
                    <div class="template-tags">
                        ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <button class="btn btn-primary template-use-btn" data-template-id="${template._id}">
                    <i class="fas fa-plus"></i> Use Template
                </button>
            `;
            container.appendChild(card);
        });

        // Add event listeners
        container.querySelectorAll('.template-use-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.closest('.template-use-btn').dataset.templateId;
                this.useTemplate(templateId);
            });
        });

        container.querySelectorAll('.template-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.closest('.template-action-btn').dataset.templateId;
                if (confirm('Are you sure you want to delete this template?')) {
                    this.deleteTemplate(templateId);
                }
            });
        });
    }

    showCreateTemplateModal() {
        document.getElementById('createTemplateModal').classList.remove('hidden');
    }

    hideCreateTemplateModal() {
        document.getElementById('createTemplateModal').classList.add('hidden');
        // Clear form
        document.getElementById('templateName').value = '';
        document.getElementById('templateTitle').value = '';
        document.getElementById('templateDescription').value = '';
        document.getElementById('templatePriority').value = 'medium';
        document.getElementById('templateCategory').value = '';
        document.getElementById('templateTags').value = '';
        document.getElementById('templateSubtasks').value = '';
    }

    async createTemplate() {
        const templateName = document.getElementById('templateName').value.trim();
        const title = document.getElementById('templateTitle').value.trim();
        const description = document.getElementById('templateDescription').value.trim();
        const priority = document.getElementById('templatePriority').value;
        const category = document.getElementById('templateCategory').value;
        const tags = document.getElementById('templateTags').value.split(',').map(t => t.trim()).filter(t => t);
        const subtasksText = document.getElementById('templateSubtasks').value;
        const subtasks = subtasksText.split('\n').map(s => s.trim()).filter(s => s).map(s => ({ text: s, completed: false }));

        if (!templateName || !title) {
            this.showMessage('Template name and title are required', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:5002/api/tasks/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ templateName, title, description, priority, category, tags, subtasks })
            });

            if (response.ok) {
                this.showMessage('Template created successfully!', 'success');
                this.hideCreateTemplateModal();
                this.loadTemplates();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to create template', 'error');
            }
        } catch (error) {
            console.error('Create template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async useTemplate(templateId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/templates/${templateId}/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const task = await response.json();
                this.tasks.unshift(task);
                this.renderTasks();
                this.showMessage('Task created from template successfully!', 'success');
                this.hideTemplatesModal();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to create task from template', 'error');
            }
        } catch (error) {
            console.error('Use template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async deleteTemplate(templateId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                this.showMessage('Template deleted successfully!', 'success');
                this.loadTemplates();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to delete template', 'error');
            }
        } catch (error) {
            console.error('Delete template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showTimeTrackingModal(taskId) {
        this.currentTimeTrackingTaskId = taskId;
        const task = this.tasks.find(t => t._id === taskId);
        
        document.getElementById('timeTrackingTaskTitle').textContent = task.title;
        this.renderTimeTracking(task);
        document.getElementById('timeTrackingModal').classList.remove('hidden');
    }

    hideTimeTrackingModal() {
        document.getElementById('timeTrackingModal').classList.add('hidden');
        if (this.timeTrackingInterval) {
            clearInterval(this.timeTrackingInterval);
            this.timeTrackingInterval = null;
        }
        this.currentTimeTrackingTaskId = null;
    }

    renderTimeTracking(task) {
        const timeTracking = task.timeTracking || { isRunning: false, totalTime: 0, sessions: [] };
        
        // Update total time
        document.getElementById('totalTime').textContent = this.formatTime(timeTracking.totalTime);
        
        // Update current session time
        if (timeTracking.isRunning && timeTracking.startTime) {
            const startTime = new Date(timeTracking.startTime);
            const currentTime = new Date();
            const elapsed = Math.floor((currentTime - startTime) / 1000);
            document.getElementById('currentSessionTime').textContent = this.formatTime(elapsed);
            
            // Start interval to update current session time
            if (this.timeTrackingInterval) {
                clearInterval(this.timeTrackingInterval);
            }
            this.timeTrackingInterval = setInterval(() => {
                const now = new Date();
                const newElapsed = Math.floor((now - startTime) / 1000);
                document.getElementById('currentSessionTime').textContent = this.formatTime(newElapsed);
            }, 1000);
        } else {
            document.getElementById('currentSessionTime').textContent = '00:00:00';
            if (this.timeTrackingInterval) {
                clearInterval(this.timeTrackingInterval);
                this.timeTrackingInterval = null;
            }
        }
        
        // Update button states
        document.getElementById('startTimeBtn').disabled = timeTracking.isRunning;
        document.getElementById('stopTimeBtn').disabled = !timeTracking.isRunning;
        
        // Render sessions
        this.renderSessions(timeTracking.sessions);
    }

    renderSessions(sessions) {
        const container = document.getElementById('sessionsList');
        
        if (!sessions || sessions.length === 0) {
            container.innerHTML = '<div class="no-sessions">No sessions recorded yet</div>';
            return;
        }
        
        container.innerHTML = '';
        sessions.slice().reverse().forEach(session => {
            const item = document.createElement('div');
            item.className = 'session-item';
            const startDate = new Date(session.startTime);
            const formattedDate = startDate.toLocaleDateString();
            const formattedTime = this.formatTime(session.duration);
            item.innerHTML = `
                <span class="session-time">${formattedTime}</span>
                <span class="session-date">${formattedDate}</span>
            `;
            container.appendChild(item);
        });
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    async startTimeTracking() {
        if (!this.currentTimeTrackingTaskId) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentTimeTrackingTaskId}/time/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentTimeTrackingTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.renderTimeTracking(task);
                this.showMessage('Time tracking started!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to start time tracking', 'error');
            }
        } catch (error) {
            console.error('Start time tracking error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async stopTimeTracking() {
        if (!this.currentTimeTrackingTaskId) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentTimeTrackingTaskId}/time/stop`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentTimeTrackingTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.renderTimeTracking(task);
                this.showMessage('Time tracking stopped!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to stop time tracking', 'error');
            }
        } catch (error) {
            console.error('Stop time tracking error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async resetTimeTracking() {
        if (!this.currentTimeTrackingTaskId) return;

        if (!confirm('Are you sure you want to reset all time tracking data?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentTimeTrackingTaskId}/time/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentTimeTrackingTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.renderTimeTracking(task);
                this.showMessage('Time tracking reset!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to reset time tracking', 'error');
            }
        } catch (error) {
            console.error('Reset time tracking error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showCommentsModal(taskId) {
        this.currentCommentsTaskId = taskId;
        const task = this.tasks.find(t => t._id === taskId);
        
        document.getElementById('commentsTaskTitle').textContent = task.title;
        this.renderComments(task.comments || []);
        document.getElementById('commentsModal').classList.remove('hidden');
    }

    hideCommentsModal() {
        document.getElementById('commentsModal').classList.add('hidden');
        this.currentCommentsTaskId = null;
    }

    renderComments(comments) {
        const container = document.getElementById('commentsList');
        
        if (!comments || comments.length === 0) {
            container.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
            return;
        }

        container.innerHTML = '';
        comments.forEach(comment => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            const formattedDate = new Date(comment.createdAt).toLocaleString();
            const userId = window.authManager.getUserId ? window.authManager.getUserId() : null;
            const isOwnComment = userId && comment.author && comment.author.toString() === userId;
            
            item.innerHTML = `
                <div class="comment-header">
                    <div class="comment-author">User</div>
                    <div class="comment-date">${formattedDate}</div>
                </div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-actions">
                    <div class="comment-reactions">
                        ${this.renderReactions(comment.reactions, comment._id)}
                    </div>
                    ${isOwnComment ? `
                        <button class="comment-action-btn edit" data-comment-id="${comment._id}">Edit</button>
                        <button class="comment-action-btn delete" data-comment-id="${comment._id}">Delete</button>
                    ` : ''}
                    <button class="comment-action-btn reply" data-comment-id="${comment._id}">Reply</button>
                </div>
                ${comment.replies && comment.replies.length > 0 ? `
                    <div class="comment-replies">
                        ${comment.replies.map(reply => this.renderReply(reply)).join('')}
                    </div>
                ` : ''}
            `;
            container.appendChild(item);
        });

        // Add event listeners
        container.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentId = e.target.closest('.reaction-btn').dataset.commentId;
                const emoji = e.target.closest('.reaction-btn').dataset.emoji;
                this.toggleReaction(this.currentCommentsTaskId, commentId, emoji);
            });
        });

        container.querySelectorAll('.comment-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentId = e.target.closest('.comment-action-btn').dataset.commentId;
                this.editComment(commentId);
            });
        });

        container.querySelectorAll('.comment-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentId = e.target.closest('.comment-action-btn').dataset.commentId;
                if (confirm('Are you sure you want to delete this comment?')) {
                    this.deleteComment(commentId);
                }
            });
        });

        container.querySelectorAll('.comment-action-btn.reply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentId = e.target.closest('.comment-action-btn').dataset.commentId;
                this.showReplyInput(commentId);
            });
        });
    }

    renderReactions(reactions, commentId) {
        if (!reactions || reactions.length === 0) return '';
        
        const emojiCounts = {};
        reactions.forEach(r => {
            emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1;
        });

        return Object.entries(emojiCounts).map(([emoji, count]) => `
            <button class="reaction-btn" data-comment-id="${commentId}" data-emoji="${emoji}">
                ${emoji} ${count}
            </button>
        `).join('');
    }

    renderReply(reply) {
        const formattedDate = new Date(reply.createdAt).toLocaleString();
        return `
            <div class="reply-item">
                <div class="reply-header">
                    <div class="reply-author">User</div>
                    <div class="reply-date">${formattedDate}</div>
                </div>
                <div class="reply-text">${reply.text}</div>
            </div>
        `;
    }

    async addComment() {
        if (!this.currentCommentsTaskId) return;

        const text = document.getElementById('commentText').value.trim();

        if (!text) {
            this.showMessage('Please enter a comment', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentCommentsTaskId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentCommentsTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.renderComments(task.comments);
                document.getElementById('commentText').value = '';
                this.showMessage('Comment added successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to add comment', 'error');
            }
        } catch (error) {
            console.error('Add comment error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async editComment(commentId) {
        const task = this.tasks.find(t => t._id === this.currentCommentsTaskId);
        const comment = task.comments.find(c => c._id.toString() === commentId);
        
        const newText = prompt('Edit your comment:', comment.text);
        if (newText === null || !newText.trim()) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentCommentsTaskId}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ text: newText.trim() })
            });

            if (response.ok) {
                const updatedTask = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentCommentsTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = updatedTask;
                    this.renderTasks();
                }
                this.renderComments(updatedTask.comments);
                this.showMessage('Comment updated successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to update comment', 'error');
            }
        } catch (error) {
            console.error('Edit comment error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async deleteComment(commentId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentCommentsTaskId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentCommentsTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.renderComments(task.comments);
                this.showMessage('Comment deleted successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to delete comment', 'error');
            }
        } catch (error) {
            console.error('Delete comment error:', error);
            this.showMessage('Network error. Please try again.', 'error');
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
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.renderComments(task.comments);
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to toggle reaction', 'error');
            }
        } catch (error) {
            console.error('Toggle reaction error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showReplyInput(commentId) {
        const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`).closest('.comment-item');
        let replyInput = commentItem.querySelector('.reply-input');
        
        if (replyInput) {
            replyInput.remove();
            return;
        }

        replyInput = document.createElement('div');
        replyInput.className = 'reply-input';
        replyInput.innerHTML = `
            <textarea class="form-textarea" rows="2" placeholder="Write a reply..."></textarea>
            <button class="btn btn-primary btn-sm" data-comment-id="${commentId}">Reply</button>
        `;
        commentItem.querySelector('.comment-replies').appendChild(replyInput);

        replyInput.querySelector('button').addEventListener('click', () => {
            const text = replyInput.querySelector('textarea').value.trim();
            if (text) {
                this.addReply(commentId, text);
            }
        });
    }

    async addReply(commentId, text) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentCommentsTaskId}/comments/${commentId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentCommentsTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.renderComments(task.comments);
                this.showMessage('Reply added successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to add reply', 'error');
            }
        } catch (error) {
            console.error('Add reply error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async applyAdvancedSearch() {
        const query = document.getElementById('searchQuery').value.trim();
        const status = document.getElementById('filterStatus').value;
        const priority = document.getElementById('filterPriority').value;
        const category = document.getElementById('filterCategory').value;
        const tags = document.getElementById('filterTags').value.trim();
        const startDate = document.getElementById('filterDueDateFrom').value;
        const endDate = document.getElementById('filterDueDateTo').value;
        const sortBy = document.getElementById('filterSortBy').value;
        const sortOrder = document.getElementById('filterSortOrder').value;
        const isPinned = document.getElementById('filterIsPinned').checked;
        const hasReminder = document.getElementById('filterHasReminder').checked;
        const hasDependencies = document.getElementById('filterHasDependencies').checked;
        const hasComments = document.getElementById('filterHasComments').checked;
        const hasAttachments = document.getElementById('filterHasAttachments').checked;

        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (status) params.append('status', status === 'active' ? 'pending' : status);
        if (priority) params.append('priority', priority);
        if (category) params.append('category', category);
        if (tags) params.append('tags', tags);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        if (isPinned) params.append('isPinned', 'true');
        if (hasReminder) params.append('hasReminder', 'true');
        if (hasDependencies) params.append('hasDependencies', 'true');
        if (hasComments) params.append('hasComments', 'true');
        if (hasAttachments) params.append('hasAttachments', 'true');

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/search?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                this.tasks = await response.json();
                this.renderTasks();
                this.hideAdvancedSearchModal();
                this.showMessage(`Found ${this.tasks.length} tasks`, 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Search failed', 'error');
            }
        } catch (error) {
            console.error('Advanced search error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    clearAdvancedSearch() {
        document.getElementById('searchQuery').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterPriority').value = '';
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterTags').value = '';
        document.getElementById('filterDueDateFrom').value = '';
        document.getElementById('filterDueDateTo').value = '';
        document.getElementById('filterSortBy').value = 'createdAt';
        document.getElementById('filterSortOrder').value = 'desc';
        document.getElementById('filterIsPinned').checked = false;
        document.getElementById('filterHasReminder').checked = false;
        document.getElementById('filterHasDependencies').checked = false;
        document.getElementById('filterHasComments').checked = false;
        document.getElementById('filterHasAttachments').checked = false;
    }

    showTagsModal() {
        this.loadTags();
        document.getElementById('tagsModal').classList.remove('hidden');
    }

    hideTagsModal() {
        document.getElementById('tagsModal').classList.add('hidden');
    }

    renderTags() {
        const container = document.getElementById('tagsList');
        
        const tagNames = Object.keys(this.tagColors);
        
        if (tagNames.length === 0) {
            container.innerHTML = '<div class="no-tags">No tags created yet. Create your first tag!</div>';
            return;
        }

        container.innerHTML = '';
        tagNames.forEach(tagName => {
            const color = this.tagColors[tagName];
            const item = document.createElement('div');
            item.className = 'tag-item';
            item.innerHTML = `
                <div class="tag-info">
                    <div class="tag-color-dot" style="background-color: ${color}"></div>
                    <span class="tag-name">${tagName}</span>
                </div>
                <div class="tag-actions">
                    <button class="tag-action-btn edit" data-tag-name="${tagName}" title="Edit Color">
                        <i class="fas fa-palette"></i>
                    </button>
                    <button class="tag-action-btn delete" data-tag-name="${tagName}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(item);
        });

        // Add event listeners
        container.querySelectorAll('.tag-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tagName = e.target.closest('.tag-action-btn').dataset.tagName;
                this.editTagColor(tagName);
            });
        });

        container.querySelectorAll('.tag-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tagName = e.target.closest('.tag-action-btn').dataset.tagName;
                if (confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
                    this.deleteTag(tagName);
                }
            });
        });
    }

    async createTag() {
        const name = document.getElementById('newTagName').value.trim();
        const color = document.getElementById('newTagColor').value;

        if (!name) {
            this.showMessage('Please enter a tag name', 'error');
            return;
        }

        if (this.tagColors[name]) {
            this.showMessage('Tag already exists', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:5002/api/tasks/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ name, color })
            });

            if (response.ok) {
                this.tagColors = await response.json();
                this.renderTags();
                document.getElementById('newTagName').value = '';
                this.showMessage('Tag created successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to create tag', 'error');
            }
        } catch (error) {
            console.error('Create tag error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async editTagColor(tagName) {
        const color = prompt('Enter color (hex code or color name):', this.tagColors[tagName]);
        if (!color) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/tags/${encodeURIComponent(tagName)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ color })
            });

            if (response.ok) {
                this.tagColors = await response.json();
                this.renderTags();
                this.showMessage('Tag color updated!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to update tag', 'error');
            }
        } catch (error) {
            console.error('Edit tag error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async deleteTag(tagName) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/tags/${encodeURIComponent(tagName)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                this.tagColors = await response.json();
                this.renderTags();
                this.showMessage('Tag deleted successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to delete tag', 'error');
            }
        } catch (error) {
            console.error('Delete tag error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    renderTaskTags(tags) {
        if (!tags || tags.length === 0) return '';
        
        return tags.map(tag => {
            const color = this.tagColors[tag] || '#6b7280';
            return `<span class="task-tag" style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}40;">${tag}</span>`;
        }).join('');
    }

    setupDragAndDrop() {
        const taskList = document.getElementById('taskList');
        
        taskList.addEventListener('dragstart', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                this.draggedTask = taskItem;
                taskItem.classList.add('dragging');
                taskList.classList.add('dragging-active');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        taskList.addEventListener('dragend', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                taskItem.classList.remove('dragging');
                taskList.classList.remove('dragging-active');
                document.querySelectorAll('.task-item').forEach(item => {
                    item.classList.remove('drag-over');
                });
            }
        });

        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const taskItem = e.target.closest('.task-item');
            if (taskItem && taskItem !== this.draggedTask) {
                taskItem.classList.add('drag-over');
            }
        });

        taskList.addEventListener('dragleave', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                taskItem.classList.remove('drag-over');
            }
        });

        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            const taskItem = e.target.closest('.task-item');
            if (taskItem && taskItem !== this.draggedTask) {
                this.handleTaskDrop(taskItem);
            }
        });
    }

    async handleTaskDrop(targetTask) {
        if (!this.draggedTask) return;

        const draggedTaskId = this.draggedTask.dataset.taskId;
        const targetTaskId = targetTask.dataset.taskId;

        // Get current task order
        const taskElements = Array.from(document.querySelectorAll('.task-item'));
        const taskIds = taskElements.map(el => el.dataset.taskId);

        // Remove dragged task from its current position
        const draggedIndex = taskIds.indexOf(draggedTaskId);
        taskIds.splice(draggedIndex, 1);

        // Add dragged task to new position
        const targetIndex = taskIds.indexOf(targetTaskId);
        taskIds.splice(targetIndex, 0, draggedTaskId);

        try {
            const response = await fetch('http://localhost:5002/api/tasks/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ taskIds })
            });

            if (response.ok) {
                // Reorder local tasks array
                const reorderedTasks = [];
                taskIds.forEach(id => {
                    const task = this.tasks.find(t => t._id === id);
                    if (task) reorderedTasks.push(task);
                });
                this.tasks = reorderedTasks;
                this.renderTasks();
                this.showMessage('Tasks reordered successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to reorder tasks', 'error');
            }
        } catch (error) {
            console.error('Reorder tasks error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }

        this.draggedTask = null;
    }

    setupQuickActions() {
        // Select all
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAllTasks();
        });

        // Deselect all
        document.getElementById('deselectAllBtn').addEventListener('click', () => {
            this.deselectAllTasks();
        });

        // Bulk complete
        document.getElementById('bulkCompleteBtn').addEventListener('click', () => {
            this.bulkCompleteTasks();
        });

        // Bulk archive
        document.getElementById('bulkArchiveBtn').addEventListener('click', () => {
            this.bulkArchiveTasks();
        });

        // Bulk priority
        document.getElementById('bulkPriorityBtn').addEventListener('click', () => {
            this.showBulkPriorityModal();
        });

        // Bulk category
        document.getElementById('bulkCategoryBtn').addEventListener('click', () => {
            this.showBulkCategoryModal();
        });

        // Bulk due date
        document.getElementById('bulkDueDateBtn').addEventListener('click', () => {
            this.showBulkDueDateModal();
        });

        // Bulk delete
        document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
            this.bulkDeleteTasks();
        });

        // Toggle view
        document.getElementById('toggleViewBtn').addEventListener('click', () => {
            this.toggleView();
        });

        // Refresh
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadTasks();
        });

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.showExportImportModal();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            this.showExportImportModal();
        });

        document.getElementById('closeExportImportModal').addEventListener('click', () => {
            this.hideExportImportModal();
        });

        document.getElementById('performExportBtn').addEventListener('click', () => {
            this.exportTasks();
        });

        document.getElementById('performImportBtn').addEventListener('click', () => {
            this.importTasks();
        });

        // Priorities modal
        document.getElementById('closePrioritiesModal').addEventListener('click', () => {
            this.hidePrioritiesModal();
        });

        document.getElementById('createPriorityBtn').addEventListener('click', () => {
            this.createPriority();
        });

        // Undo/Redo
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redoBtn').addEventListener('click', () => {
            this.redo();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('clearSearchBtn').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('advancedSearchBtn').addEventListener('click', () => {
            this.showAdvancedFiltersModal();
        });

        // Advanced filters modal
        document.getElementById('closeAdvancedFiltersModal').addEventListener('click', () => {
            this.hideAdvancedFiltersModal();
        });

        document.getElementById('applyFiltersBtn').addEventListener('click', () => {
            this.applyAdvancedFilters();
        });

        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearAdvancedFilters();
        });
    }

    updateBulkActionButtons() {
        const hasSelection = this.selectedTasks.size > 0;
        document.getElementById('bulkCompleteBtn').disabled = !hasSelection;
        document.getElementById('bulkArchiveBtn').disabled = !hasSelection;
        document.getElementById('bulkPriorityBtn').disabled = !hasSelection;
        document.getElementById('bulkCategoryBtn').disabled = !hasSelection;
        document.getElementById('bulkDueDateBtn').disabled = !hasSelection;
        document.getElementById('bulkDeleteBtn').disabled = !hasSelection;
    }

    updateBulkActionsToolbar() {
        const toolbar = document.getElementById('bulkActionsToolbar');
        const selectedCount = document.getElementById('selectedCount');
        const selectAllCheckbox = document.getElementById('selectAllTasks');
        
        if (this.selectedTasks.size > 0) {
            toolbar.classList.remove('hidden');
            selectedCount.textContent = `${this.selectedTasks.size} selected`;
            selectAllCheckbox.checked = this.selectedTasks.size === this.tasks.length;
        } else {
            toolbar.classList.add('hidden');
            selectAllCheckbox.checked = false;
        }
    }

    async handleBulkAction(action) {
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        const taskIds = Array.from(this.selectedTasks);
        
        switch(action) {
            case 'complete':
                await this.bulkCompleteSelected(taskIds);
                break;
            case 'favorite':
                await this.bulkFavoriteSelected(taskIds);
                break;
            case 'archive':
                await this.bulkArchiveSelected(taskIds);
                break;
            case 'delete':
                await this.bulkDeleteSelected(taskIds);
                break;
            case 'priority':
                this.showBulkPriorityModal();
                break;
            case 'category':
                this.showBulkCategoryModal();
                break;
            case 'clear':
                this.clearBulkSelection();
                break;
        }
    }

    async bulkCompleteSelected(taskIds) {
        if (!confirm(`Complete ${taskIds.length} selected tasks?`)) return;
        
        const promises = taskIds.map(taskId => this.toggleTask(taskId));
        await Promise.all(promises);
        this.clearBulkSelection();
        this.showMessage('Tasks completed successfully!', 'success');
    }

    async bulkFavoriteSelected(taskIds) {
        const promises = taskIds.map(taskId => this.toggleFavorite(taskId));
        await Promise.all(promises);
        this.clearBulkSelection();
        this.showMessage('Tasks added to favorites!', 'success');
    }

    async bulkArchiveSelected(taskIds) {
        if (!confirm(`Archive ${taskIds.length} selected tasks?`)) return;
        
        const promises = taskIds.map(taskId => this.toggleArchive(taskId));
        await Promise.all(promises);
        this.clearBulkSelection();
        this.showMessage('Tasks archived successfully!', 'success');
    }

    async bulkDeleteSelected(taskIds) {
        if (!confirm(`Delete ${taskIds.length} selected tasks permanently?`)) return;
        
        const promises = taskIds.map(taskId => this.deleteTask(taskId));
        await Promise.all(promises);
        this.clearBulkSelection();
        this.showMessage('Tasks deleted successfully!', 'success');
    }

    clearBulkSelection() {
        this.selectedTasks.clear();
        document.getElementById('selectAllTasks').checked = false;
        this.updateBulkActionsToolbar();
        this.renderTasks();
    }

    selectAllVisibleTasks() {
        const visibleTasks = this.getFilteredTasks();
        visibleTasks.forEach(task => this.selectedTasks.add(task._id));
        this.updateBulkActionsToolbar();
        this.renderTasks();
    }

    async bulkCompleteTasks() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        if (!confirm(`Complete ${this.selectedTasks.size} selected tasks?`)) {
            return;
        }

        const taskIds = Array.from(this.selectedTasks);
        const promises = taskIds.map(taskId => this.updateTask(taskId, { completed: true }));

        try {
            await Promise.all(promises);
            this.selectedTasks.clear();
            this.updateBulkActionButtons();
            this.showMessage('Tasks completed successfully!', 'success');
        } catch (error) {
            console.error('Bulk complete error:', error);
            this.showMessage('Failed to complete tasks', 'error');
        }
    }

    async bulkArchiveTasks() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        if (!confirm(`Archive ${this.selectedTasks.size} selected tasks?`)) {
            return;
        }

        const taskIds = Array.from(this.selectedTasks);
        const promises = taskIds.map(taskId => this.updateTask(taskId, { isArchived: true }));

        try {
            await Promise.all(promises);
            this.selectedTasks.clear();
            this.updateBulkActionButtons();
            this.showMessage('Tasks archived successfully!', 'success');
        } catch (error) {
            console.error('Bulk archive error:', error);
            this.showMessage('Failed to archive tasks', 'error');
        }
    }

    showBulkPriorityModal() {
        document.getElementById('bulkPriorityModal').classList.remove('hidden');
    }

    hideBulkPriorityModal() {
        document.getElementById('bulkPriorityModal').classList.add('hidden');
    }

    async bulkSetPriority() {
        const priority = document.getElementById('bulkPrioritySelect').value;
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        const taskIds = Array.from(this.selectedTasks);
        const promises = taskIds.map(taskId => this.updateTask(taskId, { priority }));

        try {
            await Promise.all(promises);
            this.selectedTasks.clear();
            this.updateBulkActionButtons();
            this.hideBulkPriorityModal();
            this.showMessage('Priority updated successfully!', 'success');
        } catch (error) {
            console.error('Bulk set priority error:', error);
            this.showMessage('Failed to update priority', 'error');
        }
    }

    showBulkCategoryModal() {
        document.getElementById('bulkCategoryModal').classList.remove('hidden');
    }

    hideBulkCategoryModal() {
        document.getElementById('bulkCategoryModal').classList.add('hidden');
    }

    async bulkSetCategory() {
        const category = document.getElementById('bulkCategorySelect').value;
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        const taskIds = Array.from(this.selectedTasks);
        const promises = taskIds.map(taskId => this.updateTask(taskId, { category }));

        try {
            await Promise.all(promises);
            this.selectedTasks.clear();
            this.updateBulkActionButtons();
            this.hideBulkCategoryModal();
            this.showMessage('Category updated successfully!', 'success');
        } catch (error) {
            console.error('Bulk set category error:', error);
            this.showMessage('Failed to update category', 'error');
        }
    }

    showBulkDueDateModal() {
        document.getElementById('bulkDueDateModal').classList.remove('hidden');
    }

    hideBulkDueDateModal() {
        document.getElementById('bulkDueDateModal').classList.add('hidden');
    }

    async bulkSetDueDate() {
        const dueDate = document.getElementById('bulkDueDateInput').value;
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        const taskIds = Array.from(this.selectedTasks);
        const promises = taskIds.map(taskId => this.updateTask(taskId, { dueDate: dueDate || null }));

        try {
            await Promise.all(promises);
            this.selectedTasks.clear();
            this.updateBulkActionButtons();
            this.hideBulkDueDateModal();
            this.showMessage('Due date updated successfully!', 'success');
        } catch (error) {
            console.error('Bulk set due date error:', error);
            this.showMessage('Failed to update due date', 'error');
        }
    }

    async bulkDeleteTasks() {
        if (this.selectedTasks.size === 0) {
            this.showMessage('No tasks selected', 'error');
            return;
        }

        if (!confirm(`Delete ${this.selectedTasks.size} selected tasks permanently?`)) {
            return;
        }

        const taskIds = Array.from(this.selectedTasks);
        const promises = taskIds.map(taskId => this.deleteTask(taskId));

        try {
            await Promise.all(promises);
            this.selectedTasks.clear();
            this.updateBulkActionButtons();
            this.showMessage('Tasks deleted successfully!', 'success');
        } catch (error) {
            console.error('Bulk delete error:', error);
            this.showMessage('Failed to delete tasks', 'error');
        }
    }

    toggleView() {
        const taskList = document.getElementById('taskList');
        const kanbanBoard = document.getElementById('kanbanBoard');
        const calendarView = document.getElementById('calendarView');
        const toggleBtn = document.getElementById('toggleViewBtn');

        if (this.currentView === 'list') {
            this.currentView = 'kanban';
            taskList.classList.add('hidden');
            kanbanBoard.classList.remove('hidden');
            calendarView.classList.add('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-list"></i>';
            this.renderKanban();
        } else if (this.currentView === 'kanban') {
            this.currentView = 'list';
            kanbanBoard.classList.add('hidden');
            calendarView.classList.add('hidden');
            taskList.classList.remove('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-th-large"></i>';
            this.renderTasks();
        } else {
            // From calendar view, go to list view
            this.currentView = 'list';
            kanbanBoard.classList.add('hidden');
            calendarView.classList.add('hidden');
            taskList.classList.remove('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-th-large"></i>';
            this.renderTasks();
        }
    }

    renderKanban() {
        const todoTasks = this.tasks.filter(t => !t.completed);
        const inProgressTasks = this.tasks.filter(t => t.completed === false && t.priority === 'high');
        const doneTasks = this.tasks.filter(t => t.completed);

        document.getElementById('todoCount').textContent = todoTasks.length;
        document.getElementById('inProgressCount').textContent = inProgressTasks.length;
        document.getElementById('doneCount').textContent = doneTasks.length;

        // Render tasks in columns
        this.renderKanbanColumn('todo', todoTasks);
        this.renderKanbanColumn('inProgress', inProgressTasks);
        this.renderKanbanColumn('done', doneTasks);
    }

    renderKanbanColumn(columnId, tasks) {
        const column = document.querySelector(`.kanban-column[data-status="${columnId}"] .kanban-tasks`);
        column.innerHTML = '';

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'kanban-task';
            taskElement.innerHTML = `
                <div class="kanban-task-title">${this.escapeHtml(task.title)}</div>
                <div class="kanban-task-meta">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    ${task.dueDate ? `<span class="due-date">${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                </div>
            `;
            column.appendChild(taskElement);
        });
    }

    showExportImportModal() {
        document.getElementById('exportImportModal').classList.remove('hidden');
    }

    hideExportImportModal() {
        document.getElementById('exportImportModal').classList.add('hidden');
    }

    async exportTasks() {
        const format = document.getElementById('exportFormat').value;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/export?format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
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
                this.showMessage('Tasks exported successfully!', 'success');
                this.hideExportImportModal();
            } else {
                this.showMessage('Failed to export tasks', 'error');
            }
        } catch (error) {
            console.error('Export tasks error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async importTasks() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];

        if (!file) {
            this.showMessage('Please select a file to import', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                let tasks;
                const content = e.target.result;

                if (file.name.endsWith('.json')) {
                    tasks = JSON.parse(content);
                } else if (file.name.endsWith('.csv')) {
                    tasks = this.parseCSV(content);
                } else {
                    this.showMessage('Invalid file format. Use JSON or CSV', 'error');
                    return;
                }

                if (!Array.isArray(tasks)) {
                    this.showMessage('Invalid file format. Tasks must be an array', 'error');
                    return;
                }

                const response = await fetch('http://localhost:5002/api/tasks/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.authManager.getToken()}`
                    },
                    body: JSON.stringify({ tasks, format: file.name.endsWith('.json') ? 'json' : 'csv' })
                });

                if (response.ok) {
                    const result = await response.json();
                    this.showMessage(`Imported ${result.imported} of ${result.total} tasks successfully!`, 'success');
                    if (result.errors.length > 0) {
                        console.warn('Import errors:', result.errors);
                    }
                    this.loadTasks();
                    this.hideExportImportModal();
                } else {
                    const data = await response.json();
                    this.showMessage(data.message || 'Failed to import tasks', 'error');
                }
            } catch (error) {
                console.error('Import tasks error:', error);
                this.showMessage('Failed to parse file. Please check the format.', 'error');
            }
        };

        reader.readAsText(file);
    }

    parseCSV(csvContent) {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
        const tasks = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = this.parseCSVLine(lines[i]);
            const task = {
                title: values[0]?.replace(/"/g, '') || '',
                description: values[1]?.replace(/"/g, '') || '',
                priority: values[2] || 'medium',
                category: values[3] || 'other',
                dueDate: values[4] ? new Date(values[4]) : null,
                completed: values[5] === 'true',
                isFavorite: values[6] === 'true',
                isArchived: values[7] === 'true',
                isPinned: values[8] === 'true',
                tags: values[9] ? values[9].split(',').map(t => t.trim()) : [],
                progress: parseInt(values[10]) || 0,
                colorLabel: values[11] || 'default'
            };

            tasks.push(task);
        }

        return tasks;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    async undo() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/undo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.showMessage(result.message, 'success');
                this.loadTasks();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to undo', 'error');
            }
        } catch (error) {
            console.error('Undo error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async redo() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/redo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.showMessage(result.message, 'success');
                this.loadTasks();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to redo', 'error');
            }
        } catch (error) {
            console.error('Redo error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showPrioritiesModal() {
        this.loadPriorities();
        document.getElementById('prioritiesModal').classList.remove('hidden');
    }

    hidePrioritiesModal() {
        document.getElementById('prioritiesModal').classList.add('hidden');
    }

    async loadPriorities() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/priorities', {
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                this.customPriorities = await response.json();
                this.renderPriorities();
            } else {
                this.showMessage('Failed to load priorities', 'error');
            }
        } catch (error) {
            console.error('Load priorities error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    renderPriorities() {
        const prioritiesList = document.getElementById('prioritiesList');
        prioritiesList.innerHTML = '';

        if (this.customPriorities.length === 0) {
            prioritiesList.innerHTML = '<div class="no-priorities">No custom priorities yet. Create one above!</div>';
            return;
        }

        this.customPriorities.forEach(priority => {
            const priorityItem = document.createElement('div');
            priorityItem.className = 'priority-item';
            priorityItem.innerHTML = `
                <div class="priority-info">
                    <div class="priority-color-dot" style="background-color: ${priority.color}"></div>
                    <span class="priority-name">${this.escapeHtml(priority.name)}</span>
                </div>
                <div class="priority-actions">
                    <button class="priority-action-btn edit" data-priority="${priority.name}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="priority-action-btn delete" data-priority="${priority.name}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            prioritiesList.appendChild(priorityItem);
        });

        // Add event listeners for edit/delete buttons
        prioritiesList.querySelectorAll('.priority-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const priorityName = e.currentTarget.dataset.priority;
                this.editPriority(priorityName);
            });
        });

        prioritiesList.querySelectorAll('.priority-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const priorityName = e.currentTarget.dataset.priority;
                this.deletePriority(priorityName);
            });
        });
    }

    async createPriority() {
        const name = document.getElementById('newPriorityName').value.trim();
        const color = document.getElementById('newPriorityColor').value;

        if (!name) {
            this.showMessage('Please enter a priority name', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:5002/api/tasks/priorities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ name, color })
            });

            if (response.ok) {
                this.customPriorities = await response.json();
                this.renderPriorities();
                this.showMessage('Priority created successfully!', 'success');
                document.getElementById('newPriorityName').value = '';
                document.getElementById('newPriorityColor').value = '#6b7280';
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to create priority', 'error');
            }
        } catch (error) {
            console.error('Create priority error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async editPriority(name) {
        const newColor = prompt('Enter new color (hex code):', '#6b7280');
        if (!newColor) return;

        const newName = prompt('Enter new name (leave blank to keep current):', name);

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/priorities/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ 
                    color: newColor,
                    newName: newName || undefined
                })
            });

            if (response.ok) {
                this.customPriorities = await response.json();
                this.renderPriorities();
                this.showMessage('Priority updated successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to update priority', 'error');
            }
        } catch (error) {
            console.error('Update priority error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async deletePriority(name) {
        if (!confirm(`Are you sure you want to delete the "${name}" priority?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/priorities/${encodeURIComponent(name)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                this.customPriorities = await response.json();
                this.renderPriorities();
                this.showMessage('Priority deleted successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to delete priority', 'error');
            }
        } catch (error) {
            console.error('Delete priority error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        const clearBtn = document.getElementById('clearSearchBtn');
        
        if (this.searchQuery) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }

        this.renderTasks();
    }

    clearSearch() {
        this.searchQuery = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearchBtn').classList.add('hidden');
        this.renderTasks();
    }

    showAdvancedFiltersModal() {
        document.getElementById('advancedFiltersModal').classList.remove('hidden');
    }

    hideAdvancedFiltersModal() {
        document.getElementById('advancedFiltersModal').classList.add('hidden');
    }

    applyAdvancedFilters() {
        this.advancedFilters = {
            priority: document.getElementById('filterPriority').value || null,
            category: document.getElementById('filterCategory').value || null,
            status: document.getElementById('filterStatus').value || null,
            dueDateFrom: document.getElementById('filterDueDateFrom').value || null,
            dueDateTo: document.getElementById('filterDueDateTo').value || null,
            tags: document.getElementById('filterTags').value || null,
            subtasks: document.getElementById('filterSubtasks').value || null,
            attachments: document.getElementById('filterAttachments').value || null,
            dependencies: document.getElementById('filterDependencies').value || null,
            recurring: document.getElementById('filterRecurring').value || null,
            isPinned: document.getElementById('filterIsPinned').checked || null,
            hasReminder: document.getElementById('filterHasReminder').checked || null,
            hasDependencies: document.getElementById('filterHasDependencies').checked || null,
            hasComments: document.getElementById('filterHasComments').checked || null,
            hasAttachments: document.getElementById('filterHasAttachments').checked || null,
            isFavorite: document.getElementById('filterIsFavorite').checked || null,
            isArchived: document.getElementById('filterIsArchived').checked || null,
            hasSubtasks: document.getElementById('filterHasSubtasks').checked || null,
            timeTracking: document.getElementById('filterTimeTracking').checked || null,
            recurring: document.getElementById('filterRecurring').checked || null,
            colorLabel: document.getElementById('filterColorLabel').value || null
        };
        this.renderTasks();
        this.hideAdvancedFiltersModal();
        this.showMessage('Filters applied!', 'success');
    }

    clearAdvancedFilters() {
        this.advancedFilters = {};
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
        document.getElementById('filterIsPinned').checked = false;
        document.getElementById('filterHasReminder').checked = false;
        document.getElementById('filterHasDependencies').checked = false;
        document.getElementById('filterHasComments').checked = false;
        document.getElementById('filterHasAttachments').checked = false;
        document.getElementById('filterIsFavorite').checked = false;
        document.getElementById('filterIsArchived').checked = false;
        document.getElementById('filterHasSubtasks').checked = false;
        document.getElementById('filterTimeTracking').checked = false;
        document.getElementById('filterRecurring').checked = false;
        document.getElementById('filterColorLabel').value = '';
        this.renderTasks();
        this.hideAdvancedFiltersModal();
        this.showMessage('Filters cleared!', 'success');
    }

    setupDragAndDrop() {
        const taskList = document.getElementById('taskList');
        
        taskList.addEventListener('dragstart', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                this.draggedTask = taskItem;
                taskItem.classList.add('dragging');
                taskList.classList.add('dragging-active');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        taskList.addEventListener('dragend', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                taskItem.classList.remove('dragging');
                taskList.classList.remove('dragging-active');
                document.querySelectorAll('.task-item').forEach(item => {
                    item.classList.remove('drag-over');
                });
            }
        });

        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const taskItem = e.target.closest('.task-item');
            if (taskItem && taskItem !== this.draggedTask) {
                taskItem.classList.add('drag-over');
            }
        });

        taskList.addEventListener('dragleave', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                taskItem.classList.remove('drag-over');
            }
        });

        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            const taskItem = e.target.closest('.task-item');
            if (taskItem && taskItem !== this.draggedTask) {
                this.handleTaskDrop(taskItem);
            }
        });
    }

    async setReminder() {
        if (!this.currentReminderTaskId) return;

        const reminderTime = document.getElementById('reminderTime').value;
        const reminderType = document.getElementById('reminderType').value;
        const reminderRepeat = document.getElementById('reminderRepeat').value;
        const reminderMessage = document.getElementById('reminderMessage').value;

        if (!reminderTime) {
            this.showMessage('Please select a reminder time', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentReminderTaskId}/reminder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ reminderTime, reminderType, reminderRepeat, reminderMessage })
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentReminderTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.showMessage('Reminder set successfully!', 'success');
                this.hideReminderModal();
                this.checkReminders();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to set reminder', 'error');
            }
        } catch (error) {
            console.error('Set reminder error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async removeReminder() {
        if (!this.currentReminderTaskId) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentReminderTaskId}/reminder`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentReminderTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.showMessage('Reminder removed successfully!', 'success');
                this.hideReminderModal();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to remove reminder', 'error');
            }
        } catch (error) {
            console.error('Remove reminder error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    setQuickReminder(minutes) {
        const now = new Date();
        const reminderTime = new Date(now.getTime() + minutes * 60000);
        const offset = reminderTime.getTimezoneOffset() * 60000;
        const localISOTime = new Date(reminderTime.getTime() - offset).toISOString().slice(0, 16);
        document.getElementById('reminderTime').value = localISOTime;
    }

    async checkReminders() {
        try {
            const response = await fetch('http://localhost:5002/api/tasks/reminders/check', {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.notifications && data.notifications.length > 0) {
                    data.notifications.forEach(notification => {
                        this.showNotification(notification.title, notification.type);
                    });
                }
            }
        } catch (error) {
            console.error('Check reminders error:', error);
        }
    }

    showNotification(title, type) {
        if (type === 'in-app' || type === 'all') {
            this.showMessage(`🔔 Reminder: ${title}`, 'info');
        }
        // Email and push notifications would be handled by the backend
        // For now, we just show in-app notifications
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

    renderDependenciesList(task) {
        const container = document.getElementById('dependenciesList');
        const dependencies = task.dependencies || [];
        
        if (dependencies.length === 0) {
            container.innerHTML = '<div class="no-dependencies">No dependencies added yet</div>';
            return;
        }

        container.innerHTML = '';
        dependencies.forEach(depId => {
            const depTask = this.tasks.find(t => t._id === depId);
            if (!depTask) return;

            const isCompleted = depTask.completed;
            const statusClass = isCompleted ? 'completed' : 'blocking';
            const statusText = isCompleted ? '✅ Completed' : '🔴 Blocking';

            const item = document.createElement('div');
            item.className = `dependency-item ${statusClass}`;
            item.innerHTML = `
                <div class="dependency-info">
                    <div class="dependency-title">${depTask.title}</div>
                    <div class="dependency-status ${statusClass}">${statusText}</div>
                </div>
                <button class="remove-dependency-btn" data-dependency-id="${depId}">
                    <i class="fas fa-times"></i> Remove
                </button>
            `;
            container.appendChild(item);
        });

        // Add event listeners to remove buttons
        container.querySelectorAll('.remove-dependency-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const depId = e.target.closest('.remove-dependency-btn').dataset.dependencyId;
                this.removeDependency(task._id, depId);
            });
        });
    }

    async addDependency(taskId, dependencyId) {
        if (!dependencyId) {
            this.showMessage('Please select a task', 'error');
            return;
        }

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
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.renderDependenciesList(task);
                document.getElementById('dependencySelect').value = '';
                this.showMessage('Dependency added successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to add dependency', 'error');
            }
        } catch (error) {
            console.error('Add dependency error:', error);
            this.showMessage('Network error. Please try again.', 'error');
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
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.renderDependenciesList(task);
                this.showMessage('Dependency removed successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to remove dependency', 'error');
            }
        } catch (error) {
            console.error('Remove dependency error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async saveNotes() {
        if (!this.currentNotesTaskId) return;

        const editor = document.getElementById('notesEditor');
        const formattedNotes = editor.innerHTML;
        const notes = editor.innerText;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentNotesTaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ notes, formattedNotes })
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === this.currentNotesTaskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.showMessage('Notes saved successfully!', 'success');
                this.hideNotesModal();
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to save notes', 'error');
            }
        } catch (error) {
            console.error('Save notes error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    initNotesToolbar() {
        const toolbar = document.querySelector('.notes-toolbar');
        const editor = document.getElementById('notesEditor');

        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.toolbar-btn');
            if (!btn) return;

            const command = btn.dataset.command;
            const value = btn.dataset.value || null;

            if (command === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else if (command === 'formatBlock') {
                document.execCommand(command, false, value);
            } else {
                document.execCommand(command, false, null);
            }

            editor.focus();
        });
    }

    setupEventListeners() {
        // Voice command button
        document.getElementById('voiceCommandBtn').addEventListener('click', () => {
            this.showVoicePanel();
        });

        document.getElementById('closeVoicePanel').addEventListener('click', () => {
            this.hideVoicePanel();
        });

        // Start/stop voice recognition when clicking the panel
        document.getElementById('voiceCommandPanel').addEventListener('click', (e) => {
            if (e.target.closest('.voice-visualizer')) {
                this.toggleVoiceRecognition();
            }
        });

        // Gamification button
        document.getElementById('gamificationBtn').addEventListener('click', () => {
            this.showGamificationModal();
        });

        document.getElementById('closeGamificationModal').addEventListener('click', () => {
            this.hideGamificationModal();
        });

        // Export/Import button
        document.getElementById('exportImportBtn').addEventListener('click', () => {
            this.showExportImportModal();
        });

        document.getElementById('closeExportImportModal').addEventListener('click', () => {
            this.hideExportImportModal();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportTasks();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            this.importTasks();
        });

        // Export/Import tabs
        document.querySelectorAll('.export-import-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.closest('.export-import-tab').dataset.tab;
                
                // Update active tab
                document.querySelectorAll('.export-import-tab').forEach(t => t.classList.remove('active'));
                e.target.closest('.export-import-tab').classList.add('active');
                
                // Update content
                document.querySelectorAll('.export-import-tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`${tabName}Tab`).classList.add('active');
            });
        });

        // AI Suggestions button
        document.getElementById('aiSuggestionsBtn').addEventListener('click', () => {
            this.showAiSuggestionsModal();
        });

        document.getElementById('closeAiSuggestionsModal').addEventListener('click', () => {
            this.hideAiSuggestionsModal();
        });

        // AI Suggestions tabs
        document.querySelectorAll('.ai-suggestions-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.closest('.ai-suggestions-tab').dataset.tab;
                
                // Update active tab
                document.querySelectorAll('.ai-suggestions-tab').forEach(t => t.classList.remove('active'));
                e.target.closest('.ai-suggestions-tab').classList.add('active');
                
                // Update content
                document.querySelectorAll('.ai-suggestions-tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`${tabName}Tab`).classList.add('active');
            });
        });

        // Analytics button
        document.getElementById('analyticsBtn').addEventListener('click', () => {
            this.showAnalyticsModal();
        });

        document.getElementById('closeAnalyticsModal').addEventListener('click', () => {
            this.hideAnalyticsModal();
        });

        // Notification bell button
        document.getElementById('notificationBellBtn').addEventListener('click', () => {
            this.showNotificationCenter();
        });

        document.getElementById('closeNotificationCenter').addEventListener('click', () => {
            this.hideNotificationCenter();
        });

        document.getElementById('markAllReadBtn').addEventListener('click', () => {
            this.markAllNotificationsRead();
        });

        document.getElementById('clearAllNotificationsBtn').addEventListener('click', () => {
            this.clearAllNotifications();
        });

        // Progress input
        document.getElementById('taskProgress').addEventListener('input', (e) => {
            document.getElementById('progressValue').textContent = e.target.value + '%';
        });

        document.getElementById('editTaskProgress').addEventListener('input', (e) => {
            document.getElementById('editProgressValue').textContent = e.target.value + '%';
        });

        // Keyboard shortcuts button
        document.getElementById('keyboardShortcutsBtn').addEventListener('click', () => {
            this.showKeyboardShortcutsModal();
        });

        // Statistics button
        document.getElementById('statisticsBtn').addEventListener('click', () => {
            this.showStatisticsModal();
        });

        // Templates button
        document.getElementById('templatesBtn').addEventListener('click', () => {
            this.showTemplatesModal();
        });

        // Calendar view button
        document.getElementById('calendarViewBtn').addEventListener('click', () => {
            this.showCalendarView();
        });

        // Calendar navigation
        document.getElementById('prevMonthBtn').addEventListener('click', () => {
            this.navigateMonth('prev');
        });

        document.getElementById('nextMonthBtn').addEventListener('click', () => {
            this.navigateMonth('next');
        });

        document.getElementById('todayBtn').addEventListener('click', () => {
            this.goToToday();
        });

        // Tags button
        document.getElementById('tagsBtn').addEventListener('click', () => {
            this.showTagsModal();
        });

        // Priorities button
        document.getElementById('prioritiesBtn').addEventListener('click', () => {
            this.showPrioritiesModal();
        });

        // Close keyboard shortcuts modal
        document.querySelector('[data-action="close-keyboard-shortcuts"]').addEventListener('click', () => {
            this.hideKeyboardShortcutsModal();
        });

        // Close statistics modal
        document.querySelector('[data-action="close-statistics"]').addEventListener('click', () => {
            this.hideStatisticsModal();
        });

        // Close templates modal
        document.getElementById('closeTemplatesModal').addEventListener('click', () => {
            this.hideTemplatesModal();
        });

        // Create template button
        document.getElementById('createTemplateBtn').addEventListener('click', () => {
            this.createTemplate();
        });

        // Template category filter
        document.getElementById('templateCategoryFilter').addEventListener('change', () => {
            this.renderTemplatesList();
        });

        // Template preview modal
        document.querySelector('[data-action="close-template-preview"]').addEventListener('click', () => {
            this.hideTemplatePreview();
        });

        document.getElementById('applyTemplateBtn').addEventListener('click', () => {
            this.applyTemplate();
        });

        document.getElementById('cancelTemplatePreviewBtn').addEventListener('click', () => {
            this.hideTemplatePreview();
        });

        // Bulk actions toolbar
        document.getElementById('selectAllTasks').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectAllVisibleTasks();
            } else {
                this.clearBulkSelection();
            }
        });

        document.querySelectorAll('.bulk-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.bulk-action-btn').dataset.action;
                this.handleBulkAction(action);
            });
        });

        // Tags modal
        document.querySelector('[data-action="close-tags"]').addEventListener('click', () => {
            this.hideTagsModal();
        });

        document.getElementById('createTagBtn').addEventListener('click', () => {
            this.createTag();
        });

        // Dependencies modal
        document.querySelector('[data-action="close-dependencies"]').addEventListener('click', () => {
            this.hideDependenciesModal();
        });

        document.getElementById('addDependencyBtn').addEventListener('click', () => {
            const dependencyId = document.getElementById('dependencySelect').value;
            this.addDependency(this.currentDependenciesTaskId, dependencyId);
        });

        // Dependency graph
        document.getElementById('viewDependencyGraphBtn').addEventListener('click', () => {
            this.showDependencyGraph();
        });

        document.getElementById('closeDependencyGraphModal').addEventListener('click', () => {
            this.hideDependencyGraph();
        });

        document.getElementById('resetGraphViewBtn').addEventListener('click', () => {
            this.resetGraphView();
        });

        document.getElementById('fitGraphBtn').addEventListener('click', () => {
            this.fitGraphToScreen();
        });

        // Bulk priority modal
        document.getElementById('closeBulkPriorityModal').addEventListener('click', () => {
            this.hideBulkPriorityModal();
        });

        document.getElementById('applyBulkPriorityBtn').addEventListener('click', () => {
            this.bulkSetPriority();
        });

        document.getElementById('cancelBulkPriorityBtn').addEventListener('click', () => {
            this.hideBulkPriorityModal();
        });

        // Bulk category modal
        document.getElementById('closeBulkCategoryModal').addEventListener('click', () => {
            this.hideBulkCategoryModal();
        });

        document.getElementById('applyBulkCategoryBtn').addEventListener('click', () => {
            this.bulkSetCategory();
        });

        document.getElementById('cancelBulkCategoryBtn').addEventListener('click', () => {
            this.hideBulkCategoryModal();
        });

        // Bulk due date modal
        document.getElementById('closeBulkDueDateModal').addEventListener('click', () => {
            this.hideBulkDueDateModal();
        });

        document.getElementById('applyBulkDueDateBtn').addEventListener('click', () => {
            this.bulkSetDueDate();
        });

        document.getElementById('cancelBulkDueDateBtn').addEventListener('click', () => {
            this.hideBulkDueDateModal();
        });

        // Activity history modal
        document.getElementById('closeActivityHistoryModal').addEventListener('click', () => {
            this.hideActivityHistory();
        });

        // Reminder modal
        document.querySelector('[data-action="close-reminder"]').addEventListener('click', () => {
            this.hideReminderModal();
        });

        document.getElementById('setReminderBtn').addEventListener('click', () => {
            this.setReminder();
        });

        document.getElementById('removeReminderBtn').addEventListener('click', () => {
            this.removeReminder();
        });

        // Quick reminder options
        document.querySelectorAll('.reminder-quick-options .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.closest('.btn').dataset.minutes);
                this.setQuickReminder(minutes);
            });
        });

        // Add multiple reminder button
        document.getElementById('addMultipleReminderBtn').addEventListener('click', () => {
            this.addMultipleReminder();
        });

        // Time tracking modal
        document.querySelector('[data-action="close-time-tracking"]').addEventListener('click', () => {
            this.hideTimeTrackingModal();
        });

        document.getElementById('startTimeBtn').addEventListener('click', () => {
            this.startTimeTracking();
        });

        document.getElementById('stopTimeBtn').addEventListener('click', () => {
            this.stopTimeTracking();
        });

        document.getElementById('resetTimeBtn').addEventListener('click', () => {
            this.resetTimeTracking();
        });

        // Comments modal
        document.querySelector('[data-action="close-comments"]').addEventListener('click', () => {
            this.hideCommentsModal();
        });

        document.getElementById('addCommentBtn').addEventListener('click', () => {
            this.addComment();
        });

        // Advanced search modal
        document.getElementById('closeAdvancedSearchModal').addEventListener('click', () => {
            this.hideAdvancedSearchModal();
        });

        document.getElementById('applyFiltersBtn').addEventListener('click', () => {
            this.applyAdvancedSearch();
        });

        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearAdvancedSearch();
        });

        // Notes modal
        document.querySelector('[data-action="close-notes"]').addEventListener('click', () => {
            this.hideNotesModal();
        });

        document.getElementById('saveNotesBtn').addEventListener('click', () => {
            this.saveNotes();
        });

        document.getElementById('cancelNotesBtn').addEventListener('click', () => {
            this.hideNotesModal();
        });

        // Initialize notes toolbar
        this.initNotesToolbar();

        // Subtask buttons
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

        document.getElementById('addShareUserBtn').addEventListener('click', () => {
            this.shareTask();
        });

        document.getElementById('generateShareLinkBtn').addEventListener('click', () => {
            this.generateShareLink();
        });

        document.getElementById('copyShareLinkBtn').addEventListener('click', () => {
            this.copyShareLink();
        });

        document.getElementById('linkExpiry').addEventListener('change', (e) => {
            document.getElementById('linkExpiryDate').style.display = e.target.checked ? 'block' : 'none';
        });

        // Share tabs
        document.querySelectorAll('.share-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.closest('.share-tab').dataset.tab;
                
                // Update active tab
                document.querySelectorAll('.share-tab').forEach(t => t.classList.remove('active'));
                e.target.closest('.share-tab').classList.add('active');
                
                // Update content
                document.querySelectorAll('.share-tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`${tabName}Tab`).classList.add('active');
            });
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

        document.getElementById('timeReportDateRange').addEventListener('change', () => {
            this.loadTimeReport();
        });

        document.getElementById('exportTimeReportBtn').addEventListener('click', () => {
            this.exportTimeReport();
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

        // Initialize task history modal
        this.initTaskHistoryModal();
    }

    initTaskHistoryModal() {
        document.getElementById('closeTaskHistoryModal').addEventListener('click', () => {
            this.hideTaskHistoryModal();
        });
    }

    async showTaskHistoryModal(taskId) {
        this.currentHistoryTaskId = taskId;
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/history`, {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const history = await response.json();
                this.renderTaskHistory(history);
                document.getElementById('taskHistoryModal').classList.remove('hidden');
            } else {
                this.showMessage('Failed to load task history', 'error');
            }
        } catch (error) {
            console.error('Load task history error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    hideTaskHistoryModal() {
        document.getElementById('taskHistoryModal').classList.add('hidden');
        this.currentHistoryTaskId = null;
    }

    renderTaskHistory(history) {
        const historyList = document.getElementById('taskHistoryList');
        
        if (!history || history.length === 0) {
            historyList.innerHTML = `
                <div class="task-history-empty">
                    <i class="fas fa-history"></i>
                    <p>No history available</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = history.map(entry => {
            const iconClass = this.getHistoryIconClass(entry.action);
            const icon = this.getHistoryIcon(entry.action);
            const timestamp = new Date(entry.timestamp).toLocaleString();
            
            return `
                <div class="task-history-item">
                    <div class="task-history-icon ${iconClass}">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <div class="task-history-content">
                        <div class="task-history-action">${this.formatAction(entry.action)}</div>
                        <div class="task-history-description">${entry.description}</div>
                        <div class="task-history-timestamp">${timestamp}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getHistoryIconClass(action) {
        const iconMap = {
            'task_created': 'created',
            'task_updated': 'updated',
            'task_toggled': 'completed',
            'task_archived': 'archived',
            'task_favorited': 'favorited'
        };
        return iconMap[action] || '';
    }

    getHistoryIcon(action) {
        const iconMap = {
            'task_created': 'plus',
            'task_updated': 'edit',
            'task_toggled': 'check',
            'task_archived': 'archive',
            'task_favorited': 'star'
        };
        return iconMap[action] || 'clock';
    }

    formatAction(action) {
        const actionMap = {
            'task_created': 'Task Created',
            'task_updated': 'Task Updated',
            'task_toggled': 'Status Changed',
            'task_archived': 'Archive Changed',
            'task_favorited': 'Favorite Changed'
        };
        return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    async scheduleReminder(taskId, time, type) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/reminder/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ time, type })
            });

            if (response.ok) {
                await this.loadTasks();
                this.showMessage('Reminder scheduled successfully!', 'success');
            } else {
                this.showMessage('Failed to schedule reminder', 'error');
            }
        } catch (error) {
            console.error('Schedule reminder error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async sendReminder(taskId, type) {
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
                await this.loadTasks();
                this.showMessage('Reminder sent successfully!', 'success');
            } else {
                this.showMessage('Failed to send reminder', 'error');
            }
        } catch (error) {
            console.error('Send reminder error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
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
                await this.loadTasks();
                this.showMessage('Dependency added successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to add dependency', 'error');
            }
        } catch (error) {
            console.error('Add dependency error:', error);
            this.showMessage('Network error. Please try again.', 'error');
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
                await this.loadTasks();
                this.showMessage('Dependency removed successfully!', 'success');
            } else {
                this.showMessage('Failed to remove dependency', 'error');
            }
        } catch (error) {
            console.error('Remove dependency error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async checkDependencyStatus(taskId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/dependencies/status`, {
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Check dependency status error:', error);
            return null;
        }
    }

    renderDependencies(task) {
        if (!task.dependencies || task.dependencies.length === 0) return '';

        const dependenciesHtml = task.dependencies.map(dep => {
            const isCompleted = dep.completed;
            const statusClass = isCompleted ? 'completed' : 'pending';
            const statusIcon = isCompleted ? '✓' : '○';
            return `
                <span class="task-dependency-badge ${statusClass}">
                    ${statusIcon} ${this.escapeHtml(dep.title)}
                </span>
            `;
        }).join('');

        return `
            <div class="task-dependencies">
                <div class="task-dependencies-header">
                    <i class="fas fa-link"></i>
                    <span>Dependencies (${task.dependencies.length})</span>
                </div>
                <div class="task-dependencies-list">
                    ${dependenciesHtml}
                </div>
            </div>
        `;
    }

    renderProgressBar(task) {
        const progress = task.progress || 0;
        const colorClass = progress === 100 ? 'completed' : progress >= 50 ? 'half' : 'low';
        
        return `
            <div class="task-progress">
                <div class="task-progress-bar">
                    <div class="task-progress-fill ${colorClass}" style="width: ${progress}%"></div>
                </div>
                <div class="task-progress-label">
                    <span>Progress</span>
                    <span>${progress}%</span>
                </div>
            </div>
        `;
    }

    async createTemplate(taskId, templateName) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/create-template`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ templateName })
            });

            if (response.ok) {
                this.showMessage('Template created successfully!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to create template', 'error');
            }
        } catch (error) {
            console.error('Create template error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async togglePin(taskId) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/pin`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                }
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.showMessage(task.isPinned ? 'Task pinned!' : 'Task unpinned!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to pin task', 'error');
            }
        } catch (error) {
            console.error('Toggle pin error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showColorPicker(taskId) {
        const colors = [
            { value: 'default', label: 'Default', emoji: '⚪' },
            { value: 'red', label: 'Red', emoji: '🔴' },
            { value: 'orange', label: 'Orange', emoji: '🟠' },
            { value: 'yellow', label: 'Yellow', emoji: '🟡' },
            { value: 'green', label: 'Green', emoji: '🟢' },
            { value: 'blue', label: 'Blue', emoji: '🔵' },
            { value: 'purple', label: 'Purple', emoji: '🟣' },
            { value: 'pink', label: 'Pink', emoji: '🩷' }
        ];

        const colorOptions = colors.map(c => `${c.emoji} ${c.label}`).join('\n');
        const selectedIndex = prompt(`Select a color:\n\n${colorOptions}\n\nEnter number (1-8):`);

        if (selectedIndex !== null) {
            const index = parseInt(selectedIndex) - 1;
            if (index >= 0 && index < colors.length) {
                this.updateColorLabel(taskId, colors[index].value);
            } else {
                this.showMessage('Invalid selection', 'error');
            }
        }
    }

    async updateColorLabel(taskId, colorLabel) {
        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/color-label`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ colorLabel })
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.showMessage('Color label updated!', 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to update color', 'error');
            }
        } catch (error) {
            console.error('Update color label error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async snoozeTask(taskId) {
        const minutes = prompt('Snooze for how many minutes? (e.g., 15, 30, 60)');
        if (minutes === null) return;

        const minutesNum = parseInt(minutes);
        if (isNaN(minutesNum) || minutesNum < 1) {
            this.showMessage('Please enter a valid number', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/snooze`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ minutes: minutesNum })
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.showMessage(`Task snoozed for ${minutesNum} minutes!`, 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to snooze task', 'error');
            }
        } catch (error) {
            console.error('Snooze task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async postponeTask(taskId) {
        const days = prompt('Postpone for how many days? (e.g., 1, 2, 7)');
        if (days === null) return;

        const daysNum = parseInt(days);
        if (isNaN(daysNum) || daysNum < 1) {
            this.showMessage('Please enter a valid number', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${taskId}/postpone`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ days: daysNum })
            });

            if (response.ok) {
                const task = await response.json();
                const taskIndex = this.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    this.tasks[taskIndex] = task;
                    this.renderTasks();
                }
                this.showMessage(`Task postponed by ${daysNum} days!`, 'success');
            } else {
                const data = await response.json();
                this.showMessage(data.message || 'Failed to postpone task', 'error');
            }
        } catch (error) {
            console.error('Postpone task error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
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
            if (!e.target.closest('#quickActionsDropdown') && !e.target.closest('.quick-actions-btn')) {
                this.hideQuickActionsDropdown();
            }
        });

        // Quick actions dropdown clicks
        document.getElementById('quickActionsDropdown').addEventListener('click', (e) => {
            const action = e.target.closest('.quick-actions-item')?.dataset.action;
            if (action) {
                this.handleQuickActionsDropdown(action);
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

    showQuickActionsDropdown(taskId, x, y) {
        this.contextMenuTaskId = taskId;
        const dropdown = document.getElementById('quickActionsDropdown');
        dropdown.classList.remove('hidden');
        
        // Position dropdown
        const dropdownWidth = 180;
        const dropdownHeight = 200;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let finalX = x;
        let finalY = y;
        
        if (x + dropdownWidth > windowWidth) {
            finalX = windowWidth - dropdownWidth - 10;
        }
        
        if (y + dropdownHeight > windowHeight) {
            finalY = windowHeight - dropdownHeight - 10;
        }
        
        dropdown.style.left = `${finalX}px`;
        dropdown.style.top = `${finalY}px`;
    }

    hideQuickActionsDropdown() {
        document.getElementById('quickActionsDropdown').classList.add('hidden');
        this.contextMenuTaskId = null;
    }

    async handleQuickActionsDropdown(action) {
        if (!this.contextMenuTaskId) return;

        switch (action) {
            case 'complete':
                await this.toggleTask(this.contextMenuTaskId);
                break;
            case 'favorite':
                await this.toggleFavorite(this.contextMenuTaskId);
                break;
            case 'archive':
                await this.toggleArchive(this.contextMenuTaskId);
                break;
            case 'edit':
                this.editTask(this.contextMenuTaskId);
                break;
            case 'duplicate':
                await this.duplicateTask(this.contextMenuTaskId);
                break;
            case 'delete':
                await this.deleteTask(this.contextMenuTaskId);
                break;
        }
        this.hideQuickActionsDropdown();
    }

    async handleContextMenuAction(action) {
        if (!this.contextMenuTaskId) return;

        switch (action) {
            case 'duplicate':
                await this.duplicateTask(this.contextMenuTaskId);
                break;
            case 'create-template':
                const templateName = prompt('Enter template name:');
                if (templateName) {
                    await this.createTemplate(this.contextMenuTaskId, templateName);
                }
                break;
            case 'pin':
                await this.togglePin(this.contextMenuTaskId);
                break;
            case 'set-color':
                this.showColorPicker(this.contextMenuTaskId);
                break;
            case 'snooze':
                this.snoozeTask(this.contextMenuTaskId);
                break;
            case 'postpone':
                this.postponeTask(this.contextMenuTaskId);
                break;
            case 'reminder':
                this.showReminderModal(this.contextMenuTaskId);
                break;
            case 'time-tracking':
                this.showTimeTrackingModal(this.contextMenuTaskId);
                break;
            case 'comments':
                this.showCommentsModal(this.contextMenuTaskId);
                break;
            case 'notes':
                this.showNotesModal(this.contextMenuTaskId);
                break;
            case 'dependencies':
                this.showDependenciesModal(this.contextMenuTaskId);
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
            case 'add-dependency':
                const depId = prompt('Enter dependency task ID:');
                if (depId) {
                    await this.addDependency(this.contextMenuTaskId, depId);
                }
                break;
            case 'schedule-reminder':
                const reminderTime = prompt('Enter reminder time (YYYY-MM-DDTHH:MM):');
                if (reminderTime) {
                    const reminderType = prompt('Enter reminder type (in-app, email, sms, all):', 'in-app');
                    await this.scheduleReminder(this.contextMenuTaskId, reminderTime, reminderType);
                }
                break;
            case 'send-reminder':
                const sendType = prompt('Enter reminder type (in-app, email, sms):', 'in-app');
                if (sendType) {
                    await this.sendReminder(this.contextMenuTaskId, sendType);
                }
                break;
            case 'view-history':
                await this.showTaskHistoryModal(this.contextMenuTaskId);
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

        // Collect progress
        const progress = parseInt(document.getElementById('taskProgress').value) || 0;

        // Collect color label
        const colorLabel = document.getElementById('taskColorLabel').value;

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
                body: JSON.stringify({ title, description, priority, dueDate: dueDate || null, category, notes, subtasks, reminder, tags, timeTracking, dependencies, isTemplate, templateName, recurring, progress, colorLabel })
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

        // Collect progress
        const progress = parseInt(document.getElementById('editTaskProgress').value) || 0;

        // Collect color label
        const colorLabel = document.getElementById('editTaskColorLabel').value;

        if (!title) {
            this.showMessage('Task title is required', 'error');
            return;
        }

        await this.updateTask(this.currentEditTaskId, { title, description, priority, dueDate: dueDate || null, category, notes, subtasks, reminder, tags, timeTracking, dependencies, recurring, progress, colorLabel });
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
                
                // New checkbox filters
                if (this.advancedFilters.isPinned && !task.isPinned) return false;
                if (this.advancedFilters.hasReminder && (!task.reminder || !task.reminder.enabled)) return false;
                if (this.advancedFilters.hasDependencies && (!task.dependencies || task.dependencies.length === 0)) return false;
                if (this.advancedFilters.hasComments && (!task.comments || task.comments.length === 0)) return false;
                if (this.advancedFilters.hasAttachments && (!task.attachments || task.attachments.length === 0)) return false;
                if (this.advancedFilters.isFavorite && !task.isFavorite) return false;
                if (this.advancedFilters.isArchived && !task.isArchived) return false;
                if (this.advancedFilters.hasSubtasks && (!task.subtasks || task.subtasks.length === 0)) return false;
                if (this.advancedFilters.timeTracking && (!task.timeTracking || !task.timeTracking.enabled)) return false;
                if (this.advancedFilters.recurring && (!task.recurring || !task.recurring.enabled)) return false;
                if (this.advancedFilters.colorLabel && task.colorLabel !== this.advancedFilters.colorLabel) return false;
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
            const colorClass = task.colorLabel && task.colorLabel !== 'default' ? `color-${task.colorLabel}` : '';
            taskElement.className = `task-item ${task.completed ? 'completed' : ''} ${task.isPinned ? 'task-pinned' : ''} ${colorClass} ${this.selectedTasks.has(task._id) ? 'bulk-selected' : ''}`;
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
                    ${task.tags && task.tags.length > 0 ? `<div class="task-tags">${this.renderTaskTags(task.tags)}</div>` : ''}
                    ${this.renderDependencies(task)}
                    ${task.formattedNotes ? `<div class="task-notes"><i class="fas fa-sticky-note"></i> ${task.formattedNotes}</div>` : ''}
                    ${this.renderSubtasksDisplay(task.subtasks)}
                    ${this.renderProgressBar(task)}
                    ${this.renderReminderBadge(task.reminder)}
                    ${this.renderTimeTracking(task.timeTracking, task._id)}
                    ${this.renderAttachmentsDisplay(task.attachments)}
                    ${this.renderRecurringBadge(task.recurring)}
                    ${this.getDueDateBadge(task.dueDate)}
                </div>
                <div class="task-meta">
                    <div class="task-date">Created: ${new Date(task.createdAt).toLocaleDateString()}</div>
                    <div class="task-actions">
                        <button class="btn btn-outline btn-sm quick-actions-btn" data-action="quick-actions" data-task-id="${task._id}">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
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
                e.stopPropagation();
                this.toggleTaskSelection(bulkSelect);
                this.updateBulkActionsToolbar();
                return;
            }
            
            const timerTaskId = taskItem?.dataset.taskId;

            // Handle timer actions
            if (action && action.startsWith('timer')) {
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

            // Handle quick actions button
            if (action === 'quick-actions' && timerTaskId) {
                const rect = e.target.getBoundingClientRect();
                this.showQuickActionsDropdown(timerTaskId, rect.left, rect.bottom);
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
                    this.showActivityHistory(taskId);
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
        document.getElementById('sharePermission').value = 'view';
        document.getElementById('shareLink').value = '';
        this.renderSharedUsers(task);
        this.renderShareActivity(task);
        document.getElementById('shareModal').classList.remove('hidden');
    }

    hideShareModal() {
        document.getElementById('shareModal').classList.add('hidden');
        this.currentShareTaskId = null;
    }

    async shareTask() {
        const email = document.getElementById('shareEmail').value.trim();
        const permission = document.getElementById('sharePermission').value;
        
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
                body: JSON.stringify({ email, permission })
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

    async removeShare(userId) {
        if (!this.currentShareTaskId) return;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentShareTaskId}/share/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const task = this.tasks.find(t => t._id === this.currentShareTaskId);
                if (task) {
                    this.renderSharedUsers(task);
                }
                this.showMessage('Share removed successfully!', 'success');
            } else {
                this.showMessage('Failed to remove share', 'error');
            }
        } catch (error) {
            console.error('Remove share error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    renderSharedUsers(task) {
        const container = document.getElementById('sharedUsersList');
        container.innerHTML = '';

        if (!task.sharedWith || task.sharedWith.length === 0) {
            container.innerHTML = '<div class="no-shared-users"><p>No users have access yet</p></div>';
            return;
        }

        task.sharedWith.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'shared-user-item';
            userItem.innerHTML = `
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-info">
                    <div class="user-email">${this.escapeHtml(user.email)}</div>
                    <div class="user-permission permission-${user.permission}">${this.getPermissionLabel(user.permission)}</div>
                </div>
                <button class="btn btn-icon btn-sm remove-share-btn" data-user-id="${user.userId}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(userItem);
        });

        // Add event listeners for remove buttons
        container.querySelectorAll('.remove-share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.remove-share-btn').dataset.userId;
                this.removeShare(userId);
            });
        });
    }

    getPermissionLabel(permission) {
        const labels = {
            'view': 'Can View',
            'edit': 'Can Edit',
            'admin': 'Admin'
        };
        return labels[permission] || 'Can View';
    }

    renderShareActivity(task) {
        const container = document.getElementById('shareActivityLog');
        container.innerHTML = '';

        if (!task.shareActivity || task.shareActivity.length === 0) {
            container.innerHTML = '<div class="no-activity"><p>No share activity yet</p></div>';
            return;
        }

        task.shareActivity.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'share-activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${this.getActivityIcon(activity.action)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${this.escapeHtml(activity.message)}</div>
                    <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                </div>
            `;
            container.appendChild(activityItem);
        });
    }

    getActivityIcon(action) {
        const icons = {
            'shared': 'fa-share',
            'removed': 'fa-user-minus',
            'permission-changed': 'fa-user-shield',
            'link-generated': 'fa-link',
            'link-accessed': 'fa-external-link-alt'
        };
        return icons[action] || 'fa-info-circle';
    }

    async generateShareLink() {
        if (!this.currentShareTaskId) return;

        const allowEdit = document.getElementById('allowLinkEdit').checked;
        const linkExpiry = document.getElementById('linkExpiry').checked;
        const expiryDate = linkExpiry ? document.getElementById('linkExpiryDate').value : null;

        try {
            const response = await fetch(`http://localhost:5002/api/tasks/${this.currentShareTaskId}/share-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: JSON.stringify({ allowEdit, expiryDate })
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('shareLink').value = data.shareLink;
                this.showMessage('Share link generated!', 'success');
            } else {
                this.showMessage('Failed to generate share link', 'error');
            }
        } catch (error) {
            console.error('Generate share link error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    copyShareLink() {
        const shareLink = document.getElementById('shareLink').value;
        if (!shareLink) {
            this.showMessage('No share link to copy', 'error');
            return;
        }

        navigator.clipboard.writeText(shareLink).then(() => {
            this.showMessage('Link copied to clipboard!', 'success');
        }).catch(() => {
            this.showMessage('Failed to copy link', 'error');
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
                this.loadTags(); // Load tag colors for rendering
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
            const dateRange = document.getElementById('timeReportDateRange').value;
            const response = await fetch(`http://localhost:5002/api/tasks/time/report?range=${dateRange}`, {
                headers: { 'Authorization': `Bearer ${window.authManager.getToken()}` }
            });

            if (response.ok) {
                const report = await response.json();
                this.renderTimeReport(report);
                this.renderTimeCharts(report);
            }
        } catch (error) {
            console.error('Load time report error:', error);
            this.showMessage('Failed to load time report', 'error');
        }
    }

    renderTimeReport(report) {
        document.getElementById('totalTasksTracked').textContent = report.totalTasks || 0;
        
        const hours = Math.floor(report.totalMinutes / 60);
        const minutes = report.totalMinutes % 60;
        document.getElementById('totalTimeReport').textContent = `${hours}h ${minutes}m`;

        // Calculate average time per task
        const avgMinutes = report.totalTasks > 0 ? Math.round(report.totalMinutes / report.totalTasks) : 0;
        const avgHours = Math.floor(avgMinutes / 60);
        const avgMins = avgMinutes % 60;
        document.getElementById('avgTimePerTask').textContent = `${avgHours}h ${avgMins}m`;

        // Calculate productivity score (based on tasks completed vs time spent)
        const productivityScore = this.calculateProductivityScore(report);
        document.getElementById('productivityScore').textContent = `${productivityScore}%`;

        const timeReportTasks = document.getElementById('timeReportTasks');
        timeReportTasks.innerHTML = '';

        if (!report.tasks || report.tasks.length === 0) {
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
                <div class="time-report-task-header">
                    <div class="time-report-task-title">${this.escapeHtml(task.title)}</div>
                    <div class="time-report-task-time">${taskHours}h ${taskMinutes}m</div>
                </div>
                <div class="time-report-task-meta">
                    <span class="task-category-badge">${task.category || 'other'}</span>
                    <span class="task-entries-count">${entriesCount} entries</span>
                    ${task.completed ? '<span class="task-status-badge completed">✓ Completed</span>' : '<span class="task-status-badge pending">Pending</span>'}
                </div>
            `;
            timeReportTasks.appendChild(taskItem);
        });
    }

    calculateProductivityScore(report) {
        if (!report.tasks || report.tasks.length === 0) return 0;
        
        const completedTasks = report.tasks.filter(t => t.completed).length;
        const totalTasks = report.tasks.length;
        const completionRate = (completedTasks / totalTasks) * 100;
        
        // Factor in time efficiency (tasks completed per hour)
        const totalHours = report.totalMinutes / 60;
        const tasksPerHour = totalHours > 0 ? completedTasks / totalHours : 0;
        const efficiencyScore = Math.min(tasksPerHour * 20, 100); // Cap at 100
        
        // Weighted average
        const score = (completionRate * 0.6) + (efficiencyScore * 0.4);
        return Math.round(score);
    }

    renderTimeCharts(report) {
        this.renderDailyActivityChart(report);
        this.renderCategoryTimeChart(report);
    }

    renderDailyActivityChart(report) {
        const canvas = document.getElementById('dailyActivityChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Group time by day
        const dailyData = this.groupTimeByDay(report.tasks || []);
        const days = Object.keys(dailyData).sort();
        
        if (days.length === 0) {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const maxTime = Math.max(...Object.values(dailyData));
        const barWidth = (canvas.width - 60) / days.length - 10;
        const chartHeight = canvas.height - 40;
        
        days.forEach((day, index) => {
            const time = dailyData[day];
            const barHeight = (time / maxTime) * chartHeight;
            const x = 30 + index * (barWidth + 10);
            const y = chartHeight - barHeight + 20;
            
            // Draw bar
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw label
            ctx.fillStyle = '#374151';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const dateLabel = new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            ctx.fillText(dateLabel, x + barWidth / 2, canvas.height - 5);
            
            // Draw value
            ctx.fillStyle = '#6b7280';
            const hours = Math.floor(time / 60);
            const mins = time % 60;
            ctx.fillText(`${hours}h`, x + barWidth / 2, y - 5);
        });
    }

    renderCategoryTimeChart(report) {
        const canvas = document.getElementById('categoryTimeChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Group time by category
        const categoryData = this.groupTimeByCategory(report.tasks || []);
        const categories = Object.keys(categoryData);
        
        if (categories.length === 0) {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const totalTime = Object.values(categoryData).reduce((a, b) => a + b, 0);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        let startAngle = 0;
        const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
        
        categories.forEach((category, index) => {
            const time = categoryData[category];
            const sliceAngle = (time / totalTime) * 2 * Math.PI;
            const color = colors[index % colors.length];
            
            // Draw pie slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            
            // Draw legend
            const legendX = 20;
            const legendY = 20 + index * 25;
            ctx.fillStyle = color;
            ctx.fillRect(legendX, legendY, 15, 15);
            
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            const hours = Math.floor(time / 60);
            const mins = time % 60;
            ctx.fillText(`${category}: ${hours}h ${mins}m`, legendX + 20, legendY + 12);
            
            startAngle += sliceAngle;
        });
    }

    groupTimeByDay(tasks) {
        const dailyData = {};
        tasks.forEach(task => {
            const date = new Date().toISOString().split('T')[0]; // Simplified - use task date in real implementation
            dailyData[date] = (dailyData[date] || 0) + (task.timeSpent || 0);
        });
        return dailyData;
    }

    groupTimeByCategory(tasks) {
        const categoryData = {};
        tasks.forEach(task => {
            const category = task.category || 'other';
            categoryData[category] = (categoryData[category] || 0) + (task.timeSpent || 0);
        });
        return categoryData;
    }

    exportTimeReport() {
        const reportData = {
            dateRange: document.getElementById('timeReportDateRange').value,
            totalTasks: document.getElementById('totalTasksTracked').textContent,
            totalTime: document.getElementById('totalTimeReport').textContent,
            avgTime: document.getElementById('avgTimePerTask').textContent,
            productivityScore: document.getElementById('productivityScore').textContent,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `time-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showMessage('Time report exported successfully!', 'success');
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
        if (!reminder || !reminder.time) return '';
        
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

        // Priority Section with Chart
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">🎨 By Priority</h4>
                <div class="stats-chart-container">
                    <div class="stats-bar-chart">
                        <div class="bar-item">
                            <div class="bar-label">Low</div>
                            <div class="bar-track">
                                <div class="bar-fill bar-low" style="width: ${stats.total > 0 ? (stats.byPriority.low / stats.total * 100) : 0}%"></div>
                            </div>
                            <div class="bar-value">${stats.byPriority.low}</div>
                        </div>
                        <div class="bar-item">
                            <div class="bar-label">Medium</div>
                            <div class="bar-track">
                                <div class="bar-fill bar-medium" style="width: ${stats.total > 0 ? (stats.byPriority.medium / stats.total * 100) : 0}%"></div>
                            </div>
                            <div class="bar-value">${stats.byPriority.medium}</div>
                        </div>
                        <div class="bar-item">
                            <div class="bar-label">High</div>
                            <div class="bar-track">
                                <div class="bar-fill bar-high" style="width: ${stats.total > 0 ? (stats.byPriority.high / stats.total * 100) : 0}%"></div>
                            </div>
                            <div class="bar-value">${stats.byPriority.high}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Category Section with Chart
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">📂 By Category</h4>
                <div class="stats-chart-container">
                    <div class="stats-bar-chart">
                        <div class="bar-item">
                            <div class="bar-label">Work</div>
                            <div class="bar-track">
                                <div class="bar-fill bar-work" style="width: ${stats.total > 0 ? (stats.byCategory.work / stats.total * 100) : 0}%"></div>
                            </div>
                            <div class="bar-value">${stats.byCategory.work}</div>
                        </div>
                        <div class="bar-item">
                            <div class="bar-label">Personal</div>
                            <div class="bar-track">
                                <div class="bar-fill bar-personal" style="width: ${stats.total > 0 ? (stats.byCategory.personal / stats.total * 100) : 0}%"></div>
                            </div>
                            <div class="bar-value">${stats.byCategory.personal}</div>
                        </div>
                        <div class="bar-item">
                            <div class="bar-label">Shopping</div>
                            <div class="bar-track">
                                <div class="bar-fill bar-shopping" style="width: ${stats.total > 0 ? (stats.byCategory.shopping / stats.total * 100) : 0}%"></div>
                            </div>
                            <div class="bar-value">${stats.byCategory.shopping}</div>
                        </div>
                        <div class="bar-item">
                            <div class="bar-label">Health</div>
                            <div class="bar-track">
                                <div class="bar-fill bar-health" style="width: ${stats.total > 0 ? (stats.byCategory.health / stats.total * 100) : 0}%"></div>
                            </div>
                            <div class="bar-value">${stats.byCategory.health}</div>
                        </div>
                        <div class="bar-item">
                            <div class="bar-label">Finance</div>
                            <div class="bar-track">
                                <div class="bar-fill bar-finance" style="width: ${stats.total > 0 ? (stats.byCategory.finance / stats.total * 100) : 0}%"></div>
                            </div>
                            <div class="bar-value">${stats.byCategory.finance}</div>
                        </div>
                        <div class="bar-item">
                            <div class="bar-label">Other</div>
                            <div class="bar-track">
                                <div class="bar-fill bar-other" style="width: ${stats.total > 0 ? (stats.byCategory.other / stats.total * 100) : 0}%"></div>
                            </div>
                            <div class="bar-value">${stats.byCategory.other}</div>
                        </div>
                    </div>
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

        // Productivity Metrics Section
        html += `
            <div class="stats-section">
                <h4 class="stats-section-title">📈 Productivity Metrics</h4>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.productivity.tasksCompletedThisWeek}</div>
                        <div class="stat-card-label">Completed This Week</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.productivity.tasksCompletedThisMonth}</div>
                        <div class="stat-card-label">Completed This Month</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.productivity.averageCompletionTime}h</div>
                        <div class="stat-card-label">Avg Completion Time</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${stats.productivity.streakDays}</div>
                        <div class="stat-card-label">Day Streak</div>
                    </div>
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
        const categoryFilter = document.getElementById('templateCategoryFilter').value;
        container.innerHTML = '';

        if (!this.templates || this.templates.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">No templates yet. Create your first template!</p>';
            return;
        }

        // Filter templates by category
        const filteredTemplates = categoryFilter 
            ? this.templates.filter(t => t.category === categoryFilter)
            : this.templates;

        if (filteredTemplates.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">No templates in this category.</p>';
            return;
        }

        filteredTemplates.forEach(template => {
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
                    <button class="template-btn template-btn-preview" data-template-id="${template._id}">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="template-btn template-btn-use" data-template-id="${template._id}">
                        <i class="fas fa-plus"></i> Use
                    </button>
                    <button class="template-btn template-btn-delete" data-template-id="${template._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            item.querySelector('.template-btn-preview').addEventListener('click', () => {
                this.showTemplatePreview(template._id);
            });

            item.querySelector('.template-btn-use').addEventListener('click', () => {
                this.useTemplate(template._id);
            });

            item.querySelector('.template-btn-delete').addEventListener('click', () => {
                this.deleteTemplate(template._id);
            });

            container.appendChild(item);
        });
    }

    showTemplatePreview(templateId) {
        this.currentPreviewTemplateId = templateId;
        const template = this.templates.find(t => t._id === templateId);
        if (!template) return;

        this.renderTemplatePreview(template);
        document.getElementById('templatePreviewModal').classList.remove('hidden');
    }

    hideTemplatePreview() {
        document.getElementById('templatePreviewModal').classList.add('hidden');
        this.currentPreviewTemplateId = null;
    }

    renderTemplatePreview(template) {
        const container = document.getElementById('templatePreviewContent');
        container.innerHTML = `
            <div class="template-preview-details">
                <h4>${this.escapeHtml(template.templateName)}</h4>
                <div class="preview-section">
                    <strong>Title:</strong> ${this.escapeHtml(template.title)}
                </div>
                ${template.description ? `
                    <div class="preview-section">
                        <strong>Description:</strong> ${this.escapeHtml(template.description)}
                    </div>
                ` : ''}
                <div class="preview-section">
                    <strong>Priority:</strong> ${template.priority}
                </div>
                <div class="preview-section">
                    <strong>Category:</strong> ${template.category || 'None'}
                </div>
                ${template.dueDate ? `
                    <div class="preview-section">
                        <strong>Due Date:</strong> ${new Date(template.dueDate).toLocaleDateString()}
                    </div>
                ` : ''}
                ${template.tags && template.tags.length > 0 ? `
                    <div class="preview-section">
                        <strong>Tags:</strong> ${template.tags.join(', ')}
                    </div>
                ` : ''}
                ${template.subtasks && template.subtasks.length > 0 ? `
                    <div class="preview-section">
                        <strong>Subtasks:</strong>
                        <ul>
                            ${template.subtasks.map(st => `<li>${this.escapeHtml(st.title)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${template.notes ? `
                    <div class="preview-section">
                        <strong>Notes:</strong> ${this.escapeHtml(template.notes)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    async applyTemplate() {
        if (!this.currentPreviewTemplateId) return;
        await this.useTemplate(this.currentPreviewTemplateId);
        this.hideTemplatePreview();
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
            this.updateBulkActionButtons();
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
        this.updateBulkActionButtons();
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
        
        // Always put pinned tasks at the top
        sorted.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });
        
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
            case 'completed':
                sorted.sort((a, b) => {
                    if (a.completed === b.completed) return 0;
                    return a.completed ? 1 : -1;
                });
                break;
            case 'timeSpent':
                sorted.sort((a, b) => {
                    const aTime = a.timeTracking?.timeSpent || 0;
                    const bTime = b.timeTracking?.timeSpent || 0;
                    return bTime - aTime;
                });
                break;
            case 'subtasks':
                sorted.sort((a, b) => {
                    const aSubtasks = a.subtasks?.length || 0;
                    const bSubtasks = b.subtasks?.length || 0;
                    return bSubtasks - aSubtasks;
                });
                break;
            case 'comments':
                sorted.sort((a, b) => {
                    const aComments = a.comments?.length || 0;
                    const bComments = b.comments?.length || 0;
                    return bComments - aComments;
                });
                break;
            case 'favorite':
                sorted.sort((a, b) => {
                    if (a.isFavorite === b.isFavorite) return 0;
                    return a.isFavorite ? -1 : 1;
                });
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
