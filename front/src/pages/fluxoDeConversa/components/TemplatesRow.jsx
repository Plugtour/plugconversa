// caminho: front/src/pages/fluxoDeConversa/components/TemplatesRow.jsx
const items = [
  { id: 't1', label: 'Fluxo de boas vindas' },
  { id: 't2', label: 'Selecionar existente' },
  { id: 't3', label: 'Criar novo' },
  { id: 't4', label: 'Fluxo padrão para mídia' },
  { id: 't5', label: 'Fluxo Pós-Atendimento' }
]

export default function TemplatesRow() {
  return (
    <div className="fc-templates">
      {items.map((it) => (
        <button key={it.id} type="button" className="fc-templateBtn">
          {it.label}
        </button>
      ))}
    </div>
  )
}

// arquivo: TemplatesRow.jsx
