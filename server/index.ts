import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import router from './routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

app.use(express.json())
app.use('/api', router)

// Serve built client in production
app.use(express.static(path.resolve(__dirname, '../dist')))
app.get('/*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`🌽 Grain Market server running on http://localhost:${PORT}`)
})
