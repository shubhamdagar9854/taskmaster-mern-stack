# 🚀 TaskMaster - Professional MERN Stack Task Management App

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)](https://mongodb.com)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/shubhamdagar9854/taskmaster-mern-stack?style=social)](https://github.com/shubhamdagar9854/taskmaster-mern-stack/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/shubhamdagar9854/taskmaster-mern-stack?style=social)](https://github.com/shubhamdagar9854/taskmaster-mern-stack/network/members)

A complete full-stack task management application demonstrating modern web development practices with MERN stack. Built with Node.js, Express, MongoDB, HTML5, CSS3, and vanilla JavaScript.

## 📑 **Table of Contents**

- [Why This Project?](#-why-this-project)
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [API Endpoints](#-api-endpoints)
- [Security Features](#-security-features)
- [UI/UX Features](#-uiux-features)
- [Responsive Design](#-responsive-design)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [Support & Contact](#-support--contact)

---

## 🌟 **Why This Project?**

This project showcases **real-world development skills** that employers actively seek. Perfect for technical interviews, portfolio building, and demonstrating full-stack expertise.

---

## ⚡ **Quick Start**

```bash
# Clone the repository
git clone https://github.com/shubhamdagar9854/taskmaster-mern-stack.git
cd taskmaster-mern-stack

# Install backend dependencies
cd backend
npm install

# Configure environment variables
# Create .env file with:
# PORT=5002
# MONGODB_URI=mongodb://localhost:27017/taskmaster
# JWT_SECRET=your-secret-key
# NODE_ENV=development

# Start MongoDB
mongod

# Start backend server
npm start

# Open frontend in browser
# Navigate to frontend/index.html
```

---

## 🎯 **Project Overview**

**TaskMaster** is a comprehensive task management application that demonstrates proficiency in full-stack web development using MERN stack. This project showcases the ability to build scalable, secure, and user-friendly web applications from scratch.

### **🏆 Key Demonstrations:**
- **Full-Stack Development** - Complete MERN implementation from scratch
- **Authentication Systems** - JWT-based secure authentication with password hashing
- **Database Design** - MongoDB with Mongoose ODM for data persistence
- **API Development** - RESTful API design and implementation
- **Frontend Development** - Modern JavaScript without frameworks
- **Responsive Design** - Mobile-first approach with cross-device compatibility
- **Security Best Practices** - Modern security implementation with input validation
- **Performance Optimization** - Efficient code practices and database queries
- **User Experience** - Professional UI/UX with smooth animations

### **🎯 Interview Talking Points:**
- *"I built a complete MERN stack application demonstrating full-stack capabilities"*
- *"Implemented secure JWT authentication with bcryptjs password hashing"*
- *"Designed responsive UI that works seamlessly across all devices"*
- *"Created RESTful APIs with proper error handling and validation"*
- *"Optimized performance with efficient DOM manipulation and database queries"*
- *"Followed security best practices including input sanitization and CORS configuration"*

### 📊 Project Statistics:
- **Backend**: Node.js + Express.js + MongoDB
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **API Endpoints**: 50+ RESTful endpoints
- **Database Models**: 2 (User, Task)
- **Authentication**: JWT-based with bcryptjs
- **Lines of Code**: ~6000+ lines
- **Features**: 20+ advanced features

---

## ✨ **Key Features**

### 🔐 **Authentication & Security**
- **JWT-based Authentication** - Secure token-based login system
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Server-side validation for all user inputs
- **CORS Configuration** - Proper cross-origin request handling
- **XSS Prevention** - HTML sanitization and content security

### 📝 **Task Management**
- **Complete CRUD Operations** - Create, Read, Update, Delete tasks
- **Task Status Toggle** - Mark tasks as complete/incomplete
- **Real-time Updates** - Instant UI updates without page refresh
- **Task Persistence** - MongoDB database storage
- **User-specific Tasks** - Each user sees only their tasks
- **Task Categories** - Organize tasks by categories (Work, Personal, Shopping, Health, Finance, Other)
- **Priority Levels** - High, Medium, Low priority with color-coded badges
- **Due Dates** - Set and track task deadlines
- **Task Notes** - Rich text notes with formatting support
- **Task Tags/Labels** - Custom tags for task organization and filtering
- **Task Dependencies** - Link tasks together with visual blocking
- **Task Templates** - Create templates from tasks for quick task creation
- **Subtasks** - Break down tasks into smaller subtasks
- **Task Reminders** - Multi-type reminders (Email, SMS, In-App)
- **Time Tracking** - Track time spent on tasks with manual entries
- **Task Attachments** - Upload and manage file attachments
- **Recurring Tasks** - Set up recurring tasks with custom intervals
- **Task History/Audit Log** - Track all task changes with timestamps
- **Task Quick Actions** - Right-click context menu for quick actions
- **Bulk Actions** - Perform actions on multiple tasks at once
- **Task Sharing** - Share tasks with other users via email
- **Advanced Search** - Multi-filter search with complex queries
- **Task Statistics** - Comprehensive analytics dashboard
- **Calendar View** - Visual calendar with task display
- **Export/Import** - Export and import tasks in JSON/CSV format
- **Task Comments** - Add comments with reactions and replies
- **Activity Feed** - View all task activities in timeline
- **Notifications** - In-app notification system

### 🔍 **Search & Filter**
- **Real-time Search** - Search tasks by title and description
- **Status Filtering** - Filter by All, Active, Completed, Archived, Favorites
- **Priority Filtering** - Filter by priority levels
- **Category Filtering** - Filter by task categories
- **Tag Filtering** - Filter by custom tags
- **Due Date Filtering** - Filter by due date range
- **Advanced Filters** - Subtasks, Attachments, Dependencies, Recurring
- **Instant Results** - Live filtering as you type
- **Task Counter** - Shows total and completed task count

### 🎨 **User Interface**
- **Modern Design** - Clean, professional UI with gradient backgrounds
- **Responsive Layout** - Mobile-first approach, works on all devices
- **Dark Mode** - Built-in dark mode support with toggle
- **Smooth Animations** - CSS transitions and animations
- **Professional Footer** - Branded footer with copyright
- **Context Menus** - Right-click quick actions
- **Modal Dialogs** - Professional modal interfaces
- **Toast Notifications** - Success/error message toasts
- **Empty States** - Helpful empty state messages
- **Loading States** - Spinners for async operations
- **Glassmorphism** - Frosted glass effects
- **Hover Effects** - Interactive hover states

### ⚡ **Performance**
- **Event Delegation** - Efficient event handling for dynamic content
- **Optimized Rendering** - Fast DOM manipulation
- **Lazy Loading** - Scripts load with defer for better performance
- **Efficient Queries** - Optimized MongoDB queries
- **Debounced Search** - Debounced search input for performance
- **Pagination Ready** - Structure supports pagination

---

## 🛠️ **Tech Stack**

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No frameworks, pure JS
- **Font Awesome** - Icon library

### **Development Tools**
- **Git** - Version control
- **NPM** - Package management
- **VS Code** - Code editor

---

## 📁 **Project Structure**

```
mern/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js          # User schema
│   │   │   └── Task.js          # Task schema
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication routes
│   │   │   └── tasks.js         # Task management routes
│   │   └── app.js               # Express app setup
│   ├── .env                     # Environment variables
│   ├── .env.example             # Example environment file
│   └── package.json             # Backend dependencies
├── frontend/
│   ├── css/
│   │   └── style.css            # Application styles
│   ├── js/
│   │   ├── auth.js              # Authentication logic
│   │   ├── tasks.js             # Task management logic
│   │   └── main.js              # Main app controller
│   └── index.html               # Main HTML file
└── README.md                    # Project documentation
```

---

## 🚀 **Installation & Setup**

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/shubhamdagar9854/taskmaster-mern-stack.git
cd taskmaster-mern-stack
```

### **Step 2: Backend Setup**
```bash
cd backend
npm install
```

### **Step 3: Configure Environment Variables**
Create a `.env` file in the `backend` directory:
```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/taskmaster
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### **Step 4: Start MongoDB**
```bash
# For local MongoDB
mongod
```

### **Step 5: Start Backend Server**
```bash
npm start
```
Backend will run on `http://localhost:5002`

### **Step 6: Open Frontend**
Simply open `frontend/index.html` in your browser, or use a simple HTTP server:
```bash
cd frontend
npx http-server -p 3000
```

---

## 📡 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### **Tasks**
- `GET /api/tasks` - Get all user tasks (protected)
- `POST /api/tasks` - Create new task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)
- `PATCH /api/tasks/:id/toggle` - Toggle task completion (protected)
- `PATCH /api/tasks/:id/favorite` - Toggle task favorite (protected)
- `PATCH /api/tasks/:id/archive` - Toggle task archive (protected)
- `PATCH /api/tasks/reorder` - Reorder tasks (protected)
- `POST /api/tasks/:id/duplicate` - Duplicate task (protected)
- `PATCH /api/tasks/:id/move-category` - Move task to category (protected)

### **Task Tags**
- `POST /api/tasks/:id/tags` - Add tag to task (protected)
- `DELETE /api/tasks/:id/tags/:tag` - Remove tag from task (protected)
- `GET /api/tasks/tags/all` - Get all user tags (protected)

### **Task History**
- `GET /api/tasks/:id/history` - Get task history (protected)

### **Task Reminders**
- `POST /api/tasks/:id/reminder/send` - Send reminder (protected)
- `POST /api/tasks/:id/reminder/schedule` - Schedule reminder (protected)
- `GET /api/tasks/reminders/due` - Get due reminders (protected)
- `GET /api/tasks/:id/reminder/history` - Get reminder history (protected)

### **Task Dependencies**
- `POST /api/tasks/:id/dependencies` - Add dependency (protected)
- `DELETE /api/tasks/:id/dependencies/:dependencyId` - Remove dependency (protected)
- `GET /api/tasks/:id/dependencies/status` - Check dependency status (protected)
- `GET /api/tasks/:id/dependents` - Get dependent tasks (protected)

### **Task Templates**
- `POST /api/tasks/:id/create-template` - Create template from task (protected)
- `GET /api/tasks/templates` - Get all templates (protected)
- `POST /api/tasks/templates/:id/create-task` - Create task from template (protected)
- `DELETE /api/tasks/templates/:id` - Delete template (protected)
- `PUT /api/tasks/templates/:id` - Update template (protected)

### **Task Comments**
- `POST /api/tasks/:id/comments` - Add comment (protected)
- `DELETE /api/tasks/:id/comments/:commentId` - Delete comment (protected)
- `POST /api/tasks/:id/comments/:commentId/reactions` - Add reaction (protected)
- `POST /api/tasks/:id/comments/:commentId/replies` - Add reply (protected)

### **Task Time Tracking**
- `POST /api/tasks/:id/timer/start` - Start timer (protected)
- `POST /api/tasks/:id/timer/stop` - Stop timer (protected)
- `POST /api/tasks/:id/timer/reset` - Reset timer (protected)
- `POST /api/tasks/:id/time/manual` - Add manual time entry (protected)

### **Task Attachments**
- `POST /api/tasks/:id/attachments` - Upload attachment (protected)
- `DELETE /api/tasks/:id/attachments/:attachmentId` - Delete attachment (protected)

### **Task Sharing**
- `POST /api/tasks/:id/share` - Share task (protected)
- `GET /api/tasks/shared` - Get shared tasks (protected)

### **Advanced Features**
- `POST /api/tasks/search` - Advanced search (protected)
- `POST /api/tasks/import` - Import tasks (protected)
- `GET /api/tasks/export` - Export tasks (protected)
- `PUT /api/tasks/bulk` - Bulk update tasks (protected)
- `DELETE /api/tasks/bulk` - Bulk delete tasks (protected)
- `POST /api/tasks/:id/complete-recurring` - Complete recurring task (protected)

---

## 🔒 **Security Features**

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Server-side validation
- **CORS Protection** - Configured CORS policies
- **Environment Variables** - Sensitive data in .env
- **XSS Prevention** - HTML sanitization
- **SQL Injection Prevention** - MongoDB parameterized queries

---

## 🎨 **UI/UX Features**

- **Gradient Backgrounds** - Modern purple gradient theme
- **Glassmorphism** - Frosted glass effects
- **Smooth Transitions** - CSS animations
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Complete dark theme support
- **Loading States** - Spinners for async operations
- **Toast Notifications** - Success/error messages
- **Empty States** - Helpful empty state messages
- **Hover Effects** - Interactive hover states

---

## 📱 **Responsive Design**

- **Mobile First** - Designed for mobile devices first
- **Tablet Support** - Optimized for tablets
- **Desktop Experience** - Enhanced for larger screens
- **Touch Friendly** - Large touch targets
- **Flexible Layouts** - Flexbox and Grid layouts

---

## 🧪 **Testing**

### **Manual Testing**
- Test user registration and login
- Test task CRUD operations
- Test search and filter functionality
- Test responsive design on different devices
- Test dark mode toggle

### **Test Scenarios**
1. Register a new user
2. Login with credentials
3. Create multiple tasks
4. Search for tasks
5. Filter by status
6. Toggle task completion
7. Edit task details
8. Delete tasks
9. Logout and re-login
10. Verify data persistence

---

## 📸 **Screenshots**

### **Login Page**
- Clean and modern login interface
- Email and password authentication
- Link to registration page

### **Dashboard**
- Task list with all user tasks
- Search bar for filtering tasks
- Status filter dropdown (All/Active/Completed)
- Task counter showing total and completed tasks

### **Task Management**
- Add new task form
- Edit existing tasks
- Mark tasks as complete/incomplete
- Delete tasks with confirmation

### **Responsive Design**
- Mobile-friendly interface
- Tablet-optimized layout
- Desktop-enhanced experience

---

## 🚀 **Deployment**

### **Local Deployment**
Follow the installation steps above to run locally.

### **Production Deployment**

#### **Backend Deployment (Heroku/Railway/Render)**
1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables:
   - `MONGODB_URI` - Production MongoDB connection string
   - `JWT_SECRET` - Strong secret key
   - `NODE_ENV` - Set to `production`
4. Deploy and get backend URL

#### **Frontend Deployment (Netlify/Vercel/GitHub Pages)**
1. Build frontend files
2. Deploy to static hosting
3. Update API base URL in frontend files
4. Deploy and get frontend URL

### **Environment Variables**
```env
PORT=5002
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmaster
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
```

---

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

#### **MongoDB Connection Error**
- **Issue**: Cannot connect to MongoDB
- **Solution**: Ensure MongoDB is running on port 27017
- **Command**: `mongod` to start MongoDB service

#### **Port Already in Use**
- **Issue**: EADDRINUSE error on port 5002
- **Solution**: Change PORT in `.env` file or kill the process
- **Command**: `netstat -ano | findstr :5002` then `taskkill /F /PID [PID]`

#### **CORS Error**
- **Issue**: CORS policy error in browser
- **Solution**: Check CORS configuration in backend
- **Verify**: Backend server is running on correct port

#### **Authentication Token Error**
- **Issue**: 401 Unauthorized error
- **Solution**: Clear localStorage and login again
- **Check**: JWT_SECRET in `.env` file

---

## � **Recent Updates & Changelog**

### **Latest Features (August 2026)**

#### **🔗 Task Dependencies with Visual Blocking**
- Link tasks together with dependency relationships
- Visual blocking indicator for tasks with incomplete dependencies
- Circular dependency prevention
- Self-dependency prevention
- Dependency status checking (completed/pending)
- Dependent tasks tracking
- Context menu integration for quick dependency management
- Color-coded dependency badges (green for completed, yellow for pending)
- Activity logging and history tracking for all dependency operations

#### **📋 Enhanced Task Templates**
- Create custom-named templates from existing tasks
- Duplicate template name prevention
- Reset subtasks when creating tasks from templates
- Template management modal with create/use/delete actions
- History tracking for template creation and usage
- Context menu integration for quick template creation
- Activity logging for all template operations

#### **🔍 Advanced Search with Multiple Filters**
- Enhanced search with subtasks presence filter (yes/no)
- Attachments presence filter (yes/no)
- Dependencies presence filter (yes/no)
- Recurring status filter (yes/no)
- Template exclusion from search results
- Complex filter combinations support
- Optimized MongoDB queries for performance
- Active filters count display
- Quick filter application and clearing

#### **🏷️ Task Tags/Labels System**
- Custom tags for task organization
- Tag filter dropdown in task list
- Tag input fields in add/edit task forms
- Tag badges in task display
- Add/remove tags via API
- All user tags fetching
- Tag-based task filtering
- Color-coded tag badges with dark mode support

#### **📜 Task History/Audit Log**
- Complete audit trail for all task changes
- History modal with timeline view
- Action descriptions with timestamps
- Change tracking for all modifications
- Context menu integration for viewing history
- Icon-based action indicators
- Formatted action descriptions
- History entry for task creation, updates, toggles, favorites, archives

#### **🔔 Multi-Type Task Reminders**
- Email reminders
- SMS reminders
- In-app notifications
- Reminder scheduling with custom times
- Reminder type selection
- Due reminders fetching
- Reminder history tracking
- Context menu integration for scheduling and sending
- Activity logging for reminder operations

#### **📊 Comprehensive Statistics Dashboard**
- Task completion rate
- Priority distribution
- Category breakdown
- Due date analysis
- Time tracking summary
- Productivity insights
- Visual charts and graphs
- Real-time statistics calculation
- Modal-based statistics display

#### **📅 Calendar View**
- Monthly calendar with task display
- Month navigation controls
- Task indicators on calendar days
- Date-based task filtering
- Backend API for calendar tasks
- Responsive calendar layout
- Today's date highlighting
- Task count per day display

#### **📤 Export/Import Tasks**
- Export tasks to JSON format
- Import tasks from JSON
- Export modal with format selection
- Import modal with file upload
- Data validation during import
- Bulk task creation from import
- Export/Import modal integration

#### **💬 Task Comments with Reactions & Replies**
- Add comments to tasks
- Delete comments
- Emoji reactions on comments
- Threaded replies to comments
- Comments modal with full history
- Reaction counts display
- Reply threading visualization
- User identification in comments

#### **📎 Task Attachments**
- Upload file attachments
- Delete attachments
- Attachment display in task list
- File type icons
- Attachment count display
- Size and date information
- Download attachments
- Attachment modal management

#### **⏱️ Time Tracking**
- Start/stop timer for tasks
- Manual time entry
- Time spent display
- Timer reset functionality
- Time tracking history
- Total time calculation
- Timer badge in task list
- Time statistics in dashboard

#### **🔄 Recurring Tasks**
- Set recurring intervals (daily, weekly, monthly)
- Custom recurring patterns
- Auto-create recurring tasks
- Recurring task completion
- Recurring badge display
- Recurring history tracking
- Skip recurring instances
- Edit recurring patterns

#### **📤 Task Sharing**
- Share tasks via email
- Shared tasks view
- Share history tracking
- Share status indicators
- Email notification on share
- Share permissions management
- Shared task modal
- Activity logging for shares

#### **📂 Bulk Actions**
- Bulk select tasks
- Bulk delete tasks
- Bulk update tasks
- Bulk archive tasks
- Bulk category change
- Bulk priority change
- Bulk actions modal
- Selection counter display

#### **🎯 Context Menu Quick Actions**
- Right-click context menu
- Duplicate task
- Create template
- Archive/Unarchive
- Move to category
- Set priority
- Toggle favorite
- Delete task
- Add dependency
- Schedule reminder
- Send reminder
- View history
- Share task

#### **🔔 Notifications System**
- In-app notification dropdown
- Notification badges
- Clear all notifications
- Notification history
- Real-time notification updates
- Notification types (success, error, info, warning)
- Notification auto-dismiss
- Notification sound support

---

## �🚀 **Future Enhancements**

### **Planned Features**
- [x] **Task Categories** - Organize tasks by categories ✅
- [x] **Due Dates** - Add deadline functionality ✅
- [x] **Priority Levels** - High, Medium, Low priority ✅
- [x] **Task Reminders** - Email notifications ✅
- [x] **Task Sharing** - Share tasks with other users ✅
- [x] **Export Tasks** - Export to CSV/PDF ✅
- [ ] **Mobile App** - React Native version
- [ ] **Real-time Sync** - WebSocket integration
- [ ] **Voice Commands** - Voice-activated task management
- [ ] **AI Suggestions** - Smart task recommendations
- [ ] **Team Collaboration** - Team workspaces
- [ ] **Kanban Board** - Visual task board view
- [ ] **Gantt Charts** - Project timeline view
- [ ] **Email Integration** - Email to task conversion
- [ ] **Calendar Sync** - Google/Outlook calendar sync
- [ ] **Mobile Push Notifications** - Push notification support
- [ ] **Offline Mode** - PWA with offline support
- [ ] **Dark Mode Auto** - System-based dark mode
- [ ] **Custom Themes** - User-defined color themes
- [ ] **Keyboard Shortcuts** - Power user shortcuts
- [ ] **Task Dependencies Graph** - Visual dependency graph
- [ ] **Time Reports** - Detailed time tracking reports
- [ ] **Productivity Insights** - AI-powered productivity analytics

### **Technical Improvements**
- [ ] **Unit Testing** - Jest test suite
- [ ] **E2E Testing** - Cypress integration
- [ ] **Docker Support** - Containerization
- [ ] **CI/CD Pipeline** - GitHub Actions
- [ ] **Rate Limiting** - API rate limiting
- [ ] **Caching** - Redis implementation
- [ ] **Logging** - Winston logger integration
- [ ] **Database Indexing** - Performance optimization
- [ ] **API Documentation** - Swagger/OpenAPI
- [ ] **Performance Monitoring** - APM integration
- [ ] **Error Tracking** - Sentry integration
- [ ] **Analytics** - User analytics tracking
