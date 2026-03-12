import { useState, useMemo } from 'react'

export default function SMSBroadcastPanel({
  clients,
  history,
  templates,
  selectedClients,
  currentMessage,
  onMessageChange,
  onSelectedClientsChange,
  onAddHistory,
  onAddTemplate,
  onDeleteTemplate,
  onClearHistory,
}) {
  const [searchClient, setSearchClient] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const filteredClients = useMemo(() => {
    if (!searchClient.trim()) return clients
    const term = searchClient.toLowerCase()
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
    )
  }, [clients, searchClient])

  const selectedClientsData = filteredClients.filter((c) =>
    selectedClients.includes(c.id)
  )

  const handleSelectAll = () => {
    const allIds = filteredClients.map((c) => c.id)
    onSelectedClientsChange(allIds)
  }

  const handleClearSelection = () => {
    onSelectedClientsChange([])
  }

  const handleToggleClient = (clientId) => {
    if (selectedClients.includes(clientId)) {
      onSelectedClientsChange(selectedClients.filter((id) => id !== clientId))
    } else {
      onSelectedClientsChange([...selectedClients, clientId])
    }
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Пожалуйста, введите название шаблона')
      return
    }
    if (!currentMessage.trim()) {
      alert('Пожалуйста, напишите сообщение')
      return
    }
    const newTemplate = {
      id: Date.now(),
      name: templateName,
      message: currentMessage,
      createdAt: new Date().toISOString(),
    }
    onAddTemplate(newTemplate)
    setTemplateName('')
    alert(`Шаблон "${templateName}" сохранён`)
  }

  const handleLoadTemplate = (e) => {
    const templateId = parseInt(e.target.value)
    if (templateId) {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        onMessageChange(template.message)
        setSelectedTemplate(templateId)
      }
    }
  }

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) {
      alert('Выберите шаблон для удаления')
      return
    }
    if (window.confirm('Вы уверены? Этот шаблон будет удалён навсегда.')) {
      onDeleteTemplate(selectedTemplate)
      setSelectedTemplate('')
    }
  }

  const previewVariables = /\{\{(\w+)\}\}/g
  let previewCount = 0
  const previews = selectedClientsData.slice(0, 2).map((client) => {
    let preview = currentMessage
    let match
    while ((match = previewVariables.exec(currentMessage)) !== null) {
      const varName = match[1]
      const value = client[varName] || `[${varName}]`
      preview = preview.replace(`{{${varName}}}`, value)
    }
    return { client: client.name, preview }
  })

  const handleSendBroadcast = () => {
    if (!currentMessage.trim()) {
      alert('Пожалуйста, напишите сообщение')
      return
    }
    if (selectedClients.length === 0) {
      alert('Пожалуйста, выберите хотя бы одного клиента')
      return
    }

    const broadcast = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: currentMessage,
      recipientCount: selectedClients.length,
      recipients: selectedClientsData,
      status: 'sent',
    }

    onAddHistory(broadcast)
    onSelectedClientsChange([])
    alert(`✓ Рассылка отправлена ${selectedClients.length} клиентам`)
  }

  const handleClearHistoryClick = () => {
    if (
      window.confirm(
        'Вы уверены? История всех рассылок будет удалена навсегда.'
      )
    ) {
      onClearHistory()
      alert('История очищена')
    }
  }

  return (
    <div className="panel-container">
      <div className="drag-handle">
        <span className="panel-title">📤 SMS Рассылка</span>
        <div className="drag-handle-icon"></div>
      </div>

      <div className="panel-content">
        <div className="sms-section">
          <h3>📝 Сообщение</h3>
          <textarea
            className="sms-message-input"
            value={currentMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Введите сообщение... Используйте {{name}} и {{phone}} для персонализации"
            rows="4"
          />
          <div className="sms-char-count">
            {currentMessage.length} символов
            {currentMessage.length > 160 ? ' ⚠️ ' : ''}
          </div>
          <div className="sms-variables">
            <span>📌 Доступные переменные:</span>
            <span className="sms-var-badge">{'{{name}}'}</span>
            <span className="sms-var-badge">{'{{phone}}'}</span>
            <span className="sms-var-badge">{'{{email}}'}</span>
          </div>

          {previews.length > 0 && (
            <div className="sms-preview">
              <h4>👁️ Превью для выбранных клиентов:</h4>
              {previews.map((p, idx) => (
                <div key={idx} className="sms-preview-card">
                  <strong>{p.client}:</strong> {p.preview}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sms-section">
          <h3>👥 Выбор клиентов</h3>
          <input
            type="text"
            className="sms-search"
            placeholder="Поиск клиентов..."
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
          />
          <div className="sms-selection-controls">
            <button
              className="filter-btn"
              onClick={handleSelectAll}
            >
              Выбрать всех
            </button>
            <button
              className="filter-btn"
              onClick={handleClearSelection}
            >
              Очистить
            </button>
            <span className="sms-count">
              Выбрано: {selectedClients.length} из {filteredClients.length}
            </span>
          </div>

          <div className="sms-clients-grid">
            {filteredClients.length === 0 ? (
              <p className="sms-empty">Клиентов не найдено</p>
            ) : (
              filteredClients.map((client) => (
                <div key={client.id} className="sms-client-item">
                  <input
                    type="checkbox"
                    id={`client-${client.id}`}
                    checked={selectedClients.includes(client.id)}
                    onChange={() => handleToggleClient(client.id)}
                  />
                  <label htmlFor={`client-${client.id}`}>
                    <strong>{client.name}</strong>
                    <span className="sms-contact">
                      {client.phone && <span>☎️ {client.phone}</span>}
                    </span>
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sms-section">
          <h3>💾 Шаблоны</h3>
          <div className="sms-template-save">
            <input
              type="text"
              className="sms-template-input"
              placeholder="Название нового шаблона"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <button className="filter-btn" onClick={handleSaveTemplate}>
              Сохранить шаблон
            </button>
          </div>

          {templates.length > 0 && (
            <div className="sms-template-load">
              <select
                className="sms-template-select"
                value={selectedTemplate}
                onChange={handleLoadTemplate}
              >
                <option value="">-- Загрузить шаблон --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button className="filter-btn filter-btn-red" onClick={handleDeleteTemplate}>
                Удалить
              </button>
            </div>
          )}

          {templates.length === 0 && (
            <p className="sms-empty">Нет сохранённых шаблонов</p>
          )}
        </div>

        <div className="sms-section">
          <div className="sms-send-controls">
            <button
              className="sms-send-btn"
              onClick={handleSendBroadcast}
              disabled={selectedClients.length === 0}
            >
              📤 Отправить рассылку ({selectedClients.length})
            </button>
          </div>
        </div>

        <div className="sms-section">
          <h3>📋 История рассылок</h3>
          {history.length === 0 ? (
            <p className="sms-empty">История рассылок пуста</p>
          ) : (
            <>
              <button
                className="filter-btn filter-btn-red"
                onClick={handleClearHistoryClick}
              >
                Очистить историю
              </button>
              <div className="sms-history-table">
                {history.map((entry) => (
                  <div key={entry.id} className="sms-history-row">
                    <div className="sms-history-time">
                      {new Date(entry.timestamp).toLocaleString('ru-RU')}
                    </div>
                    <div className="sms-history-count">👥 {entry.recipientCount}</div>
                    <div className="sms-history-message">
                      {entry.message.length > 50
                        ? entry.message.substring(0, 50) + '...'
                        : entry.message}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
