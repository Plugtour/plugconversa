// caminho: front/src/pages/fluxoDeConversa/components/SearchBox.jsx
export default function SearchBox({ value, onChange }) {
  return (
    <div className="fc-search">
      <input
        className="fc-searchInput"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Busca"
      />
      <span className="fc-searchIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="fc-searchSvg">
          <circle cx="11" cy="11" r="6.2" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
      </span>
    </div>
  )
}

// arquivo: SearchBox.jsx
