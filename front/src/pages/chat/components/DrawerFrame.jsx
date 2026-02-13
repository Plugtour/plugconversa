// caminho: front/src/pages/chat/components/DrawerFrame.jsx
import { useEffect, useMemo, useState } from 'react'

function readCssPxVar(name, fallback) {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    const n = Number(String(raw).replace('px', '').trim())
    return Number.isFinite(n) && n > 0 ? n : fallback
  } catch {
    return fallback
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export default function DrawerFrame({
  open,
  kind,
  title,
  subtitle,
  onClose,
  children,
  showTopBar = true
}) {
  const [mounted, setMounted] = useState(open)
  // ✅ visible controla o transform, garantindo animação na abertura
  const [visible, setVisible] = useState(false)
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200))

  useEffect(() => {
    function onResize() {
      setVw(window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (open) {
      setMounted(true)
      // ✅ força o 1º paint "fechado" e no próximo frame abre animando
      requestAnimationFrame(() => setVisible(true))
      return
    }
    // ✅ fecha animando e só depois desmonta
    setVisible(false)
    const t = setTimeout(() => setMounted(false), 260)
    return () => clearTimeout(t)
  }, [open])

  const sizes = useMemo(() => {
    const listW = 500
    const threadMinW = 640
    return { listW, threadMinW }
  }, [])

  if (!mounted) return null

  const sidebarW = readCssPxVar('--pc-sidebar-w', 260)
  const isThread = kind === 'thread'

  const listW = sizes.listW
  const threadW = clamp(vw - sidebarW - listW, sizes.threadMinW, 9999)
  const panelW = isThread ? threadW : listW

  // posição base quando ABERTO
  const baseX = sidebarW + (isThread ? listW : 0)

  const xOpen = baseX
  const xClosed = baseX - panelW

  // ✅ usa visible em vez de open para o transform (abre sempre animando)
  const transformX = visible ? xOpen : xClosed

  const topBarH = showTopBar ? 64 : 0

  const rootStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: isThread ? 45 : 40,
    pointerEvents: 'none'
  }

  const backdropLeft = baseX + panelW
  const backdropStyle = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: `${backdropLeft}px`,
    right: 0,
    background: 'rgba(0,0,0,0.22)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 220ms ease',
    pointerEvents: visible ? 'auto' : 'none',
    zIndex: 0
  }

  const panelStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: `${panelW}px`,
    background: '#fff',
    borderRight: '1px solid #eee',
    boxShadow: '20px 0 50px rgba(0,0,0,0.10)',
    overflow: 'hidden',
    boxSizing: 'border-box',
    transform: `translateX(${transformX}px)`,
    transition: 'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    willChange: 'transform',
    zIndex: 1,
    pointerEvents: visible ? 'auto' : 'none'
  }

  return (
    <div style={rootStyle}>
      <div
        style={backdropStyle}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.()
        }}
      />

      <aside style={panelStyle} aria-hidden={!visible}>
        {showTopBar && (
          <div
            style={{
              height: 64,
              padding: '14px 14px 10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111', lineHeight: 1.1 }}>
                {title}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#6b6b6b' }}>{subtitle}</div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: '1px solid #eee',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ height: `calc(100vh - ${topBarH}px)`, overflow: 'hidden' }}>
          {children}
        </div>
      </aside>
    </div>
  )
}
// caminho: front/src/pages/chat/components/DrawerFrame.jsx
