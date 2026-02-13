// caminho: front/src/app/AppRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout.jsx'

import Dashboard from '../pages/Dashboard.jsx'
import Contatos from '../pages/Contatos.jsx'
import Kanban from '../pages/Kanban.jsx'
import Campanhas from '../pages/Campanhas.jsx'
import Mensagens from '../pages/Mensagens.jsx'
import Chat from '../pages/Chat.jsx'

import DisparoEmMassa from '../pages/DisparoEmMassa.jsx'
import FluxoDeConversa from '../pages/FluxoDeConversa.jsx'
import Automacao from '../pages/Automacao.jsx'
import Conversas from '../pages/Conversas.jsx'
import Suporte from '../pages/Suporte.jsx'

// Configurações
import ConfiguracoesLayout from '../pages/configuracoes/ConfiguracoesLayout.jsx'
import ConfiguracoesHome from '../pages/configuracoes/ConfiguracoesHome.jsx'
import ConfigConexao from '../pages/configuracoes/Conexao.jsx'
import ConfigCampos from '../pages/configuracoes/Campos.jsx'
import ConfigEtiquetas from '../pages/configuracoes/Etiquetas.jsx'
import ConfigRespostasRapidas from '../pages/configuracoes/RespostasRapidas.jsx'
import ConfigAgentes from '../pages/configuracoes/Agentes.jsx'
import ConfigHorarios from '../pages/configuracoes/Horarios.jsx'
import ConfigFluxosPadroes from '../pages/configuracoes/FluxosPadroes.jsx'
import ConfigCompanhia from '../pages/configuracoes/Companhia.jsx'
import ConfigRegistros from '../pages/configuracoes/Registros.jsx'
import ConfigFaturamento from '../pages/configuracoes/Faturamento.jsx'
import ConfigIntegracoes from '../pages/configuracoes/Integracoes.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contatos" element={<Contatos />} />

        {/* CHAT (conversas em tempo real) */}
        <Route path="/chat" element={<Chat />} />

        {/* (opcional) manter a antiga rota em outra URL */}
        <Route path="/conversas" element={<Conversas />} />

        {/* automações */}
        <Route path="/automacao" element={<Automacao />} />

        {/* kanban */}
        <Route path="/crm-kanban" element={<Kanban />} />
        <Route path="/kanban" element={<Navigate to="/crm-kanban" replace />} />

        <Route path="/campanhas" element={<Campanhas />} />
        <Route path="/mensagens" element={<Mensagens />} />

        <Route path="/disparo-em-massa" element={<DisparoEmMassa />} />

        {/* construtor de robôs */}
        <Route path="/fluxo-de-conversa" element={<FluxoDeConversa />} />

        {/* suporte */}
        <Route path="/suporte" element={<Suporte />} />

        {/* Configurações */}
        <Route path="/configuracoes" element={<ConfiguracoesLayout />}>
          <Route index element={<ConfiguracoesHome />} />
          <Route path="conexao" element={<ConfigConexao />} />
          <Route path="campos" element={<ConfigCampos />} />
          <Route path="etiquetas" element={<ConfigEtiquetas />} />
          <Route path="respostas-rapidas" element={<ConfigRespostasRapidas />} />
          <Route path="agentes" element={<ConfigAgentes />} />
          <Route path="horarios" element={<ConfigHorarios />} />
          <Route path="fluxos-padroes" element={<ConfigFluxosPadroes />} />
          <Route path="companhia" element={<ConfigCompanhia />} />
          <Route path="registros" element={<ConfigRegistros />} />
          <Route path="faturamento" element={<ConfigFaturamento />} />
          <Route path="integracoes" element={<ConfigIntegracoes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
// arquivo: AppRouter.jsx
