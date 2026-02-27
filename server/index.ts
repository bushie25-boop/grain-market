import express from 'express';
import path from 'path';
import { registerRoutes } from './routes.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

app.use(express.json());

registerRoutes(app);

if (process.env.NODE_ENV === 'production') {
  const publicDir = path.resolve(process.cwd(), 'dist/public');
  app.use(express.static(publicDir));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.resolve(publicDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌽 Grain Market running on port ${PORT}`);
});
