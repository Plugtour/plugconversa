// caminho: front/src/pages/contatos/ContactsToolbar.jsx
export default function ContactsToolbar({
  searchValue,
  onSearchChange,
  onImport,
  onDownload,
  onCreate
}) {
  return (
    <div className="pcTopbar">
      <button className="pcBtn pcBtnGreen" type="button" onClick={onImport}>
        Importar Contatos <span className="pcBtnIcon">⤴</span>
      </button>

      <button className="pcBtn pcBtnGreen" type="button" onClick={onDownload}>
        Baixe Relatório <span className="pcBtnIcon">⤓</span>
      </button>

      <button className="pcBtn pcBtnGreenSolid" type="button" onClick={onCreate}>
        Criar Contato <span className="pcBtnIcon">👤</span>
      </button>

      <div className="pcSearch">
        <input
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Busca"
        />
        <span className="pcSearchIcon">🔍</span>
      </div>
    </div>
  )
}
// fim: front/src/pages/contatos/ContactsToolbar.jsx
