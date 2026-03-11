import { useMemo } from 'react'

export default function StatisticsPanel({ clients, onResetLayout }) {
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const thisMonthCount = clients.filter(
      (c) => new Date(c.createdAt) >= thisMonth
    ).length
    const thisWeekCount = clients.filter(
      (c) => new Date(c.createdAt) >= weekAgo
    ).length

    const tagCounts = {}
    clients.forEach((c) => {
      (c.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return { total: clients.length, thisMonthCount, thisWeekCount, topTags }
  }, [clients])

  return (
    <div className="panel-container">
      <div className="drag-handle">
        <span className="panel-title">📊 Статистика</span>
        <div className="drag-handle-icon"></div>
      </div>
      <div className="panel-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              Всего клиентов
            </div>
            <div style={{ fontSize: '2em', fontWeight: '700', color: 'var(--color-primary)' }}>
              {stats.total}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                За месяц
              </div>
              <div style={{ fontSize: '1.5em', fontWeight: '600', color: 'var(--color-primary)' }}>
                {stats.thisMonthCount}
              </div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                За неделю
              </div>
              <div style={{ fontSize: '1.5em', fontWeight: '600', color: 'var(--color-primary)' }}>
                {stats.thisWeekCount}
              </div>
            </div>
          </div>

          {stats.topTags.length > 0 && (
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text)' }}>
                Популярные теги
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stats.topTags.map(([tag, count]) => (
                  <div key={tag} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>• {tag}</span>
                    <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="filter-btn"
            onClick={onResetLayout}
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-primary)',
              marginTop: '8px',
              width: '100%'
            }}
          >
            🔄 Сбросить макет
          </button>
        </div>
      </div>
    </div>
  )
}
