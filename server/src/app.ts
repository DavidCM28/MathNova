import express from 'express';
import cors from 'cors';
import syncRoutes from './routes/syncRoutes';
import authRoutes from './routes/authRoutes';
import proporcionalidadRoutes from './routes/proporcionalidadRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', syncRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/proporcionalidad', proporcionalidadRoutes);

app.get('/', (req, res) => {
  res.send('MathNova API server is running.');
});

export default app;