// caminho: front/src/pages/chat/components/ThreadSidePanel.jsx
import { useState } from 'react'
import '../threadSidePanel.css'

function Field({ label, placeholder }) {
  return (
    <label className="pcSideField">
      <span className="pcSideField__label">{label}</span>
      <input className="pcSideField__input" placeholder={placeholder} />
    </label>
  )
}

function Section({ title, children }) {
  return (
    <div className="pcSideSection">
      <div className="pcSideSection__title">{title}</div>
      <div className="pcSideSection__body">{children}</div>
    </div>
  )
}

const TABS = [
  { key: 'dados', label: 'Dados' },
  { key: 'acoes', label: 'Ações' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'arquivos', label: 'Arquivos' }
]

export default function ThreadSidePanel({ conversation, onClose }) {
  const [tab, setTab] = useState('dados')

  return (
    <aside className="pcThreadSide" aria-label="Painel lateral">
      <div className="pcSideTop">
        {/* ✅ abas + fechar na mesma linha (sem título “Dados”) */}
        <div className="pcSideTopRow">
          <div className="pcSideTabs" role="tablist" aria-label="Abas do painel">
            {TABS.map((t) => {
              const active = t.key === tab
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active ? 'true' : 'false'}
                  className={`pcSideTab ${active ? 'isActive' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="pcSideCloseBtn"
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar"
          >
            ×
          </button>
        </div>
      </div>

      <div className="pcThreadSide__scroll">
        {tab === 'dados' && (
          <>
            <Section title="Cliente">
              <Field label="Nome do cliente" placeholder={`Ex: ${conversation?.name || 'Renan Lemos'}`} />
              <Field label="Telefone" placeholder="Ex: (11) 99999-9999" />
              <Field label="E-mail" placeholder="Ex: contato@empresa.com" />
              <Field label="Preço do CRM" placeholder="Ex: R$ 197/mês" />
            </Section>

            <Section title="Status e organização">
              {/* (mantemos aqui como você já tinha) */}
              <div className="pcSideTagsRow">
                <span className="pcTag pcTag--agent">Todos</span>
                <span className="pcTag pcTag--status">Em atendimento</span>
                <span className="pcTag pcTag--lead">Lead morno</span>
              </div>
            </Section>
          </>
        )}

        {tab === 'acoes' && (
          <>
            <Section title="Orçamento">
              <button className="pcSideBtn" type="button">
                Criar orçamento
              </button>
              <button className="pcSideBtn pcSideBtn--ghost" type="button">
                Ver últimos orçamentos
              </button>
            </Section>

            <Section title="Reserva">
              <Field label="Link de reserva" placeholder="Cole aqui o link" />
              <div className="pcSideRow">
                <button className="pcSideBtn pcSideBtn--ghost" type="button">
                  Copiar
                </button>
                <button className="pcSideBtn" type="button">
                  Enviar no chat
                </button>
              </div>
            </Section>

            <Section title="PDF / Arquivo">
              <button className="pcSideBtn" type="button">
                Enviar PDF
              </button>
              <button className="pcSideBtn pcSideBtn--ghost" type="button">
                Selecionar modelo
              </button>
            </Section>

            <Section title="Notas internas">
              <textarea className="pcSideTextarea" placeholder="Anotações internas (não vai para o cliente)..." />
              <button className="pcSideBtn" type="button">
                Salvar nota
              </button>
            </Section>
          </>
        )}

        {tab === 'agenda' && (
          <>
            <Section title="Agendar disparo">
              <Field label="Data" placeholder="dd/mm/aaaa" />
              <Field label="Hora" placeholder="00:00" />
              <Field label="Mensagem" placeholder="Ex: Retornar com proposta" />
              <button className="pcSideBtn" type="button">
                Agendar
              </button>
            </Section>

            <Section title="Período">
              <Field label="Início" placeholder="dd/mm/aaaa" />
              <Field label="Fim" placeholder="dd/mm/aaaa" />
              <button className="pcSideBtn pcSideBtn--ghost" type="button">
                Aplicar filtro
              </button>
            </Section>
          </>
        )}

        {tab === 'arquivos' && (
          <>
            <Section title="Arquivos enviados">
              <div className="pcSideMuted">Em breve: lista de PDFs e anexos enviados nessa conversa.</div>
            </Section>

            <Section title="Histórico">
              <div className="pcSideMuted">
                Em breve: registros (orçamentos gerados, links enviados, agendamentos, mudanças de status).
              </div>
            </Section>
          </>
        )}
      </div>
    </aside>
  )
}
// caminho: front/src/pages/chat/components/ThreadSidePanel.jsx
