import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4173

// Servir archivos estáticos desde dist
app.use(express.static(join(__dirname, 'dist')))

// Proxy para /api
app.use('/api', (req, res, next) => {
  // Redirigir a backend
  const backendUrl = `http://localhost:3000${req.url}`
  
  fetch(backendUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
  })
    .then(response => {
      res.status(response.status)
      response.headers.forEach((value, name) => {
        res.setHeader(name, value)
      })
      response.text().then(body => res.send(body))
    })
    .catch(err => {
      res.status(500).json({ error: 'Backend unavailable' })
    })
})

// SPA fallback: servir index.html para todas las rutas
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`✅ App servidor en http://localhost:${PORT}`)
})
