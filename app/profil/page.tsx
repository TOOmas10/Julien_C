import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ProfilForm from "./profil-form";

// Rendu côté serveur : le formulaire arrive déjà rempli, sans écran vide
// pendant le chargement de la session dans le navigateur.
export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const u = session.user;
  return (
    <ProfilForm
      initial={{
        nom: u.nom ?? "",
        prenom: u.prenom ?? "",
        email: u.email ?? "",
        tel: u.tel ?? "",
      }}
      isAdmin={u.roleId === 2}
    />
  );
}
