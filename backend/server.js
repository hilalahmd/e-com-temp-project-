require('dotenv').config(); // Environment variables load cheyyunnu
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// HTTP server create cheyyunnu
const server = http.createServer(app);

// Socket.io setup cheyyunnu (Real-time updates-nu vendi)
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? ['https://yourproductiondomain.com'] 
            : ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// App-il io accessible aakan ithu set cheyyunnu (Route-kalil ninnu emit cheyyan)
app.set('io', io);

// Socket.io connection events handle cheyyunnu
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id); // Pudiya client connect aayappol

    // Store-specific room-il join cheyyunnu
    socket.on('join-store', (storeSlug) => {
        socket.join(`store_${storeSlug}`);
        console.log(`📡 Socket ${socket.id} joined room: store_${storeSlug}`);
    });

    // Client disconnect aakumpol
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// Database connect cheyyanulla function vilikkunnu
connectDB().then(() => {
    // Database connect aayal server start cheyyunnu
    server.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}).catch(err => {
    // Database connection pottiyal error kaanikkan
    console.error('Failed to start server:', err);
    process.exit(1);
});
