"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { updateProfile } from "@/lib/actions/auth";
import Form from "next/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const inputClass =
  "appearance-none w-[78%] bg-[rgba(255,255,255,0.05)] border border-[rgba(80,60,200,0.35)] rounded-lg text-[rgba(220,215,255,0.9)] text-[13px] py-[9px] px-[14px] outline-none flex mx-auto my-[6px] transition-[border-color] duration-[150ms] placeholder:text-[rgba(140,120,200,0.45)] focus:border-[rgba(120,100,255,0.6)]";
const buttonClass =
  "w-[78%] py-[10px] border-none rounded-lg text-white text-[12px] font-bold tracking-[0.1em] uppercase cursor-pointer block mx-auto mt-[8px] transition-[background] duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed h-auto";
const labelClass =
  "text-white text-[1.1em] font-black tracking-[0.15em] uppercase flex justify-center pt-[22px] pb-[14px] m-0";
const separatorLabelClass =
  "text-[rgba(140,120,255,0.6)] text-[0.7em] font-bold tracking-[0.12em] uppercase flex justify-center pt-[14px] pb-[4px] m-0";

export default function ProfilPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", tel: "", currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(true);
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.user) { router.push("/login"); return; }
      const u = data.user;
      setForm(f => ({
        ...f,
        nom: u.nom ?? "",
        prenom: u.prenom ?? "",
        email: u.email ?? "",
        tel: u.tel ?? "",
      }));
      setLoading(false);
    });
  }, [router]);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] px-4" />
    );
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] px-4">
      <div className="w-full max-w-[340px] rounded-[18px] overflow-hidden relative border border-[rgba(80,60,200,0.4)] shadow-[0_0_60px_rgba(40,20,180,0.2),0_0_0_1px_rgba(100,80,255,0.08)] bg-[rgba(10,8,40,0.95)] pb-[24px] animate-[scaleIn_0.45s_ease_both]">
        <Form action={formAction} className="flex flex-col">
          <p className={labelClass}>Mon profil</p>

          <Input className={inputClass} type="text" name="nom" placeholder="Nom" required value={form.nom} onChange={set("nom")} />
          <Input className={inputClass} type="text" name="prenom" placeholder="Prénom" required value={form.prenom} onChange={set("prenom")} />
          <Input className={inputClass} type="email" name="email" placeholder="Email" required value={form.email} onChange={set("email")} />
          <Input className={inputClass} type="tel" name="tel" placeholder="Téléphone" value={form.tel} onChange={set("tel")} />

          <p className={separatorLabelClass}>Changer le mot de passe</p>
          <Input className={inputClass} type="password" name="currentPassword" placeholder="Mot de passe actuel" value={form.currentPassword} onChange={set("currentPassword")} />
          <Input className={inputClass} type="password" name="newPassword" placeholder="Nouveau mot de passe" value={form.newPassword} onChange={set("newPassword")} />

          {state?.error && (
            <p className="text-center text-[rgba(255,100,120,0.9)] text-[11px] font-semibold m-0 mt-[6px]">{state.error}</p>
          )}
          <Button
            className={`${buttonClass} bg-[#3b2fb5] hover:bg-[#4c3dd4] mt-[14px]`}
            type="submit"
            disabled={pending}
          >
            {pending ? "..." : "Modifier mes informations"}
          </Button>
          <Button
            className={`${buttonClass} bg-[rgba(80,80,100,0.5)] hover:bg-[rgba(100,100,120,0.6)]`}
            type="button"
            onClick={() => router.push("/")}
          >
            Retour
          </Button>
        </Form>
      </div>
    </main>
  );
}
