import express from 'express';
import cors from 'cors';
import scanRoutes from './routes/scan';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', scanRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
