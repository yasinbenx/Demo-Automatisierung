export default function WhatsAppPreview({ text, label }) {
  return (
    <div className="whatsapp-preview">
      {label && <div className="whatsapp-preview__label">{label}</div>}
      <div className="whatsapp-preview__bubble-wrap">
        <div className="whatsapp-preview__bubble">
          <p>{text}</p>
          <span className="whatsapp-preview__time">
            {new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} ✓✓
          </span>
        </div>
      </div>
    </div>
  );
}
