import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    setMessage("Settings saved successfully!");
    setTimeout(() => setMessage(null), 2500);
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
      <form style={{ marginTop: "2rem" }} onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="siteName" style={{ display: "block", marginBottom: ".5rem" }}>
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
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="adminEmail" style={{ display: "block", marginBottom: ".5rem" }}>
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
            }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            padding: ".75rem 1.5rem",
            borderRadius: 4,
            background: "#0070f3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Save Settings
        </button>
        {message && (
          <div
            style={{
              marginTop: "1rem",
              color: "#0070f3",
              background: "#f0f8ff",
              padding: ".5rem 1rem",
              borderRadius: 4,
              fontSize: ".95rem",
            }}
          >
            {message}
          </div>
        )}
      </form>
    </section>
  );
}
