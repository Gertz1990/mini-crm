import { useState } from 'react'

export default function DashboardHeader({ visibleModules, onToggleModule }) {
  const [showDropdown, setShowDropdown] = useState(false)

  const modules = [
    { key: 'formPanel', label: '📋 Форма добавления' },
    { key: 'filterPanel', label: '🔍 Поиск и фильтры' },
    { key: 'statsPanel', label: '📊 Статистика' },
    { key: 'clientListPanel', label: '👥 Список клиентов' },
    { key: 'smsBroadcastPanel', label: '📤 SMS Рассылка' }
  ]

  return (
    <div className="app-header" style={{ position: 'relative', marginBottom: '2rem', paddingBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📊 Mini CRM Dashboard</h1>
        <div style={{ position: 'relative' }}>
          <button
            className="filter-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              backgroundColor: showDropdown ? 'var(--color-primary)' : 'var(--color-bg)',
              color: showDropdown ? '#fff' : 'var(--color-text)',
              borderColor: showDropdown ? 'var(--color-primary)' : 'var(--color-border)'
            }}
          >
            ☑️ Модули ▼
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'var(--color-bg)',
                border: `1px solid var(--color-border)`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                zIndex: 1000,
                minWidth: '220px',
                marginTop: '8px'
              }}
            >
              {modules.map((module) => (
                <label
                  key={module.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <input
                    type="checkbox"
                    checked={visibleModules[module.key]}
                    onChange={(e) => {
                      onToggleModule(module.key)
                    }}
                    style={{ marginRight: '10px', cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <span style={{ flex: 1 }}>{module.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
