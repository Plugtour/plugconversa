// caminho: front/src/pages/fluxoDeConversa/components/FolderPill.jsx
export default function FolderPill({ label, count }) {
  return (
    <button type="button" className="fc-folderPill">
      <span className="fc-folderIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="fc-folderSvg">
          <path d="M3.5 7.2c0-1.1.9-2 2-2h4l1.6 1.6h7.4c1.1 0 2 .9 2 2v8.6c0 1.1-.9 2-2 2H5.5c-1.1 0-2-.9-2-2V7.2z" />
        </svg>
      </span>

      <span className="fc-folderLabel">{label}</span>

      <span className="fc-folderRight">
        <span className="fc-folderCount">{count}</span>
        <span className="fc-kebab" aria-hidden="true">⋮</span>
      </span>
    </button>
  )
}

// arquivo: FolderPill.jsx
