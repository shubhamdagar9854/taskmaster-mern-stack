# 🚀 TaskMaster - MERN Stack Task Management App

A complete full-stack task management application demonstrating modern web development practices with the MERN stack. Built with Node.js, Express, MongoDB, HTML5, CSS3, and vanilla JavaScript.

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based login/registration
- 📝 **Task Management** - Create, edit, delete, and toggle tasks
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Beautiful animations and professional design
- � **Real-time Updates** - Instant task status changes
- 💾 **MongoDB Integration** - Robust data persistence
- �️ **Security Best Practices** - Password hashing, JWT tokens, input validation

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object Document Mapper
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Vanilla JavaScript (no frameworks)
- **Font Awesome** - Icon library

## � Quick Start

### Prerequisites
- Node.js 14+
- MongoDB installed

### Installation

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

3. **Environment Variables**
Create `.env` file in backend directory:
```
PORT=5002
MONGODB_URI=mongodb://localhost:27017/taskmaster
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

4. **Start Backend**
```bash
npm start
```

5. **Frontend**
Open `frontend/index.html` in your browser

## 📱 Usage

1. **Register** a new account
2. **Login** with your credentials
3. **Create** tasks with title and description
4. **Manage** tasks - edit, delete, mark as complete
5. **Enjoy** the beautiful, responsive interface!

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion

## � Project Structure

```
taskmaster-mern-stack/
├── backend/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── app.js          # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── css/style.css       # Styles
│   └── js/                 # JavaScript logic
└── README.md
```

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS configuration
- SQL injection prevention

## 📱 Responsive Design

- Mobile-first approach
- Tablet compatibility
- Desktop optimization
- Touch-friendly interface

## 🎨 UI/UX Features

- Modern gradient backgrounds
- Smooth animations and transitions
- Loading states and spinners
- Toast notifications
- Professional color scheme

## 🚀 Perfect for Interviews

This project demonstrates:
- ✅ Full-stack development skills
- ✅ RESTful API design
- ✅ Database integration
- ✅ Authentication systems
- ✅ Frontend expertise
- ✅ Security best practices
- ✅ Responsive design
- ✅ Clean code architecture

## � Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for demonstrating MERN stack skills!**
