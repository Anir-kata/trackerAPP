"use client";

import type { ChangeEventHandler } from "react";
import { useState } from "react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    try {
      const data = await api.exportJson();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "frostbitten-export.json";
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Export JSON telecharge.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur export");
    }
  };

  const handleImport: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const payload = JSON.parse(content);
      await api.importJson(payload);
      setMessage("Import termine.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur import");
    }
  };

  return (
    <main className="single-page">
      <section className="panel single-card">
        <h1>Parametres</h1>
        <p>Import / export JSON pour sauvegarder ta progression Frostbitten.</p>
        <div className="settings-actions">
          <button type="button" className="btn" onClick={handleExport}>
            Export JSON
          </button>
          <label className="btn btn-secondary">
            Import JSON
            <input type="file" accept="application/json" onChange={handleImport} hidden />
          </label>
        </div>
        {message ? <p>{message}</p> : null}
      </section>
    </main>
  );
}
