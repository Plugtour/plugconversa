// caminho: front/src/app/Layout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar.jsx'

export default function Layout() {
  const [sidebarW, setSidebarW] = useState(260)

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#fafafa',
        alignItems: 'stretch',
        // variável global usada no Chat (drawer atrás do menu)
        '--pc-sidebar-w': `${sidebarW}px`
      }}
    >
      <Sidebar onWidthChange={setSidebarW} />

      <main
        style={{
          flex: 1,
          padding: 18,
          minWidth: 0,
          overflow: 'auto'
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
