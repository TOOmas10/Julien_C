"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginForm({ signup }: { signup: (fd: FormData) => Promise<{ error: string } | void> }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await authClient.signIn.email({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
    if (result.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signup(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex mb-8 border border-white/10 rounded-lg overflow-hidden">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-3 text-sm font-medium transition ${mode === "login" ? "bg-[#3b2fb5] text-white" : "text-white/60 hover:text-white"}`}
        >
          Connexion
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-3 text-sm font-medium transition ${mode === "signup" ? "bg-[#3b2fb5] text-white" : "text-white/60 hover:text-white"}`}
        >
          Inscription
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-2">Connexion</h2>
          <input name="email" type="email" placeholder="Email" required className="input-dj" />
          <input name="password" type="password" placeholder="Mot de passe" required className="input-dj" />
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-2">Inscription</h2>
          <input name="prenom" type="text" placeholder="Prénom" required className="input-dj" />
          <input name="nom" type="text" placeholder="Nom" required className="input-dj" />
          <input name="email" type="email" placeholder="Email" required className="input-dj" />
          <input name="tel" type="tel" placeholder="Téléphone" className="input-dj" />
          <input name="password" type="password" placeholder="Mot de passe" required minLength={8} className="input-dj" />
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>
      )}
    </div>
  );
}
