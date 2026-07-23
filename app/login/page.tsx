"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Échec de la connexion.");
      }
      router.push(params.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-eyebrow">Veille professionnelle</div>
        <h1 className="login-title">Kinésithérapie du Sport</h1>
        <p className="login-subtitle">Accès protégé — mot de passe requis</p>
        <input
          type="password"
          autoFocus
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading || !password}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <style>{CSS}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&display=swap');

.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F6F4;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 20px;
}
.login-card {
  background: #FFFFFF;
  border: 1px solid #DDE1E3;
  border-radius: 14px;
  padding: 32px 28px;
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 12px 32px rgba(11,30,51,0.08);
}
.login-eyebrow {
  font-family: 'Barlow Condensed', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
  color: #3E6E8E;
}
.login-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 24px;
  margin: 0;
  color: #0B1E33;
}
.login-subtitle { margin: 0 0 10px 0; font-size: 12.5px; color: #5B6570; }
.login-card input {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 7px;
  border: 1px solid #DDE1E3;
  color: #0B1E33;
}
.login-card button {
  margin-top: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 7px;
  border: 1px solid #0B1E33;
  background: #0B1E33;
  color: #F2F4F6;
  cursor: pointer;
}
.login-card button:disabled { opacity: 0.5; cursor: default; }
.login-error { color: #9B3A3A; font-size: 12.5px; margin: 0; }
`;
