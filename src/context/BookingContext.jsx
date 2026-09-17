import { createContext, useContext, useMemo, useState } from "react";
import config from "../config.js";

const BookingContext = createContext(null);

function fillTemplate(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}

const initialAppointments = [
  {
    id: "seed-1",
    customerName: "Julia Weber",
    phone: "0151 2345678",
    serviceId: config.services[0]?.id,
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "10:00",
    createdManually: true,
  },
  {
    id: "seed-2",
    customerName: "Markus Klein",
    phone: "0160 9876543",
    serviceId: config.services[1]?.id,
    date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    time: "14:00",
    createdManually: true,
  },
];

const initialReminderLogs = [
  {
    id: "log-seed-1",
    customerName: "Julia Weber",
    channel: "WhatsApp",
    sentAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    text: fillTemplate(config.messages.reminder24h, {
      customerName: "Julia Weber",
      time: "10:00",
      serviceName: config.services[0]?.name ?? "Termin",
      businessName: config.businessName,
    }),
  },
];

export function BookingProvider({ children }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [reminderLogs, setReminderLogs] = useState(initialReminderLogs);

  function getServiceById(id) {
    return config.services.find((s) => s.id === id);
  }

  function addAppointment({ customerName, phone, serviceId, date, time, createdManually = false }) {
    const id = `apt-${Date.now()}`;
    const appointment = { id, customerName, phone, serviceId, date, time, createdManually };
    setAppointments((prev) => [...prev, appointment]);

    const service = getServiceById(serviceId);

    // Bestätigung direkt nach Buchung simulieren
    const confirmationText = fillTemplate(config.messages.confirmation, {
      customerName,
      serviceName: service?.name ?? "",
      date: formatDate(date),
      time,
      businessName: config.businessName,
    });
    setReminderLogs((prev) => [
      {
        id: `log-${Date.now()}-confirm`,
        customerName,
        channel: "WhatsApp",
        type: "Bestätigung",
        sentAt: new Date().toISOString(),
        text: confirmationText,
      },
      ...prev,
    ]);

    // 24h-Erinnerung simulieren (wird "automatisch" protokolliert)
    const reminderText = fillTemplate(config.messages.reminder24h, {
      customerName,
      serviceName: service?.name ?? "",
      time,
      businessName: config.businessName,
    });
    setReminderLogs((prev) => [
      {
        id: `log-${Date.now()}-reminder`,
        customerName,
        channel: "WhatsApp",
        type: "Erinnerung (24h vorher)",
        sentAt: new Date().toISOString(),
        text: reminderText,
        simulatedFuture: true,
      },
      ...prev,
    ]);

    return appointment;
  }

  const value = useMemo(
    () => ({ appointments, reminderLogs, addAppointment, getServiceById }),
    [appointments, reminderLogs]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
