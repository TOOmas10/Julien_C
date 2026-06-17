"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const inputClass =
  "appearance-none w-[78%] bg-[rgba(255,255,255,0.05)] border border-[rgba(80,60,200,0.35)] rounded-lg text-[rgba(220,215,255,0.9)] text-[13px] py-[9px] px-[14px] outline-none flex mx-auto my-[6px] transition-[border-color] duration-[150ms] placeholder:text-[rgba(140,120,200,0.45)] focus:border-[rgba(120,100,255,0.6)]";
const buttonClass =
  "w-[78%] py-[10px] bg-[#3b2fb5] border-none rounded-lg text-white text-[12px] font-bold tracking-[0.1em] uppercase cursor-pointer block mx-auto mt-[12px] transition-[background] duration-[150ms] hover:bg-[#4c3dd4] disabled:opacity-50 disabled:cursor-not-allowed h-auto";
const labelClass =
  "text-white text-[1.1em] font-black tracking-[0.15em] uppercase flex justify-center py-[22px] pb-[18px] m-0 cursor-pointer transition-[transform,color] duration-[400ms] ease-in-out";

export default function LoginPage() {
  const router = useRouter();

  const [signupData, setSignupData] = useState({ nom: "", prenom: "", tel: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupError, setSignupError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: { preventDefault(): void }) {
    e.preventDefault();
    setSignupError("");
    setLoading(true);
    const { error } = await authClient.signUp.email({
      email: signupData.email,
      password: signupData.password,
      name: `${signupData.prenom} ${signupData.nom}`.trim(),
      nom: signupData.nom,
      prenom: signupData.prenom,
      tel: signupData.tel,
    });
    setLoading(false);
    if (error) {
      setSignupError(error.message ?? "Erreur lors de l'inscription.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleLogin(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email: loginData.email,
      password: loginData.password,
    });
    setLoading(false);
    if (error) {
      setLoginError("Mot de passe ou email incorrect !");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] px-4">
      <div className="w-full max-w-[340px] h-[520px] rounded-[18px] overflow-hidden relative border border-[rgba(80,60,200,0.4)] shadow-[0_0_60px_rgba(40,20,180,0.2),0_0_0_1px_rgba(100,80,255,0.08)] bg-[rgba(10,8,40,0.95)] animate-[scaleIn_0.45s_ease_both]">
        <input type="checkbox" id="chk" className="peer hidden" />

        {/* Inscription */}
        <div className="relative w-full h-full flex flex-col justify-between pt-[10px] pb-[80px] peer-checked:[&_label]:scale-75 peer-checked:[&_label]:text-[rgba(160,140,255,0.5)]">
          <form onSubmit={handleSignup} className="flex flex-col justify-between h-full">
            <label htmlFor="chk" className={labelClass}>S&apos;inscrire</label>
            <Input
              className={inputClass} type="text" placeholder="Nom" required
              value={signupData.nom} onChange={e => setSignupData(d => ({ ...d, nom: e.target.value }))}
            />
            <Input
              className={inputClass} type="text" placeholder="Prénom" required
              value={signupData.prenom} onChange={e => setSignupData(d => ({ ...d, prenom: e.target.value }))}
            />
            <Input
              className={inputClass} type="tel" placeholder="Téléphone"
              value={signupData.tel} onChange={e => setSignupData(d => ({ ...d, tel: e.target.value }))}
            />
            <Input
              className={inputClass} type="email" placeholder="Email" required
              value={signupData.email} onChange={e => setSignupData(d => ({ ...d, email: e.target.value }))}
            />
            <Input
              className={inputClass} type="password" placeholder="Mot de Passe" required
              value={signupData.password} onChange={e => setSignupData(d => ({ ...d, password: e.target.value }))}
            />
            {signupError && (
              <p className="text-center text-[rgba(255,100,120,0.9)] text-[11px] font-semibold m-0 mt-[4px]">
                {signupError}
              </p>
            )}
            <Button className={buttonClass} type="submit" disabled={loading}>
              {loading ? "..." : "S'inscrire"}
            </Button>
          </form>
        </div>

        {/* Connexion */}
        <div className="h-[420px] bg-[rgba(20,14,60,0.98)] border-t border-[rgba(80,60,200,0.35)] [border-radius:50%_50%_0_0/6%_6%_0_0] translate-y-[-60px] transition-all duration-[800ms] ease-in-out relative peer-checked:translate-y-[-300px] peer-checked:[&_label]:scale-100 peer-checked:[&_label]:text-white">
          <form onSubmit={handleLogin} className="flex flex-col h-full">
            <label htmlFor="chk" className={`${labelClass} text-[rgba(140,120,255,0.8)] scale-75 pt-[18px] pb-0`}>
              Se connecter
            </label>
            <Input
              className={inputClass} type="email" placeholder="Email" required
              value={loginData.email} onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}
            />
            <Input
              className={inputClass} type="password" placeholder="Mot de Passe" required
              value={loginData.password} onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
            />
            {loginError && (
              <p className="text-center text-[rgba(255,100,120,0.9)] text-[11px] font-semibold m-0 mt-[4px]">
                {loginError}
              </p>
            )}
            <Button className={buttonClass} type="submit" disabled={loading}>
              {loading ? "..." : "Se connecter"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
