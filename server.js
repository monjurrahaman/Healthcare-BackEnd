import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import models from './models/index.js';
import { adminJs, adminRouter } from './database_admin.js';
// Import routes
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import doctorRoutes from './routes/doctors.js';
import appointmentRoutes from './routes/appointments.js';
import prescriptionRoutes from './routes/prescriptions.js';
import labRoutes from './routes/labs.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/admin', adminRoutes);



// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediConnect API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MediConnect API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});
app.use(adminJs.options.rootPath, adminRouter);
// 404 handler - FIXED: Use explicit pattern
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Database synchronization and server start
const startServer = async () => {
  try {
    // Test database connection
    await models.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database (use { force: true } only in development to reset tables)
    await models.sequelize.sync({ 
      force: process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true' 
    });
    console.log('✅ Database synchronized successfully.');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 MediConnect server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  await models.sequelize.close();
  console.log('✅ Database connection closed.');
  process.exit(0);
});

// Start the application
startServer();

export default app;