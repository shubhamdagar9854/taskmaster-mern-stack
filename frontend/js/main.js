// Main Application Controller
class App {
    constructor() {
        this.init();
    }

    init() {
        console.log('TaskMaster App Initialized');
        
        // Check if user is already authenticated
        this.checkInitialAuth();
        
        // Add some polish
        this.addInteractions();
    }

    checkInitialAuth() {
        // This will be called after both authManager and taskManager are initialized
        setTimeout(() => {
            if (window.authManager && window.authManager.isAuthenticated()) {
                console.log('User is already authenticated');
                // Tasks will be loaded automatically by authManager.showTaskSection()
            }
        }, 100);
    }

    addInteractions() {
        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Add enter key support for forms
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const form = e.target.closest('form');
                if (form) {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn && !submitBtn.disabled) {
                        submitBtn.click();
                    }
                }
            }
        });

        // Add escape key to close forms
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const addTaskForm = document.getElementById('addTaskForm');
                if (addTaskForm && addTaskForm.style.display !== 'none') {
                    document.getElementById('cancelTaskBtn').click();
                }
            }
        });

        // Add loading states to buttons
        this.addButtonLoadingStates();
    }

    addButtonLoadingStates() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // Add loading animation
                if (!this.classList.contains('loading')) {
                    this.classList.add('loading');
                    setTimeout(() => {
                        this.classList.remove('loading');
                    }, 1000);
                }
            });
        });
    }

    // Utility method to show global messages
    static showMessage(message, type = 'info') {
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

    // Utility method to show/hide loading
    static showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = show ? 'flex' : 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // Add some helpful console messages for developers
    console.log('%c TaskMaster App ', 'background: #667eea; color: white; font-size: 16px; font-weight: bold;');
    console.log('%c Built with HTML, CSS, and JavaScript ', 'color: #667eea;');
    console.log('%c Backend: Node.js + Express + MongoDB ', 'color: #667eea;');
});

// Handle page visibility changes (for mobile app behavior)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page became visible again, refresh data if user is authenticated
        if (window.authManager && window.authManager.isAuthenticated()) {
            if (window.taskManager) {
                window.taskManager.loadTasks();
            }
        }
    }
});

// Handle network status
window.addEventListener('online', () => {
    App.showMessage('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    App.showMessage('No internet connection', 'error');
});

// Add some global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Don't show error to user for now, but log it
});

// Add unhandled promise rejection handling
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});
