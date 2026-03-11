import { useState } from 'react'

export default function ClientListPanel({
  clients,
  page,
  totalPages,
  onPageChange,
  onEditClient,
  onSaveEdit,
  onCancelEdit,
  onRemoveClient,
  editingId,
  editName,
  editEmail,
  editPhone,
  editTags,
  onEditNameChange,
  onEditEmailChange,
  onEditPhoneChange,
  onEditTagsChange
}) {
  return (
    <div className="panel-container">
      <div className="drag-handle">
        <span className="panel-title">👥 Список клиентов</span>
        <div className="drag-handle-icon"></div>
      </div>
      <div className="panel-content">
        <div className="client-list">
          {clients.length === 0 && <div className="empty">Нет клиентов, добавьте новых.</div>}
          {clients.map((c) => (
            <div key={c.id} className="client-item">
              <div className="info">
                {editingId === c.id ? (
                  <>
                    <input value={editName} onChange={(e) => onEditNameChange(e.target.value)} />
                    <input value={editEmail} onChange={(e) => onEditEmailChange(e.target.value)} placeholder="Email" />
                    <input value={editPhone} onChange={(e) => onEditPhoneChange(e.target.value)} placeholder="Телефон" />
                    <input value={editTags} onChange={(e) => onEditTagsChange(e.target.value)} placeholder="Теги" />
                  </>
                ) : (
                  <>
                    <div className="name">{c.name}</div>
                    <div className="contact">
                      {c.email && <span>📧 {c.email}</span>}
                      {c.phone && <span>📱 {c.phone}</span>}
                    </div>
                    {c.tags && c.tags.length > 0 && (
                      <div className="tags">{c.tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}</div>
                    )}
                  </>
                )}
              </div>
              {editingId === c.id ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="filter-btn" onClick={() => onSaveEdit(c.id)} style={{ backgroundColor: 'var(--color-success)', color: '#fff', border: 'none' }}>✅ Сохранить</button>
                  <button className="filter-btn" onClick={onCancelEdit}>❌ Отмена</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-delete" onClick={() => onRemoveClient(c.id)}>🗑️ Удалить</button>
                  <button className="filter-btn" onClick={() => onEditClient(c)}>✏️ Изменить</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '16px', marginBottom: 0, padding: 0, backgroundColor: 'transparent', borderRadius: 0 }}>
            <button disabled={page <= 0} onClick={() => onPageChange(page - 1)}>← Назад</button>
            <span>Страница {page + 1} из {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>Вперед →</button>
          </div>
        )}
      </div>
    </div>
  )
}
