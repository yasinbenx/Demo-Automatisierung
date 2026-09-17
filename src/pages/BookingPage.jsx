import { useMemo, useState } from "react";
import config from "../config.js";
import { useBooking } from "../context/BookingContext.jsx";
import { getUpcomingDays, getSlotsForDay, toDateKey } from "../utils/slots.js";
import WhatsAppPreview from "../components/WhatsAppPreview.jsx";

const STEPS = { SERVICE: 0, SLOT: 1, FORM: 2, DONE: 3 };

export default function BookingPage() {
  const { addAppointment, appointments, getServiceById } = useBooking();
  const [step, setStep] = useState(STEPS.SERVICE);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const days = useMemo(() => getUpcomingDays(7), []);
  const slots = useMemo(() => getSlotsForDay(), []);

  const bookedTimesForDay = useMemo(() => {
    if (!selectedDate) return new Set();
    const key = toDateKey(selectedDate);
    return new Set(appointments.filter((a) => a.date === key).map((a) => a.time));
  }, [appointments, selectedDate]);

  function handleSelectService(id) {
    setSelectedServiceId(id);
    setStep(STEPS.SLOT);
  }

  function handleSelectSlot() {
    if (selectedDate && selectedTime) setStep(STEPS.FORM);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    const appointment = addAppointment({
      customerName: form.name.trim(),
      phone: form.phone.trim(),
      serviceId: selectedServiceId,
      date: toDateKey(selectedDate),
      time: selectedTime,
    });
    setConfirmedAppointment(appointment);
    setStep(STEPS.DONE);
  }

  function restart() {
    setStep(STEPS.SERVICE);
    setSelectedServiceId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setForm({ name: "", phone: "" });
    setConfirmedAppointment(null);
  }

  const selectedService = selectedServiceId ? getServiceById(selectedServiceId) : null;

  return (
    <div className="page booking-page">
      <section className="hero">
        <h1>{config.businessName}</h1>
        <p className="hero__tagline">{config.tagline}</p>
        <p className="hero__address">📍 {config.address}</p>
      </section>

      <ol className="stepper">
        <li className={step >= STEPS.SERVICE ? "active" : ""}>1. Leistung</li>
        <li className={step >= STEPS.SLOT ? "active" : ""}>2. Termin</li>
        <li className={step >= STEPS.FORM ? "active" : ""}>3. Kontakt</li>
        <li className={step >= STEPS.DONE ? "active" : ""}>4. Bestätigung</li>
      </ol>

      {step === STEPS.SERVICE && (
        <div className="services-grid">
          {config.services.map((service) => (
            <button
              key={service.id}
              className="service-card"
              onClick={() => handleSelectService(service.id)}
            >
              <h3>{service.name}</h3>
              <div className="service-card__meta">
                <span>⏱ {service.duration}</span>
                <span className="service-card__price">{service.price}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === STEPS.SLOT && (
        <div className="slot-picker">
          <button className="link-back" onClick={() => setStep(STEPS.SERVICE)}>
            ← Andere Leistung wählen
          </button>
          <h2>Wähle einen Termin für {selectedService?.name}</h2>

          <div className="day-picker">
            {days.map((day) => {
              const key = toDateKey(day);
              const isSelected = selectedDate && toDateKey(selectedDate) === key;
              return (
                <button
                  key={key}
                  className={`day-chip ${isSelected ? "day-chip--selected" : ""}`}
                  onClick={() => {
                    setSelectedDate(day);
                    setSelectedTime(null);
                  }}
                >
                  <span className="day-chip__weekday">
                    {day.toLocaleDateString("de-DE", { weekday: "short" })}
                  </span>
                  <span className="day-chip__date">
                    {day.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="time-picker">
              {slots.map((time) => {
                const isBooked = bookedTimesForDay.has(time);
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    disabled={isBooked}
                    className={`time-chip ${isSelected ? "time-chip--selected" : ""}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                    {isBooked && <span className="time-chip__badge">belegt</span>}
                  </button>
                );
              })}
            </div>
          )}

          <button
            className="btn btn--primary"
            disabled={!selectedDate || !selectedTime}
            onClick={handleSelectSlot}
          >
            Weiter
          </button>
        </div>
      )}

      {step === STEPS.FORM && (
        <form className="booking-form" onSubmit={handleSubmit}>
          <button type="button" className="link-back" onClick={() => setStep(STEPS.SLOT)}>
            ← Termin ändern
          </button>
          <h2>Fast geschafft!</h2>
          <div className="booking-summary">
            <p>
              <strong>{selectedService?.name}</strong> ({selectedService?.duration})
            </p>
            <p>
              {selectedDate?.toLocaleDateString("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
              })}{" "}
              um {selectedTime} Uhr
            </p>
            <p className="booking-summary__price">{selectedService?.price}</p>
          </div>

          <label>
            Name
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Vor- und Nachname"
            />
          </label>
          <label>
            Telefonnummer
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="0151 23456789"
            />
          </label>

          <button type="submit" className="btn btn--primary">
            Termin verbindlich buchen
          </button>
        </form>
      )}

      {step === STEPS.DONE && confirmedAppointment && (
        <div className="confirmation">
          <div className="confirmation__check">✓</div>
          <h2>Termin bestätigt!</h2>
          <p>
            Danke, {confirmedAppointment.customerName}! Ihr Termin für{" "}
            <strong>{selectedService?.name}</strong> am{" "}
            {selectedDate?.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} um{" "}
            {selectedTime} Uhr ist gebucht.
          </p>

          <WhatsAppPreview
            label="So sieht Ihre Bestätigungsnachricht aus:"
            text={confirmedAppointment.confirmationText}
          />

          <p className="confirmation__note">
            📲 {config.ownerName} sendet Ihnen automatisch 24h vorher eine
            Erinnerung per WhatsApp — damit garantiert nichts vergessen wird.
          </p>

          <button className="btn btn--ghost" onClick={restart}>
            Weiteren Termin buchen
          </button>
        </div>
      )}
    </div>
  );
}
