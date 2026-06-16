import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateProfile } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Mon profil</h1>
      <form action={updateProfile} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input name="prenom" defaultValue={user.prenom ?? ""} placeholder="Prénom" className="input-dj flex-1" />
          <input name="nom" defaultValue={user.nom ?? ""} placeholder="Nom" className="input-dj flex-1" />
        </div>
        <input name="email" type="email" defaultValue={user.email} placeholder="Email" className="input-dj" />
        <input name="tel" type="tel" defaultValue={user.tel ?? ""} placeholder="Téléphone" className="input-dj" />
        <hr className="border-white/10 my-2" />
        <p className="text-white/60 text-sm">Laisser vide pour ne pas changer le mot de passe</p>
        <input name="currentPassword" type="password" placeholder="Mot de passe actuel" className="input-dj" />
        <input name="password" type="password" placeholder="Nouveau mot de passe" className="input-dj" />
        <button type="submit" className="btn-primary mt-2">Enregistrer</button>
      </form>
    </div>
  );
}
