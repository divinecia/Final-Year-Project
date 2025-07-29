import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(adminEmail)) {
      setMessage("Please enter a valid email address.");
      setTimeout(() => setMessage(null), 2500);
      return;
    }
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setMessage("Settings saved successfully!");
      setLoading(false);
      setTimeout(() => setMessage(null), 2500);
    }, 1000);
  };

  return (
    <section
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: "2rem",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Admin Settings</h1>
      <p style={{ color: "#555" }}>Manage your application settings below.</p>
      <form style={{ marginTop: "2rem" }} onSubmit={handleSubmit} autoComplete="off">
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="siteName" style={{ display: "block", marginBottom: ".5rem", fontWeight: 500 }}>
            Site Name
          </label>
          <input
            id="siteName"
            type="text"
            placeholder="Enter site name"
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            style={{
              width: "100%",
              padding: ".5rem",
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
            required
            disabled={loading}
            maxLength={64}
          />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="adminEmail" style={{ display: "block", marginBottom: ".5rem", fontWeight: 500 }}>
            Admin Email
          </label>
          <input
            id="adminEmail"
            type="email"
            placeholder="Enter admin email"
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            style={{
              width: "100%",
              padding: ".5rem",
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
            required
            disabled={loading}
            maxLength={128}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: ".75rem 1.5rem",
            borderRadius: 4,
            background: loading ? "#b3d1f7" : "#0070f3",
            color: "#fff",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 500,
            minWidth: 120,
            transition: "background 0.2s",
          }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
        {message && (
          <div
            style={{
              marginTop: "1rem",
              color: message.includes("success") ? "#0070f3" : "#d32f2f",
              background: message.includes("success") ? "#f0f8ff" : "#fff0f0",
              padding: ".5rem 1rem",
              borderRadius: 4,
              fontSize: ".95rem",
              border: message.includes("success") ? "1px solid #b3d1f7" : "1px solid #f8bbbc",
            }}
            role="alert"
          >
            {message}
          </div>
        )}
      </form>
    </section>
  );
}
