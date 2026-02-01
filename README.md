# TaskMaster - Simple Task Management App

A beginner-friendly MERN stack application using HTML, CSS, and JavaScript (no React). Perfect for interviews!

## 🚀 Features

- ✅ Add, edit, and delete tasks
- 👤 User registration and login
- 📱 Responsive design for mobile and desktop
- 🎨 Clean and simple UI
- 🔐 Secure authentication with JWT
- 📊 Real-time task updates

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Installation

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB installed on your system

### Setup Steps

1. **Clone or download this project**
2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Create environment file**
   - Create a file named `.env` in the `backend` folder
   - Add these lines:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskmaster
   JWT_SECRET=your-secret-key-here
   ```

4. **Start MongoDB** (if not already running)

5. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

6. **Open the frontend**
   - Open `frontend/index.html` in your browser
   - Or use a simple server like Live Server extension in VS Code

## 🏗️ Project Structure

```
taskmaster/
├── backend/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── app.js          # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Styles
│   ├── js/
│   │   ├── auth.js         # Authentication logic
│   │   ├── tasks.js        # Task management
│   │   └── main.js         # Main JavaScript
│   └── assets/             # Images, icons
└── README.md
```

## 🎯 How to Use

1. **Register a new account** or login
2. **Create tasks** with title and description
3. **Mark tasks** as complete/incomplete
4. **Edit or delete** tasks as needed
5. **Tasks are saved** in the database

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user info

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🎨 Features Demonstrated

- **Frontend**: HTML5 semantic tags, CSS3 animations, JavaScript ES6+
- **Backend**: RESTful API design, middleware, error handling
- **Database**: MongoDB with Mongoose ODM
- **Security**: Password hashing, JWT authentication
- **Best Practices**: Clean code structure, responsive design

## 🚀 Perfect for Interviews

This project shows you can:
- Build full-stack applications
- Work with databases
- Implement authentication
- Create responsive designs
- Write clean, maintainable code
- Understand REST APIs

## 📱 Mobile Friendly

The app works perfectly on:
- Desktop computers
- Tablets
- Mobile phones

## 🔧 Easy to Customize

You can easily add:
- Task categories
- Due dates
- Priority levels
- User profiles
- Dark mode

## 📞 Support

If you have any questions or need help, feel free to reach out!

---

**Good luck with your interview! 🎉**
