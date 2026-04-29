import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4173

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos desde dist con caché
app.use(express.static(join(__dirname, 'dist'), {
  maxAge: '1h',
  etag: false
}))

// Proxy para /api al backend
app.use('/api', async (req, res) => {
  try {
    const backendUrl = `http://localhost:3000${req.originalUrl}`
    
    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        host: 'localhost:3000'
      }
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body)
      options.headers['content-type'] = 'application/json'
    }

    const response = await fetch(backendUrl, options)
    const data = await response.text()

    res.status(response.status)
    response.headers.forEach((value, name) => {
      if (name !== 'content-encoding' && name !== 'content-length') {
        res.setHeader(name, value)
      }
    })
    res.send(data)
  } catch (err) {
    console.error('API error:', err)
    res.status(503).json({ error: 'Backend unavailable' })
  }
})

// SPA fallback: servir index.html para todas las demás rutas
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'), {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor en puerto ${PORT}`)
})
