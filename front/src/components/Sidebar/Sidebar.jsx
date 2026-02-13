// caminho: front/src/components/Sidebar/Sidebar.jsx
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MENU_ITEMS } from './menuItems.js'

const baseAside = {
  padding: 16,
  borderRight: '1px solid #e8e8e8',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  overflow: 'hidden',
  boxSizing: 'border-box',

  position: 'sticky',
  top: 0,
  height: '100vh',
  zIndex: 50,
  flex: '0 0 auto',

  fontFamily: '"Nunito Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
}

const brandRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10
}

const brandText = {
  fontSize: 18,
  fontWeight: 800,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}

const navWrap = { display: 'grid', gap: 8 }

const MENU_COLORS = {
  idleBg: 'transparent',
  hoverBg: '#eef1f5',
  activeBg: '#e6ebf2',
  idleText: '#111',
  activeText: '#0b1220'
}

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    display: 'inline-block',
    flex: '0 0 auto'
  }

  const outline = {
    ...common,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }

  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <path d="M3.5 10.5 12 3.8l8.5 6.7" />
          <path d="M6 10.8V20h4.2v-5.4h3.6V20H18V10.8" />
        </svg>
      )

    case 'chat':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <path d="M20 14a4 4 0 0 1-4 4H9l-5 4V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4z" />
          <path d="M8 9h8" />
          <path d="M8 12h6" />
        </svg>
      )

    case 'kanban':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <rect x="4" y="5" width="6.5" height="14" rx="1.7" />
          <rect x="12.5" y="5" width="7.5" height="8.5" rx="1.7" />
          <path d="M12.5 16.5h7.5" />
        </svg>
      )

    case 'send':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <path d="M22 2 11 13" />
          <path d="M22 2 15.2 22l-4.2-9-9-4.2z" />
        </svg>
      )

    case 'users':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <path d="M9 11a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 9 11z" />
          <path d="M17 11a3 3 0 1 0-3-3" />
          <path d="M3.8 20.5a6.2 6.2 0 0 1 10.4 0" />
          <path d="M13.8 20.5a6.2 6.2 0 0 1 6.4 0" />
        </svg>
      )

    case 'bolt':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <path d="M13 2.5 4 14h7l-1 7.5L20 10h-7z" />
        </svg>
      )

    case 'campaign':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <path d="M4 11v2h3l7 4V7l-7 4z" />
          <path d="M16.8 9a4.2 4.2 0 0 1 0 6" />
          <path d="M6 15v3a2 2 0 0 0 2 2h1" />
        </svg>
      )

    case 'flow':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
          <path d="M10.5 7.25h3.2a2 2 0 0 1 2 2v4.25" />
          <path d="M13.5 16.75h-3.2a2 2 0 0 1-2-2V10.5" />
        </svg>
      )

    case 'settings':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <path d="M12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z" />
          <path d="M19 12a7.3 7.3 0 0 0-.1-1l1.9-1.4-1.7-3-2.2.9a7.8 7.8 0 0 0-1.6-.9l-.3-2.3H9l-.3 2.3c-.6.2-1.1.5-1.6.9l-2.2-.9-1.7 3L5.1 11a7.3 7.3 0 0 0 0 2l-1.9 1.4 1.7 3 2.2-.9c.5.4 1 .7 1.6.9L9 19.7h6l.3-2.3c.6-.2 1.1-.5 1.6-.9l2.2.9 1.7-3L18.9 13c.07-.33.1-.66.1-1z" />
        </svg>
      )

    case 'support':
      return (
        <svg viewBox="0 0 24 24" style={outline} aria-hidden="true">
          <path d="M4 12a8 8 0 0 1 16 0" />
          <path d="M4 12v3.5A2.5 2.5 0 0 0 6.5 18H8v-6H6.5" />
          <path d="M20 12v3.5A2.5 2.5 0 0 1 17.5 18H16v-6h1.5" />
          <path d="M12 18v2" />
        </svg>
      )

    default:
      return <span style={{ ...common, fontWeight: 900, textAlign: 'center' }}>•</span>
  }
}

function Label({ collapsed, children }) {
  return (
    <span
      style={{
        flex: 1,
        minWidth: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        opacity: collapsed ? 0 : 1,
        transform: collapsed ? 'translateX(-6px)' : 'translateX(0px)',
        transition: 'opacity 160ms ease, transform 220ms ease',
        pointerEvents: collapsed ? 'none' : 'auto'
      }}
    >
      {children}
    </span>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const settingsItem = useMemo(() => MENU_ITEMS.find((x) => x.key === 'config'), [])
  const isOnSettings = useMemo(() => {
    const p = location?.pathname || ''
    return p.startsWith('/configuracoes')
  }, [location?.pathname])

  const [settingsOpen, setSettingsOpen] = useState(isOnSettings)

  const width = collapsed ? 74 : 260

  // ✅ seta a largura real do menu em CSS variable global
  useEffect(() => {
    document.documentElement.style.setProperty('--pc-sidebar-w', `${width}px`)
  }, [width])

  return (
    <aside
      style={{
        ...baseAside,
        width,
        transition: 'width 260ms cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    >
      <style>{`
        .pc-navlink {
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: ${MENU_COLORS.idleText};
          background: ${MENU_COLORS.idleBg};
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          justify-content: flex-start;
          transition: background 180ms ease, color 180ms ease, padding 220ms ease, gap 220ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .pc-navlink:hover { background: ${MENU_COLORS.hoverBg}; }
        .pc-navlink.is-active { background: ${MENU_COLORS.activeBg}; color: ${MENU_COLORS.activeText}; }
        .pc-navlink.is-collapsed { padding: 10px 10px; gap: 0px; justify-content: center; }

        .pc-childlink {
          padding: 8px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: ${MENU_COLORS.idleText};
          background: ${MENU_COLORS.idleBg};
          display: block;
          font-weight: 600;
          margin-left: 22px;
          transition: background 180ms ease, color 180ms ease;
        }
        .pc-childlink:hover { background: ${MENU_COLORS.hoverBg}; }
        .pc-childlink.is-active { background: ${MENU_COLORS.activeBg}; color: ${MENU_COLORS.activeText}; }
        .pc-childlink.is-collapsed { display: none; }

        .pc-settingsbtn {
          padding: 10px 12px;
          border-radius: 10px;
          color: ${MENU_COLORS.idleText};
          background: ${MENU_COLORS.idleBg};
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          justify-content: flex-start;
          transition: background 180ms ease, color 180ms ease, padding 220ms ease, gap 220ms ease;
          border: none;
          cursor: pointer;
          width: 100%;
        }
        .pc-settingsbtn:hover { background: ${MENU_COLORS.hoverBg}; }
        .pc-settingsbtn.is-active { background: ${MENU_COLORS.activeBg}; color: ${MENU_COLORS.activeText}; }
        .pc-settingsbtn.is-collapsed { padding: 10px 10px; gap: 0px; justify-content: center; }
      `}</style>

      <div style={brandRow}>
        <div style={brandText} title="PlugConversa">
          {collapsed ? 'PC' : 'PlugConversa'}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          style={{
            border: '1px solid #e8e8e8',
            background: '#fff',
            borderRadius: 10,
            padding: '8px 10px',
            cursor: 'pointer',
            fontWeight: 800
          }}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <nav style={navWrap}>
        {MENU_ITEMS.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0

          if (!hasChildren) {
            return (
              <NavLink
                key={item.key}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  ['pc-navlink', isActive ? 'is-active' : '', collapsed ? 'is-collapsed' : '']
                    .filter(Boolean)
                    .join(' ')
                }
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: collapsed ? 0 : 10,
                    width: '100%'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Icon name={item.icon} />
                  </span>
                  <Label collapsed={collapsed}>{item.label}</Label>
                </span>
              </NavLink>
            )
          }

          return (
            <div key={item.key} style={{ display: 'grid', gap: 8 }}>
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                title={collapsed ? item.label : undefined}
                className={['pc-settingsbtn', isOnSettings ? 'is-active' : '', collapsed ? 'is-collapsed' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Icon name={item.icon} />
                </span>

                {!collapsed && (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ flex: 1, minWidth: 0 }}>{item.label}</span>
                    <span
                      style={{
                        opacity: 0.85,
                        transform: settingsOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 200ms ease'
                      }}
                    >
                      ▾
                    </span>
                  </span>
                )}
              </button>

              <div
                style={{
                  display: collapsed ? 'none' : 'grid',
                  gap: 8,
                  maxHeight: settingsOpen ? 600 : 0,
                  overflow: 'hidden',
                  opacity: settingsOpen ? 1 : 0,
                  transform: settingsOpen ? 'translateY(0px)' : 'translateY(-6px)',
                  transition:
                    'max-height 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease, transform 220ms ease'
                }}
              >
                {(settingsItem?.children || []).map((child) => (
                  <NavLink
                    key={child.key}
                    to={child.to}
                    className={({ isActive }) =>
                      ['pc-childlink', isActive ? 'is-active' : '', collapsed ? 'is-collapsed' : '']
                        .filter(Boolean)
                        .join(' ')
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      <div style={{ marginTop: 'auto', fontSize: 12, color: '#666' }}>
        {collapsed ? <span title="Backend: localhost:3000">API</span> : <>Backend: <b>localhost:3000</b></>}
      </div>
    </aside>
  )
}

// arquivo: Sidebar.jsx
