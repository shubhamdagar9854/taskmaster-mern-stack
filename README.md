# 🚀 TaskMaster - Professional MERN Stack Task Management App

A complete full-stack task management application demonstrating modern web development practices with MERN stack. Built with Node.js, Express, MongoDB, HTML5, CSS3, and vanilla JavaScript.

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based login/registration with password hashing
- 📝 **Task Management** - Complete CRUD operations (Create, Read, Update, Delete)
- 📱 **Responsive Design** - Mobile-first approach, works perfectly on all devices
- 🎨 **Modern UI/UX** - Beautiful animations, gradients, and professional design
- 🔄 **Real-time Updates** - Instant task status changes with smooth transitions
- 💾 **MongoDB Integration** - Robust data persistence with Mongoose ODM
- 🛡️ **Security Best Practices** - Input validation, CORS, SQL injection prevention
- ⚡ **Performance Optimized** - Efficient DOM manipulation and API calls

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Elegant MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing for security
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Modern styling with animations and transitions
- **JavaScript (ES6+)** - Vanilla JavaScript with modern features
- **Font Awesome** - Professional icon library

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- MongoDB installed and running
- Modern web browser

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shubhamdagar9854/taskmaster-mern-stack.git
   cd taskmaster-mern-stack
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file in backend directory:
   ```env
   PORT=5002
   MONGODB_URI=mongodb://localhost:27017/taskmaster
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NODE_ENV=development
   ```

4. **Start Backend Server**
   ```bash
   npm start
   ```
   Server will run on http://localhost:5002

5. **Frontend Setup**
   ```bash
   # Open in browser
   open frontend/index.html
   
   # Or use Live Server extension in VS Code
   ```

## 📱 Usage Guide

1. **Create Account** - Click "Register" and fill in your details
2. **Login** - Use your credentials to access the app
3. **Add Tasks** - Click "Add Task" and enter title/description
4. **Manage Tasks** - Edit, delete, or mark tasks as complete
5. **Enjoy** - Experience the beautiful, responsive interface!

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and get JWT token
- `GET /api/auth/profile` - Get authenticated user profile

### Task Management Endpoints
- `GET /api/tasks` - Retrieve all tasks for authenticated user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update existing task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion status

## 🎯 Project Architecture

```
taskmaster-mern-stack/
├── backend/                    # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/          # Database schemas
│   │   │   ├── User.js     # User model with authentication
│   │   │   └── Task.js     # Task model with relationships
│   │   ├── routes/          # API route handlers
│   │   │   ├── auth.js      # Authentication endpoints
│   │   │   └── tasks.js     # Task CRUD endpoints
│   │   └── app.js          # Main Express application
│   ├── package.json           # Backend dependencies
│   └── .env                 # Environment variables
├── frontend/                  # HTML5 + CSS3 + JavaScript
│   ├── index.html          # Single-page application
│   ├── css/
│   │   └── style.css       # Modern responsive styling
│   └── js/
│       ├── auth.js          # Authentication logic
│       ├── tasks.js         # Task management functionality
│       └── main.js          # Application controller
└── README.md                 # This documentation
```

## 🔐 Security Features

- **JWT Authentication** - Token-based authentication with expiration
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Server-side validation for all inputs
- **CORS Configuration** - Proper cross-origin request handling
- **XSS Prevention** - HTML sanitization and content security
- **SQL Injection Protection** - MongoDB ODM prevents injection attacks

## 📱 Responsive Design

- **Mobile-First** - Designed for mobile devices first
- **Tablet Compatible** - Optimized for tablet screens
- **Desktop Optimized** - Enhanced experience on larger screens
- **Touch-Friendly** - Large buttons and touch targets
- **Flexible Layout** - Adapts to different screen sizes

## 🎨 Design Features

- **Modern Gradients** - Beautiful color transitions
- **Smooth Animations** - CSS transitions and hover effects
- **Loading States** - Visual feedback during operations
- **Toast Notifications** - User-friendly success/error messages
- **Professional Typography** - Clean, readable fonts
- **Consistent Spacing** - Proper visual hierarchy

## 🚀 Performance Optimizations

- **Event Delegation** - Efficient event handling for dynamic content
- **Lazy Loading** - Load resources only when needed
- **Optimized API Calls** - Minimal requests with proper caching
- **Efficient DOM Manipulation** - Reduce reflows and repaints
- **Component Memoization** - Prevent unnecessary re-renders

## 🎯 Interview-Ready Features

This project demonstrates key skills employers look for:

### **Technical Skills**
- ✅ **Full-Stack Development** - Complete MERN implementation
- ✅ **RESTful API Design** - Proper HTTP methods and status codes
- ✅ **Database Integration** - MongoDB with Mongoose ODM
- ✅ **Authentication Systems** - JWT-based secure authentication
- ✅ **Frontend Expertise** - Modern JavaScript without frameworks
- ✅ **Security Best Practices** - Comprehensive security implementation

### **Soft Skills**
- ✅ **Problem-Solving** - Efficient solutions for common issues
- ✅ **Code Organization** - Clean, maintainable architecture
- ✅ **Documentation** - Comprehensive README and inline comments
- ✅ **User Experience** - Focus on accessibility and usability

## 🧪 Testing & Quality

- **Input Validation** - Client and server-side validation
- **Error Handling** - Graceful error management
- **Cross-Browser Compatibility** - Works on all modern browsers
- **Performance Monitoring** - Optimized for speed and efficiency

## 📞 Contributing Guidelines

1. **Fork the Repository**
2. **Create Feature Branch** - `git checkout -b feature/amazing-feature`
3. **Commit Changes** - `git commit -m 'Add amazing feature'`
4. **Push to Branch** - `git push origin feature/amazing-feature`
5. **Open Pull Request** - Detailed description of changes

## 📝 License

This project is licensed under the MIT License - feel free to use and modify!

## 🏆 Project Highlights

- **Beginner-Friendly** - Clean, readable code structure
- **Production-Ready** - Security and performance optimized
- **Interview-Perfect** - Demonstrates all required MERN skills
- **Professionally Documented** - Comprehensive setup and usage guides
- **Modern Tech Stack** - Latest versions and best practices

---

### 🚀 **Perfect for Your Next Interview!**

**Built with passion and attention to detail. Ready to impress recruiters and technical teams!**

**Live Demo**: https://github.com/shubhamdagar9854/taskmaster-mern-stack

**Show this project with confidence in your technical interviews!** 🎯
