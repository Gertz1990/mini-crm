import { useState, useRef } from 'react'

export default function FilterPanel({
  onSearchChange,
  onSortKeyChange,
  onSortDirChange,
  onExportJSON,
  onExportCSV,
  onImportJSON,
  search,
  sortKey,
  sortDir
}) {
  const fileRef = useRef(null)

  return (
    <div className="panel-container">
      <div className="drag-handle">
        <span className="panel-title">🔍 Поиск и фильтры</span>
        <div className="drag-handle-icon"></div>
      </div>
      <div className="panel-content">
        <div className="filter-section" style={{ flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
          <input
            placeholder="Поиск клиентов..."
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={sortKey} onChange={(e) => onSortKeyChange(e.target.value)}>
              <option value="createdAt">Дата добавления</option>
              <option value="name">Имя</option>
            </select>
            <button className="filter-btn" onClick={() => onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc')} title="Изменить порядок сортировки">
              {sortDir === 'asc' ? '↑ ASC' : '↓ DESC'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="filter-btn" onClick={onExportJSON}>📥 JSON</button>
            <button className="filter-btn" onClick={onExportCSV}>📥 CSV</button>
            <button className="filter-btn" onClick={() => fileRef.current?.click()}>📤 Импорт</button>
          </div>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={onImportJSON} />
        </div>
      </div>
    </div>
  )
}
