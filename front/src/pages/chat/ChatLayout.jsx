// caminho: front/src/pages/chat/ChatLayout.jsx
export default function ChatLayout({ onOpenList }) {
  return (
    <div className="pcChatShell">
      <button type="button" className="pcChatOpenZone" onClick={onOpenList}>
        <div className="pcChatOpenZone__kicker">Painel de chat</div>
        <div className="pcChatOpenZone__title">Abrir conversas</div>
        <div className="pcChatOpenZone__subtitle">
          Aqui você vai acompanhar atendimentos, histórico e mensagens do WhatsApp.
          Clique para abrir a listagem.
        </div>
      </button>

      <div className="pcChatCanvas" />
    </div>
  )
}
// caminho: front/src/pages/chat/ChatLayout.jsx