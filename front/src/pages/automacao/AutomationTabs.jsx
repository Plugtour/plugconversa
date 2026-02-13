// caminho: front/src/pages/automacao/AutomationTabs.jsx
export default function AutomationTabs({ value, onChange }) {
  const tabs = [
    { key: 'palavras', label: 'Palavras Chave', icon: '🏷️' },
    { key: 'sequencias', label: 'Sequências', icon: '🔗' },
    { key: 'webhooks', label: 'Webhooks', icon: '🪝' }
  ]

  return (
    <div className="autoTabs">
      {tabs.map((t) => {
        const active = t.key === value
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange?.(t.key)}
            className={['autoTabBtn', active ? 'autoTabBtnActive' : ''].filter(Boolean).join(' ')}
          >
            <span style={{ fontSize: 14, opacity: active ? 1 : 0.9 }}>{t.icon}</span>
            <span style={{ fontSize: 13 }}>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// arquivo: AutomationTabs.jsx
// caminho: front/src/pages/automacao/AutomationTabs.jsx
