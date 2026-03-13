require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:8080', 'https://webnario.vercel.app'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const chatRoutes = require('./routes/chat');
const forgotPasswordRoutes = require('./routes/forgotPassword');
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ----- Socket.IO Real-time Chat -----
const { getProjectById } = require('./lib/projectQueries');
const { createMessage } = require('./lib/chatQueries');

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // { id, email, name, isAdmin }
        next();
    } catch {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.email}`);

    // Client joins a room for a specific project
    socket.on('join_room', async ({ projectId }) => {
        try {
            const project = await getProjectById(projectId);
            if (!project) return;
            if (project.adminDecision !== 'Accepted') return;
            // Only allow the project owner or admin
            if (!socket.user.isAdmin && project.clientEmail !== socket.user.email) return;
            socket.join(projectId);
            console.log(`👥 ${socket.user.email} joined room ${projectId}`);
        } catch (err) {
            console.error('join_room error:', err.message);
        }
    });

    // Client or admin sends a message
    socket.on('send_message', async ({ projectId, text }) => {
        try {
            if (!text || !text.trim()) return;
            const project = await getProjectById(projectId);
            if (!project || project.adminDecision !== 'Accepted') return;
            if (!socket.user.isAdmin && project.clientEmail !== socket.user.email) return;

            const msg = await createMessage({
                projectId,
                senderEmail: socket.user.email,
                senderName: socket.user.name,
                isAdmin: socket.user.isAdmin,
                text: text.trim(),
            });

            // Emit to everyone in the room (including sender)
            io.to(projectId).emit('receive_message', {
                _id: msg._id,
                projectId,
                senderEmail: msg.senderEmail,
                senderName: msg.senderName,
                isAdmin: msg.isAdmin,
                text: msg.text,
                timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toISOString(),
            });
        } catch (err) {
            console.error('send_message error:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.user.email}`);
    });
});

// Seed admin user on startup (if not exists)
const seedAdmin = async () => {
    const { findByEmail, createUser } = require('./lib/userQueries');
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@webnario.com';
    try {
        const existing = await findByEmail(adminEmail);
        if (!existing) {
            const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
            await createUser({ name: 'Admin', email: adminEmail, password: hashed, is_admin: true });
            console.log('✅ Admin user seeded:', adminEmail);
        } else {
            console.log('ℹ️  Admin user already exists');
        }
    } catch (err) {
        console.error('❌ Admin seed error:', err.message);
    }
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await seedAdmin();
});
