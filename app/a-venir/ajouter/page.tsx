import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { addSoiree } from "@/lib/actions/soirees";
import Form from "next/form";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const inputClass =
  "appearance-none w-[78%] bg-[rgba(255,255,255,0.05)] border border-[rgba(80,60,200,0.35)] rounded-lg text-[rgba(220,215,255,0.9)] text-[13px] py-[9px] px-[14px] outline-none flex mx-auto my-[6px] transition-[border-color] duration-[150ms] placeholder:text-[rgba(140,120,200,0.45)] focus:border-[rgba(120,100,255,0.6)]";
const buttonClass =
  "w-[78%] py-[10px] border-none rounded-lg text-white text-[12px] font-bold tracking-[0.1em] uppercase cursor-pointer block mx-auto mt-[8px] transition-[background] duration-[150ms] h-auto";
const labelClass =
  "text-white text-[1.1em] font-black tracking-[0.15em] uppercase flex justify-center pt-[22px] pb-[14px] m-0";

export default async function AjouterSoireePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.roleId !== 2) redirect("/");

  return (
    <main className="flex justify-center items-center min-h-screen bg-[linear-gradient(160deg,#0a0a14_0%,#0d0a2e_50%,#0a0a14_100%)]">
      <div className="w-[360px] rounded-[18px] overflow-hidden relative border border-[rgba(80,60,200,0.4)] shadow-[0_0_60px_rgba(40,20,180,0.2),0_0_0_1px_rgba(100,80,255,0.08)] bg-[rgba(10,8,40,0.95)] pb-[24px]">
        <Form action={addSoiree} className="flex flex-col">
          <p className={labelClass}>Ajouter une soirée</p>

          <Input
            className={inputClass}
            type="text"
            name="titre"
            placeholder="Titre"
            required
          />
          <Input
            className={inputClass}
            type="datetime-local"
            name="date"
            required
          />
          <Input
            className={inputClass}
            type="text"
            name="lieu"
            placeholder="Lieu"
            required
          />
          <Input
            className={inputClass}
            type="text"
            name="ville"
            placeholder="Ville"
            required
          />
          <Textarea
            name="description"
            placeholder="Description (optionnelle)"
            className={`${inputClass} resize-y min-h-[80px] py-[9px]`}
          />

          <Button
            type="submit"
            className={`${buttonClass} bg-[#3b2fb5] hover:bg-[#4c3dd4] mt-[14px]`}
          >
            Créer la soirée
          </Button>
          <Link
            href="/a-venir"
            className={`${buttonClass} bg-[rgba(80,80,100,0.5)] hover:bg-[rgba(100,100,120,0.6)] text-center no-underline`}
          >
            Annuler
          </Link>
        </Form>
      </div>
    </main>
  );
}
