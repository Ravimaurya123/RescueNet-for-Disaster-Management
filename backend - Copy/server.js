require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);

// Connect to Database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://rescuenet-frontend.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

// Configure Socket.io
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Real-time connection established:', socket.id);

  socket.on('updateAgencyLocation', async (data) => {
    // Broadcast instantly to all connected clients
    io.emit('agencyLocationUpdated', data);
    
    // Save live location to database securely in background
    try {
      const Agency = require('./models/Agency');
      if(data.agencyId && data.lat && data.lng) {
        await Agency.findByIdAndUpdate(data.agencyId, { 
          'location.lat': data.lat, 
          'location.lng': data.lng 
        });
      }
    } catch(err) {
      console.error('Socket DB Error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Real-time connection closed:', socket.id);
  });
});

app.use(express.json());

// Logging in development
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/agencies', require('./routes/agencies'));
app.use('/api/incidents', require('./routes/incidents'));

// Production setup: Serve static frontend files
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Disaster Management API is running' });
  });
}

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
