import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '3000');

app.use(express.json());

registerRoutes(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../dist/public')));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist/public/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌽 Grain Market running on port ${PORT}`);
});
