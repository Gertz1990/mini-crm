import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mini_crm_clients_v1'

function loadClients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse clients from localStorage', e)
    return []
  }
}

function saveClients(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Failed to save clients to localStorage', e)
  }
}

export default function CRMApp() {
  const [clients, setClients] = useState(() => loadClients())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    saveClients(clients)
  }, [clients])

  // attempt to load from server on mount
  useEffect(() => {
    fetch('/clients')
      .then((r) => {
        if (!r.ok) throw new Error('no api')
        return r.json()
      })
      .then((data) => setClients(data))
      .catch(() => {
        // ignore if API not available
      })
  }, [])

  function addClient(e) {
    e?.preventDefault()
    setError('')
    if (!name.trim()) return setError('Имя обязательно')
    const newClient = {
      id: Date.now() + Math.random().toString(36).slice(2, 9),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    }
    // try send to server
    fetch('/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient),
    })
      .then((r) => {
        if (!r.ok) throw new Error('api error')
        return r.json()
      })
      .then((saved) => setClients((s) => [saved, ...s]))
      .catch(() => {
        setClients((s) => [newClient, ...s])
      })
    setName('')
    setEmail('')
    setPhone('')
  }

  function removeClient(id) {
    fetch(`/clients/${id}`, { method: 'DELETE' })
      .finally(() => {
        setClients((s) => s.filter((c) => c.id !== id))
      })
  }

  return (
    <div className="crm-app">
      <form className="crm-form" onSubmit={addClient}>
        <input
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button type="submit">Добавить</button>
      </form>
      {error && <div className="error">{error}</div>}
      <div className="client-list">
        {clients.length === 0 && <div className="empty">Нет клиентов, добавьте нового.</div>}
        {clients.map((c) => (
          <div key={c.id} className="client-item">
            <div className="info">
              <div className="name">{c.name}</div>
              <div className="contact">
                {c.email && <span>{c.email}</span>}
                {c.phone && <span>{c.phone}</span>}
              </div>
            </div>
            <button className="btn-delete" onClick={() => removeClient(c.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  )
}
