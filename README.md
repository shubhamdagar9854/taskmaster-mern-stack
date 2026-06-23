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

### **📊 Project Statistics:**
- **Backend**: Node.js + Express.js + MongoDB
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **API Endpoints**: 8 RESTful endpoints
- **Database Models**: 2 (User, Task)
- **Authentication**: JWT-based with bcryptjs
- **Lines of Code**: ~2000+ lines

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

### 🔍 **Search & Filter** (NEW!)
- **Real-time Search** - Search tasks by title and description
- **Status Filtering** - Filter by All, Active, or Completed tasks
- **Instant Results** - Live filtering as you type
- **Task Counter** - Shows total and completed task count

### 🎨 **User Interface**
- **Modern Design** - Clean, professional UI with gradient backgrounds
- **Responsive Layout** - Mobile-first approach, works on all devices
- **Dark Mode** - Built-in dark mode support
- **Smooth Animations** - CSS transitions and animations
- **Professional Footer** - Branded footer with copyright

### ⚡ **Performance**
- **Event Delegation** - Efficient event handling for dynamic content
- **Optimized Rendering** - Fast DOM manipulation
- **Lazy Loading** - Scripts load with defer for better performance
- **Efficient Queries** - Optimized MongoDB queries

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

## 🚀 **Future Enhancements**

### **Planned Features**
- [ ] **Task Categories** - Organize tasks by categories
- [ ] **Due Dates** - Add deadline functionality
- [ ] **Priority Levels** - High, Medium, Low priority
- [ ] **Task Reminders** - Email notifications
- [ ] **Task Sharing** - Share tasks with other users
- [ ] **Export Tasks** - Export to CSV/PDF
- [ ] **Mobile App** - React Native version
- [ ] **Real-time Sync** - WebSocket integration

### **Technical Improvements**
- [ ] **Unit Testing** - Jest test suite
- [ ] **E2E Testing** - Cypress integration
- [ ] **Docker Support** - Containerization
- [ ] **CI/CD Pipeline** - GitHub Actions
- [ ] **Rate Limiting** - API rate limiting
- [ ] **Caching** - Redis implementation
- [ ] **Logging** - Winston logger integration

---

## 📞 **Support & Contact**

### **Get Help**
- **Issues**: Open an issue on GitHub
- **Questions**: Check existing discussions
- **Contributions**: Follow contributing guidelines

### **Connect**
- **GitHub**: https://github.com/shubhamdagar9854/taskmaster-mern-stack
- **Portfolio**: Add your portfolio link here
- **LinkedIn**: Add your LinkedIn profile here

---

## 🙏 **Acknowledgments**

- **MongoDB** - For the excellent NoSQL database
- **Express.js** - For the minimalist web framework
- **Font Awesome** - For the beautiful icons
- **MDN Web Docs** - For excellent documentation

---

## 🎉 **Thank You!**

Thank you for checking out TaskMaster! This project was built with passion and attention to detail. Feel free to fork, modify, and use it for your own projects or learning purposes.

**Happy Coding! 🚀**

---

**Built with ❤️ by Shubham Dagar**

**🔗 Live Repository**: https://github.com/shubhamdagar9854/taskmaster-mern-stack

### **Why This Project Stands Out**
- 🌟 **Beginner-Friendly** - Clean, readable code structure
- 🚀 **Production-Ready** - Security and performance optimized
- 🎯 **Interview-Perfect** - Demonstrates all required MERN skills
- 💻 **Modern Tech Stack** - Latest versions and best practices
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔐 **Security Focused** - Implements security best practices
- 🔍 **Advanced Features** - Search, filter, and counter functionality

### **Learning Opportunities**
- **MERN Stack** - Complete full-stack development
- **Authentication** - JWT implementation
- **Database Design** - MongoDB with Mongoose
- **API Development** - RESTful API design
- **Frontend Development** - Modern JavaScript
- **Security** - Best security practices
- **Performance** - Optimization techniques
- **UI/UX** - Modern design principles
