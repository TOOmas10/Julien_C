"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Form from "next/form";
import { authClient } from "@/lib/auth-client";
import { updateProfile } from "@/lib/actions/auth";
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

type Initial = { nom: string; prenom: string; email: string; tel: string };

export default function ProfilForm({ initial, isAdmin }: { initial: Initial; isAdmin: boolean }) {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const [form, setForm] = useState({ ...initial, currentPassword: "", newPassword: "" });
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  useEffect(() => {
    if (!state?.success) return;
    // Met à jour le menu utilisateur (prénom) puis retourne à l'accueil
    refetch().finally(() => router.push("/"));
  }, [state?.success, refetch, router]);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  return (
    <main className="flex flex-col gap-[20px] justify-center items-center min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)] px-4 py-[40px]">
      <div className="w-full max-w-[340px] rounded-[18px] overflow-hidden relative border border-[rgba(80,60,200,0.4)] shadow-[0_0_60px_rgba(40,20,180,0.2),0_0_0_1px_rgba(100,80,255,0.08)] bg-[rgba(10,8,40,0.95)] pb-[24px] animate-[scaleIn_0.45s_ease_both]">
        <Form action={formAction} className="flex flex-col">
          <h1 className={labelClass}>Mon profil</h1>

          <Input className={inputClass} type="text" name="nom" placeholder="Nom" required value={form.nom} onChange={set("nom")} autoComplete="family-name" />
          <Input className={inputClass} type="text" name="prenom" placeholder="Prénom" required value={form.prenom} onChange={set("prenom")} autoComplete="given-name" />
          <Input className={inputClass} type="email" name="email" placeholder="Email" required value={form.email} onChange={set("email")} autoComplete="email" />
          <Input className={inputClass} type="tel" name="tel" placeholder="Téléphone" value={form.tel} onChange={set("tel")} autoComplete="tel" />

          <p className={separatorLabelClass}>Changer le mot de passe</p>
          <Input className={inputClass} type="password" name="currentPassword" placeholder="Mot de passe actuel" value={form.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" />
          <Input className={inputClass} type="password" name="newPassword" placeholder="Nouveau mot de passe" value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" />

          {state?.error && (
            <p className="text-center text-[rgba(255,100,120,0.9)] text-[11px] font-semibold m-0 mt-[6px]">{state.error}</p>
          )}
          <Button
            className={`${buttonClass} bg-[#3b2fb5] hover:bg-[#4c3dd4] mt-[14px]`}
            type="submit"
            disabled={pending || !!state?.success}
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

      <PrivacySection isAdmin={isAdmin} />
    </main>
  );
}

/** Données personnelles : export (droit d'accès) et suppression du compte (droit à l'effacement). */
function PrivacySection({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDeleting(true);
    const { error } = await authClient.deleteUser({ password });
    setDeleting(false);
    if (error) {
      setError(
        error.code === "INVALID_PASSWORD"
          ? "Mot de passe incorrect."
          : error.message ?? "La suppression a échoué."
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <section className="w-full max-w-[340px] rounded-[18px] border border-[rgba(80,60,200,0.25)] bg-[rgba(10,8,40,0.85)] px-[24px] py-[20px] text-[12px] text-[rgba(180,170,230,0.75)] leading-relaxed">
      <h2 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[rgba(140,120,255,0.7)] m-0 mb-[10px]">
        Mes données personnelles
      </h2>
      <p className="m-0 mb-[12px]">
        Vous pouvez télécharger une copie de vos données ou supprimer définitivement votre compte.{" "}
        <Link href="/politique-de-confidentialite" className="underline hover:text-white">
          Politique de confidentialité
        </Link>
      </p>
      <a
        href="/api/account/export"
        className="block text-center py-[9px] rounded-lg border border-[rgba(80,60,200,0.4)] text-[rgba(200,190,255,0.9)] text-[11px] font-bold tracking-[0.1em] uppercase no-underline hover:bg-[rgba(60,40,180,0.2)] hover:text-white transition-colors"
      >
        Télécharger mes données
      </a>

      {isAdmin ? (
        <p className="m-0 mt-[12px] text-[11px] text-[rgba(160,140,220,0.55)]">
          Le compte administrateur ne peut pas être supprimé depuis le site.
        </p>
      ) : !confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-full mt-[10px] py-[9px] rounded-lg bg-transparent border border-[rgba(200,40,70,0.35)] text-[rgba(255,100,120,0.8)] text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:bg-[rgba(180,30,60,0.15)] transition-colors"
        >
          Supprimer mon compte
        </button>
      ) : (
        <form onSubmit={handleDelete} className="mt-[12px] flex flex-col gap-[8px]">
          <p className="m-0 text-[rgba(255,130,140,0.9)]">
            Cette action est définitive : votre compte, vos réservations et vos avis seront supprimés.
            Confirmez avec votre mot de passe.
          </p>
          <Input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,40,70,0.35)] rounded-lg text-[rgba(220,215,255,0.9)] text-[13px] py-[9px] px-[14px]"
          />
          {error && <p className="m-0 text-[rgba(255,100,120,0.9)] font-semibold">{error}</p>}
          <div className="flex gap-[8px]">
            <button
              type="button"
              onClick={() => { setConfirming(false); setPassword(""); setError(""); }}
              className="flex-1 py-[9px] rounded-lg bg-[rgba(80,80,100,0.5)] border-none text-white text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={deleting}
              className="flex-1 py-[9px] rounded-lg bg-[rgba(180,30,60,0.8)] border-none text-white text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer disabled:opacity-50"
            >
              {deleting ? "..." : "Supprimer"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
