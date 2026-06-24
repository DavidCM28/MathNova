import express from 'express';
import cors from 'cors';
import syncRoutes from './routes/syncRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', syncRoutes);
app.use('/api/auth', authRoutes);

// Base health route
app.get('/', (req, res) => {
  res.send('MathNova API server is running.');
});

export default app;