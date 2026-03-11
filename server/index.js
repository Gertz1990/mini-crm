/* global process */
import express from 'express'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const DATA_FILE = path.resolve('./server/clients.json')

app.use(express.json())

// Serve static files from the React app
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

function loadClients() {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

function saveClients(clients) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(clients, null, 2))
}

app.get('/clients', (req, res) => {
  const clients = loadClients()
  res.json(clients)
})

app.post('/clients', (req, res) => {
  const { name, email, phone } = req.body
  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }
  const clients = loadClients()
  const newClient = { id: uuidv4(), name, email: email||'', phone: phone||'' }
  clients.unshift(newClient)
  saveClients(clients)
  res.status(201).json(newClient)
})

app.delete('/clients/:id', (req, res) => {
  const { id } = req.params
  let clients = loadClients()
  const before = clients.length
  clients = clients.filter((c) => c.id !== id)
  if (clients.length === before) {
    return res.status(404).json({ error: 'Client not found' })
  }
  saveClients(clients)
  res.status(204).end()
})

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`)
})
