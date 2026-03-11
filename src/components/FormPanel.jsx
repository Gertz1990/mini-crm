import { useState } from 'react'

export default function FormPanel({ onAddClient, error, onErrorChange }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tags, setTags] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onAddClient({ name, email, phone, tags })
    setName('')
    setEmail('')
    setPhone('')
    setTags('')
  }

  return (
    <div className="panel-container">
      <div className="drag-handle">
        <span className="panel-title">📋 Добавить клиента</span>
        <div className="drag-handle-icon"></div>
      </div>
      <div className="panel-content">
        {error && <div className="error">{error}</div>}
        <form className="crm-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0, backgroundColor: 'transparent' }}>
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
          <button type="submit">✚ Добавить клиента</button>
        </form>
      </div>
    </div>
  )
}
