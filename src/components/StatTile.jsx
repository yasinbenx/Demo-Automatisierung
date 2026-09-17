export default function StatTile({ icon, label, value, hint }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__icon">{icon}</div>
      <div className="stat-tile__value">{value}</div>
      <div className="stat-tile__label">{label}</div>
      {hint && <div className="stat-tile__hint">{hint}</div>}
    </div>
  );
}
