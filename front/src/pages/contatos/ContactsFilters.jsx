// caminho: front/src/pages/contatos/ContactsFilters.jsx
const TAGS = [
  'MANUAL-VINICIUS',
  'FLUXO-ATENDIMENTO',
  'COMERCIAL',
  'PROSPECÇÃO-MANUAL',
  'RECEPTIVO',
  'APRESENTAÇÃO-REALIZADA',
  'PASSEIOS-E-TRANSFERS',
  'EMISSIVO',
  'RECEPTIVO-E-EMISSIVO',
  'Agendados',
  'FORMULÁRIO-SITE',
  'INGRESSOS',
  'MARKETPLACE',
  'NENHUMA-DAS-OPÇÕES',
  'SEM-INTERESSE',
  'APENAS-PASSEIO',
  'FUROU-REUNIÃO',
  'Insistir apresentação',
  'LEAD-QUENTE',
  'RECEPTIVO-CHILE'
]

export default function ContactsFilters() {
  return (
    <aside className="pcSide">
      <h3 className="pcSideTitle">Mais popular</h3>
      <div className="pcSideHint">
        (Use o botão &quot;Filtros&quot; para filtrar etiquetas menos populares)
      </div>

      <div className="pcSideSectionLabel">ETIQUETAS</div>

      <div className="pcTagList">
        {TAGS.map((t) => (
          <div key={t} className="pcTag" title={t}>
            {t}
          </div>
        ))}
      </div>

      <div className="pcSmallDivider" />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <div className="pcSideSectionLabel">SEQUÊNCIAS</div>
        <div className="pcSideHint">NENHUM ITEM</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <div className="pcSideSectionLabel">CAMPANHAS</div>
        <div className="pcSideHint">NENHUM ITEM</div>
      </div>
    </aside>
  )
}
// fim: front/src/pages/contatos/ContactsFilters.jsx
