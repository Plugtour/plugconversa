// caminho: front/src/pages/chat/components/ThreadDrawer.jsx
import DrawerFrame from './DrawerFrame.jsx'
import ThreadSidePanel from './ThreadSidePanel.jsx'

function IconPaperclip(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 12.5l-8.2 8.2a5.5 5.5 0 01-7.8-7.8l9.2-9.2a3.5 3.5 0 015 5l-9.5 9.5a1.5 1.5 0 11-2.1-2.1l8.8-8.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSettings(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19.4 15a7.9 7.9 0 000-6l2-1.2-2-3.4-2.3 1a8 8 0 00-5.2-2l-.4-2.5H9.5L9 3.4a8 8 0 00-5.2 2l-2.3-1-2 3.4 2 1.2a7.9 7.9 0 000 6l-2 1.2 2 3.4 2.3-1a8 8 0 005.2 2l.4 2.5h3l.5-2.5a8 8 0 005.2-2l2.3 1 2-3.4-2-1.2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSmile(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 10.2h.01M15.5 10.2h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M8.6 14.2c.9 1.2 2.1 1.8 3.4 1.8s2.5-.6 3.4-1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ThreadDrawer({ open, conversation, onClose }) {
  return (
    <DrawerFrame
      open={open}
      kind="thread"
      showTopBar={false} // ✅ sem topo do DrawerFrame (não duplica header nem cria X extra)
      onClose={onClose} // ✅ fecha pelo backdrop e pelo X do painel lateral
    >
      <div className="pcThreadSplit">
        <div className="pcThreadMain">
          <div className="pcThreadHeader">
            <div className="pcThreadHeader__left">
              <div className="pcThreadAvatar">{conversation?.name?.charAt(0) || 'C'}</div>

              <div className="pcThreadHeaderInfo">
                <div className="pcThreadHeaderName">{conversation?.name || 'Conversa'}</div>
                <div className="pcThreadHeaderStatus">WhatsApp • Atendimento humano</div>
                <div className="pcThreadHeaderOnline">Online agora</div>
              </div>
            </div>

            <div className="pcThreadHeaderActions">
              <button className="pcIconBtn" type="button" title="Anexos" aria-label="Anexos">
                <IconPaperclip />
              </button>

              <button className="pcIconBtn" type="button" title="Configurações" aria-label="Configurações">
                <IconSettings />
              </button>

              {/* ✅ sem botão X aqui */}
            </div>
          </div>

          <div className="pcThreadMessages">
            <div className="pcThreadPlaceholder">
              <div className="pcThreadPlaceholder__title">Área de mensagens</div>
              <div className="pcThreadPlaceholder__subtitle">
                Aqui entrarão mensagens do lead via WhatsApp (API oficial), histórico completo e envio em tempo real.
              </div>
            </div>
          </div>

          <div className="pcThreadInputBar">
            <button className="pcIconBtn" type="button" aria-label="Emojis" title="Emojis">
              <IconSmile />
            </button>

            <input type="text" placeholder="Digite uma mensagem..." className="pcThreadInput" disabled />

            <button className="pcSendBtn" type="button">
              Enviar
            </button>
          </div>
        </div>

        {/* ✅ aqui é onde o X do painel lateral fecha o modal 2 */}
        <ThreadSidePanel conversation={conversation} onClose={onClose} />
      </div>
    </DrawerFrame>
  )
}
// caminho: front/src/pages/chat/components/ThreadDrawer.jsx
