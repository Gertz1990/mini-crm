import { useEffect, useState, useRef } from 'react'
import GridLayout from 'react-grid-layout'
import FormPanel from './components/FormPanel'
import FilterPanel from './components/FilterPanel'
import ClientListPanel from './components/ClientListPanel'
import StatisticsPanel from './components/StatisticsPanel'
import DashboardHeader from './components/DashboardHeader'

const STORAGE_KEY = 'mini_crm_clients_v1'
const LAYOUT_STORAGE_KEY = 'mini_crm_layout_v1'
const VISIBILITY_STORAGE_KEY = 'mini_crm_visibility_v1'

const DEFAULT_LAYOUT = [
  { x: 0, y: 0, w: 6, h: 4, i: 'form-panel', minW: 4, minH: 2 },
  { x: 6, y: 0, w: 6, h: 4, i: 'filter-panel', minW: 4, minH: 2 },
  { x: 0, y: 4, w: 4, h: 3, i: 'stats-panel', minW: 3, minH: 2 },
  { x: 4, y: 4, w: 8, h: 5, i: 'client-list-panel', minW: 5, minH: 3 }
]

const DEFAULT_VISIBILITY = {
  formPanel: true,
  filterPanel: true,
  statsPanel: true,
  clientListPanel: true
}

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

function loadLayout() {
  try {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY)
    return saved && Array.isArray(JSON.parse(saved)) ? JSON.parse(saved) : DEFAULT_LAYOUT
  } catch (e) {
    console.warn('Layout load failed, using defaults', e)
    return DEFAULT_LAYOUT
  }
}

function loadVisibility() {
  try {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_VISIBILITY
  } catch (e) {
    console.warn('Visibility load failed, using defaults', e)
    return DEFAULT_VISIBILITY
  }
}

export default function CRMApp() {
  const [clients, setClients] = useState(() => loadClients())
  const [layout, setLayout] = useState(() => loadLayout())
  const [visibleModules, setVisibleModules] = useState(() => loadVisibility())
  const [containerWidth, setContainerWidth] = useState(window.innerWidth - 60)

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth - 60)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    saveClients(clients)
  }, [clients])

  // Persist layout to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
    } catch (e) {
      console.error('Failed to save layout', e)
    }
  }, [layout])

  // Persist visibility to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibleModules))
    } catch (e) {
      console.error('Failed to save visibility', e)
    }
  }, [visibleModules])

  // helpers
  function addClient(clientData) {
    if (!clientData.name.trim()) {
      setError('Имя обязательно')
      return
    }
    const now = new Date().toISOString()
    const newClient = {
      id: Date.now(),
      name: clientData.name.trim(),
      email: clientData.email.trim(),
      phone: clientData.phone.trim(),
      tags: clientData.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: now,
    }
    setClients((prev) => [...prev, newClient])
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

  const handleResetLayout = () => {
    setLayout(DEFAULT_LAYOUT)
    localStorage.removeItem(LAYOUT_STORAGE_KEY)
  }

  const handleToggleModule = (moduleKey) => {
    setVisibleModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }))
  }

  const perPage = 10
  const start = page * perPage
  const paged = filteredClients.slice(start, start + perPage)
  const totalPages = Math.ceil(filteredClients.length / perPage)

  return (
    <div className="app-root">
      <DashboardHeader visibleModules={visibleModules} onToggleModule={handleToggleModule} />

      <GridLayout
        className="react-grid-layout"
        layout={layout}
        onLayoutChange={setLayout}
        cols={12}
        rowHeight={50}
        width={containerWidth}
        containerPadding={[0, 0]}
        margin={[10, 10]}
        draggableHandle=".drag-handle"
        isResizable={true}
        isDraggable={true}
        compactType="vertical"
        preventCollision={false}
      >
        {visibleModules.formPanel && (
          <div key="form-panel" className="react-grid-item">
            <FormPanel
              onAddClient={addClient}
              error={error}
              onErrorChange={setError}
            />
          </div>
        )}

        {visibleModules.filterPanel && (
          <div key="filter-panel" className="react-grid-item">
            <FilterPanel
              search={search}
              onSearchChange={setSearch}
              sortKey={sortKey}
              onSortKeyChange={setSortKey}
              sortDir={sortDir}
              onSortDirChange={setSortDir}
              onExportJSON={exportJSON}
              onExportCSV={exportCSV}
              onImportJSON={importJSON}
            />
          </div>
        )}

        {visibleModules.statsPanel && (
          <div key="stats-panel" className="react-grid-item">
            <StatisticsPanel clients={clients} onResetLayout={handleResetLayout} />
          </div>
        )}

        {visibleModules.clientListPanel && (
          <div key="client-list-panel" className="react-grid-item">
            <ClientListPanel
              clients={paged}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onEditClient={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onRemoveClient={removeClient}
              editingId={editingId}
              editName={editName}
              editEmail={editEmail}
              editPhone={editPhone}
              editTags={editTags}
              onEditNameChange={setEditName}
              onEditEmailChange={setEditEmail}
              onEditPhoneChange={setEditPhone}
              onEditTagsChange={setEditTags}
            />
          </div>
        )}
      </GridLayout>
    </div>
  )
}
