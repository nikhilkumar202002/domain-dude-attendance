require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const http = require('http'); // Import HTTP
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');
// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// --- SOCKET.IO SETUP ---
const server = http.createServer(app); // Wrap Express app
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your React Frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

let onlineUsers = new Map();

io.on('connection', (socket) => {
    // When frontend connects, they send their UserID
    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User connected: ${userId}`);
    });

    socket.on('disconnect', () => {
        // Remove user when they close the tab
        for (let [key, value] of onlineUsers.entries()) {
            if (value === socket.id) onlineUsers.delete(key);
        }
    });
});

// Make 'io' and 'onlineUsers' available to your routes
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// --- ROUTES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));// <--- Add this line
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/works', require('./routes/workRoutes'));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});