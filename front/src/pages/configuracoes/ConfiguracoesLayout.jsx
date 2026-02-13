// caminho: front/src/pages/configuracoes/ConfiguracoesLayout.jsx
import { NavLink, Outlet, useLocation } from 'react-router-dom'

export default function ConfiguracoesLayout() {
  const location = useLocation()

  const items = [
    { to: '/configuracoes/conexao', label: 'Conexão' },
    { to: '/configuracoes/campos', label: 'Campos' },
    { to: '/configuracoes/etiquetas', label: 'Etiquetas' },
    { to: '/configuracoes/respostas-rapidas', label: 'Respostas rápidas' },
    { to: '/configuracoes/agentes', label: 'Agentes' },
    { to: '/configuracoes/horarios', label: 'Horários' },
    { to: '/configuracoes/fluxos-padroes', label: 'Fluxos padrão' },
    { to: '/configuracoes/companhia', label: 'Companhia' },
    { to: '/configuracoes/registros', label: 'Registros' },
    { to: '/configuracoes/faturamento', label: 'Faturamento' },
    { to: '/configuracoes/integracoes', label: 'Integrações' }
  ]

  // quando entrar em /configuracoes (home), deixa a lista visível e sem colapsar
  const isHome = (location?.pathname || '') === '/configuracoes'

  const itemStyle = (isActive) => ({
    display: 'block',
    padding: '8px 10px',
    borderRadius: 10,
    textDecoration: 'none',
    fontWeight: isActive ? 800 : 600,
    color: '#111',
    background: isActive ? 'rgba(0,0,0,0.06)' : 'transparent',
    transition: 'background 160ms ease'
  })

  return (
    <div className="page" style={{ padding: 'var(--page-padding)' }}>
      {/* Header da área */}
      <div className="pageHeader">
        <div className="pageHeader__left">
          <h1 className="pageTitle">Configurações</h1>
          <p className="pageSubtitle">Selecione um item no menu ao lado</p>
        </div>
      </div>

      {/* Menu discreto + conteúdo */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: 'var(--space-6)',
          alignItems: 'start'
        }}
      >
        <aside
          style={{
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            paddingTop: 2
          }}
        >
          <div style={{ display: 'grid', gap: 4 }}>
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                style={({ isActive }) => itemStyle(isActive)}
              >
                {it.label}
              </NavLink>
            ))}
          </div>
        </aside>

        <div style={{ minWidth: 0 }}>
          {/* Se cair no /configuracoes (home), mostramos o Outlet mesmo assim (pode ser a home atual) */}
          <Outlet />
          {isHome ? null : null}
        </div>
      </div>
    </div>
  )
}
// arquivo: ConfiguracoesLayout.jsx
