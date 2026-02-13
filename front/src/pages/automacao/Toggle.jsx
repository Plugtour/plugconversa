// caminho: front/src/pages/automacao/Toggle.jsx
export default function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      aria-pressed={checked}
      className={['autoToggle', checked ? 'autoToggleOn' : ''].filter(Boolean).join(' ')}
      style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <span className="autoToggleKnob" />
    </button>
  )
}

// arquivo: Toggle.jsx
// caminho: front/src/pages/automacao/Toggle.jsx
