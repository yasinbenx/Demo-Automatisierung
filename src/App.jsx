import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import config from "./config.js";
import { shade, withAlpha } from "./utils/color.js";
import { BookingProvider } from "./context/BookingContext.jsx";
import Header from "./components/Header.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

export default function App() {
  useEffect(() => {
    document.title = `${config.businessName} · Online-Buchung`;
    const root = document.documentElement;
    root.style.setProperty("--color-primary", config.primaryColor);
    root.style.setProperty(
      "--color-primary-dark",
      config.secondaryColor || shade(config.primaryColor, -0.25)
    );
    root.style.setProperty("--color-primary-light", withAlpha(config.primaryColor, 0.12));
    root.style.setProperty("--color-primary-soft", withAlpha(config.primaryColor, 0.28));
  }, []);

  return (
    <BookingProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p>
          {config.businessName} · {config.address} · {config.phone}
        </p>
        <p className="site-footer__demo-note">
          Demo-Anwendung — alle Daten sind simuliert und werden nicht dauerhaft gespeichert.
        </p>
      </footer>
    </BookingProvider>
  );
}
