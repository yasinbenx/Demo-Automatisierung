import { useMemo, useState } from "react";
import config from "../config.js";
import { useBooking } from "../context/BookingContext.jsx";
import StatTile from "../components/StatTile.jsx";
import WhatsAppPreview from "../components/WhatsAppPreview.jsx";
import { getSlotsForDay } from "../utils/slots.js";

function AddAppointmentForm({ onClose }) {
  const { addAppointment } = useBooking();
  const slots = useMemo(() => getSlotsForDay(), []);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    serviceId: config.services[0]?.id ?? "",
    date: new Date().toISOString().slice(0, 10),
    time: slots[0] ?? "09:00",
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    addAppointment({
      customerName: form.name.trim(),
      phone: form.phone.trim(),
      serviceId: form.serviceId,
      date: form.date,
      time: form.time,
      createdManually: true,
    });
    onClose();
  }

  return (
    <form className="add-appointment-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </label>
      <label>
        Telefon
        <input
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </label>
      <label>
        Leistung
        <select
          value={form.serviceId}
          onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))}
        >
          {config.services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className="add-appointment-form__row">
        <label>
          Datum
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </label>
        <label>
          Uhrzeit
          <select value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}>
            {slots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="add-appointment-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn--primary">
          Termin speichern
        </button>
      </div>
    </form>
  );
}

export default function DashboardPage() {
  const { appointments, reminderLogs, getServiceById } = useBooking();
  const [showForm, setShowForm] = useState(false);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [appointments]
  );

  const upcomingCount = sortedAppointments.length;

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Willkommen zurück, {config.ownerName} 👋</h1>
          <p>Hier ist dein Überblick für {config.businessName}.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Schließen" : "+ Termin hinzufügen"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Neuen Termin manuell eintragen</h3>
          <AddAppointmentForm onClose={() => setShowForm(false)} />
        </div>
      )}

      <div className="stats-grid">
        <StatTile
          icon="🛡️"
          value={config.stats.noShowsPrevented}
          label="No-Shows vermieden"
          hint="dank automatischer Erinnerungen"
        />
        <StatTile
          icon="💰"
          value={config.stats.revenueSaved}
          label="gerettete Umsatzeinbußen"
          hint="durch verhinderte No-Shows"
        />
        <StatTile
          icon="📲"
          value={config.stats.remindersSent}
          label="Erinnerungen versendet"
          hint="automatisch per WhatsApp"
        />
        <StatTile icon="📅" value={upcomingCount} label="anstehende Termine" />
      </div>

      <div className="dashboard-columns">
        <div className="card">
          <h3>Terminübersicht</h3>
          {sortedAppointments.length === 0 && <p className="empty-state">Noch keine Termine.</p>}
          <ul className="appointment-list">
            {sortedAppointments.map((a) => {
              const service = getServiceById(a.serviceId);
              return (
                <li key={a.id} className="appointment-list__item">
                  <div className="appointment-list__date">
                    <span>
                      {new Date(a.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                    </span>
                    <span>{a.time}</span>
                  </div>
                  <div className="appointment-list__info">
                    <strong>{a.customerName}</strong>
                    <span>
                      {service?.name} · {a.phone}
                    </span>
                  </div>
                  {a.createdManually && <span className="tag">manuell</span>}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card">
          <h3>Erinnerungs-Protokoll</h3>
          <p className="card__subtitle">
            Automatisch simulierter Versand von Bestätigungen &amp; 24h-Erinnerungen.
          </p>
          <ul className="reminder-log">
            {reminderLogs.map((log) => (
              <li key={log.id} className="reminder-log__item">
                <div className="reminder-log__meta">
                  <span className="reminder-log__type">{log.type ?? "Erinnerung"}</span>
                  <span className="reminder-log__time">
                    {new Date(log.sentAt).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p>
                  {log.simulatedFuture ? "🕒 " : "✅ "}
                  Erinnerung an <strong>{log.customerName}</strong> gesendet
                  {log.simulatedFuture ? " – 24h vor Termin" : " – Bestätigung nach Buchung"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {reminderLogs[0] && (
        <div className="card">
          <h3>Beispiel-Nachricht</h3>
          <WhatsAppPreview text={reminderLogs[0].text} />
        </div>
      )}
    </div>
  );
}
