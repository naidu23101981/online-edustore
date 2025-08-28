// src/app.ts
import express from 'express';
import authRoutes from './modules/auth/auth.routes';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('Server is running on port 3000'));
