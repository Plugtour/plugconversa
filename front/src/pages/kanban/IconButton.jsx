// caminho: front/src/pages/kanban/IconButton.jsx
export default function IconButton({ title, onClick, disabled, children }) {
  return (
    <button
      data-no-dnd="1"
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onMouseDownCapture={(e) => e.stopPropagation()}
      onTouchStartCapture={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      disabled={disabled}
      title={title}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: '1px solid #e6e6e6',
        background: disabled ? '#f6f6f6' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        color: '#111',
        opacity: disabled ? 0.7 : 1
      }}
    >
      {children}
    </button>
  )
}
// fim do caminho: front/src/pages/kanban/IconButton.jsx
