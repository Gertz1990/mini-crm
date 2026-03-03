import { useEffect, useState } from 'react'
import { useRef } from 'react'

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
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editTags, setEditTags] = useState('')
  const [tags, setTags] = useState('') // comma-separated for new client
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('createdAt') // or 'name'
  const [sortDir, setSortDir] = useState('desc') // asc or desc
  const [page, setPage] = useState(0)
  const fileRef = useRef(null)

  useEffect(() => {
    saveClients(clients)
  }, [clients])

  // helpers
  function addClient(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Имя обязательно')
      return
    }
    const now = new Date().toISOString()
    const newClient = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: now,
    }
    setClients((prev) => [...prev, newClient])
    setName('')
    setEmail('')
    setPhone('')
    setTags('')
    setError('')
  }

  function removeClient(id) {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  function startEdit(client) {
    setEditingId(client.id)
    setEditName(client.name)
    setEditEmail(client.email || '')
    setEditPhone(client.phone || '')
    setEditTags((client.tags || []).join(','))
  }

  function saveEdit(id) {
    if (!editName.trim()) {
      setError('Имя обязательно')
      return
    }
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name: editName.trim(),
              email: editEmail.trim(),
              phone: editPhone.trim(),
              tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
            }
          : c
      )
    )
    cancelEdit()
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditEmail('')
    setEditPhone('')
    setEditTags('')
    setError('')
  }

  function exportJSON() {
    const data = JSON.stringify(clients, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `clients-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJSON(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const arr = JSON.parse(reader.result)
        if (Array.isArray(arr)) {
          setClients(arr)
        }
      } catch (err) {
        console.error('failed to import JSON', err)
      }
    }
    reader.readAsText(f)
    e.target.value = ''
  }

  function exportCSV() {
    const header = ['name','email','phone','tags','createdAt']
    const rows = clients.map(c => [c.name, c.email, c.phone, (c.tags||[]).join('|'), c.createdAt])
    const csv = [header, ...rows].map(r => r.map(v=>`"${v || ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `clients-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // derived list
  const filteredClients = clients
    .filter((c) => {
      if (!search) return true
      const term = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(term)))
      )
    })
    .sort((a, b) => {
      let va = a[sortKey] || ''
      let vb = b[sortKey] || ''
      if (sortKey === 'createdAt') {
        va = new Date(va).getTime()
        vb = new Date(vb).getTime()
      } else {
        va = va.toString().toLowerCase()
        vb = vb.toString().toLowerCase()
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const perPage = 10
  const start = page * perPage
  const paged = filteredClients.slice(start, start + perPage)
  const totalPages = Math.ceil(filteredClients.length / perPage)

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
        <input
          placeholder="Теги (через запятую)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit">Добавить</button>
      </form>
      {error && <div className="error">{error}</div>}

      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Поиск клиентов..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '6px', width: '100%', maxWidth: '200px' }}
        />
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          <option value="createdAt">Дата добавления</option>
          <option value="name">Имя</option>
        </select>
        <button className="filter-btn" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
          {sortDir === 'asc' ? '⬆︎' : '⬇︎'}
        </button>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <button className="filter-btn" onClick={exportJSON}>Экспорт JSON</button>
        <button className="filter-btn" onClick={exportCSV}>Экспорт CSV</button>
        <button className="filter-btn" onClick={() => fileRef.current?.click()}>Импорт JSON</button>
        <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={importJSON} />
      </div>

      <div className="client-list">
        {clients.length === 0 && <div className="empty">Нет клиентов, добавьте нового.</div>}
        {paged.map((c) => (
          <div key={c.id} className="client-item">
            <div className="info">
              {editingId === c.id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" />
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Телефон" />
                  <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Теги" />
                </>
              ) : (
                <>
                  <div className="name">{c.name}</div>
                  <div className="contact">
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span>{c.phone}</span>}
                  </div>
                  {c.tags && c.tags.length > 0 && (
                    <div className="tags">{c.tags.join(', ')}</div>
                  )}
                </>
              )}
            </div>
            {editingId === c.id ? (
              <>
                <button className="filter-btn" onClick={() => saveEdit(c.id)}>Сохранить</button>
                <button className="filter-btn" onClick={cancelEdit}>Отмена</button>
              </>
            ) : (
              <>
                <button className="btn-delete" onClick={() => removeClient(c.id)}>Удалить</button>
                <button className="filter-btn" onClick={() => startEdit(c)}>Изменить</button>
              </>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Назад</button>
          <span>Стр. {page + 1}/{totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Вперед</button>
        </div>
      )}
    </div>
  )
}
