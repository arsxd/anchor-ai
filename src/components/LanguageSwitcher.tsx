"use client";

import { useState, useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

export function LanguageSwitcher() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("anchor_language");
    if (stored) setLanguage(stored);
  }, []);

  function handleChange(code: string) {
    setLanguage(code);
    localStorage.setItem("anchor_language", code);
  }

  return (
    <select
      value={language}
      onChange={(e) => handleChange(e.target.value)}
      className="text-xs bg-muted border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
      aria-label="Select language"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
