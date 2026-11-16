import { Resend } from "resend";
import { after } from "next/server";

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = () => process.env.RESEND_FROM ?? "onboarding@resend.dev";
const DJ_EMAIL = () => process.env.DJ_EMAIL ?? "";

/**
 * Planifie un envoi après la réponse HTTP : l'utilisateur n'attend pas,
 * et Vercel garde la fonction active jusqu'à la fin de l'envoi (waitUntil).
 * Hors contexte de requête (scripts…), l'envoi part directement.
 */
export function sendLater(task: () => Promise<unknown>) {
  try {
    after(task);
  } catch {
    task().catch((err) => console.error("[email] error:", err));
  }
}

/** Date de réservation lisible, ex. « samedi 20 juin 2026 ». */
export function formatResaDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

type Client = { prenom: string; nom: string; email: string; tel?: string | null };
type ResaSnapshot = { date: string; prestation: string; info?: string | null };

function clientRows(c: Client) {
  return [
    { label: "Client", value: `${esc(c.prenom)} ${esc(c.nom)}` },
    { label: "Email", value: esc(c.email) },
    ...(c.tel ? [{ label: "Téléphone", value: esc(c.tel) }] : []),
  ];
}

function diffResa(before: ResaSnapshot, after: ResaSnapshot) {
  const changes: { label: string; value: string }[] = [];
  if (before.date !== after.date)
    changes.push({ label: "Date", value: `${esc(before.date)} → <strong style="color:#fff;">${esc(after.date)}</strong>` });
  if (before.prestation !== after.prestation)
    changes.push({ label: "Prestation", value: `${esc(before.prestation)} → <strong style="color:#fff;">${esc(after.prestation)}</strong>` });
  if ((before.info ?? "") !== (after.info ?? ""))
    changes.push({ label: "Infos", value: `${esc(before.info || "—")} → <strong style="color:#fff;">${esc(after.info || "—")}</strong>` });
  return changes;
}

function template(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a14;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a14;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0f0d2e;border:1px solid rgba(80,60,200,0.35);border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#13104a;padding:24px 32px;border-bottom:1px solid rgba(80,60,200,0.3);">
            <p style="margin:0;color:rgba(140,120,255,0.7);font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Julien C — DJ</p>
            <p style="margin:8px 0 0;color:#fff;font-size:20px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;">${title}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;color:rgba(210,205,250,0.88);font-size:14px;line-height:1.7;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#13104a;padding:16px 32px;border-top:1px solid rgba(80,60,200,0.2);">
            <p style="margin:0;color:rgba(140,120,200,0.5);font-size:11px;">Julien C — DJ · julien.dj2a@gmail.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:rgba(140,120,255,0.75);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;padding-right:16px;">${label}</td>
    <td style="padding:6px 0;color:#fff;font-size:14px;">${value}</td>
  </tr>`;
}

function recap(fields: { label: string; value: string }[]): string {
  return `<table cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(80,60,200,0.25);border-radius:10px;padding:12px 18px;width:100%;margin:16px 0;">
    ${fields.map((f) => row(f.label, f.value)).join("")}
  </table>`;
}

async function send(payload: Parameters<ReturnType<typeof getResend>["emails"]["send"]>[0]) {
  // Par défaut, « Répondre » envoie la réponse à Julien (l'adresse
  // d'expédition peut être une adresse sans boîte de réception).
  const replyTo = payload.replyTo ?? (DJ_EMAIL() || undefined);
  try {
    const result = await getResend().emails.send({ ...payload, ...(replyTo ? { replyTo } : {}) });
    if (result.error) console.error("[email] Resend error:", result.error);
  } catch (err) {
    console.error("[email] Failed to send email:", err);
  }
}

// 1. Nouvelle réservation → utilisateur
export async function sendResaConfirmationUser({
  to,
  prenom,
  date,
  prestation,
  info,
}: {
  to: string;
  prenom: string;
  date: string;
  prestation: string;
  info?: string | null;
}) {
  await send({
    from: FROM(),
    to,
    subject: "Demande de réservation reçue — Julien C DJ",
    html: template(
      "Demande reçue",
      `<p>Bonjour <strong style="color:#fff;">${esc(prenom)}</strong>,</p>
      <p>Votre demande de réservation a bien été envoyée. Julien reviendra vers vous rapidement pour confirmer.</p>
      ${recap([
        { label: "Prestation", value: esc(prestation) },
        { label: "Date", value: esc(date) },
        ...(info ? [{ label: "Infos", value: esc(info) }] : []),
      ])}
      <p style="color:rgba(140,120,200,0.6);font-size:12px;margin-top:24px;">Vous pouvez suivre l'état de votre réservation dans votre espace client.</p>`
    ),
  });
}

// 2. Nouvelle réservation → DJ
export async function sendResaNotificationDJ({
  prenom,
  nom,
  email,
  tel,
  date,
  prestation,
  info,
}: {
  prenom: string;
  nom: string;
  email: string;
  tel?: string | null;
  date: string;
  prestation: string;
  info?: string | null;
}) {
  const djEmail = DJ_EMAIL();
  if (!djEmail) return;
  await send({
    from: FROM(),
    to: djEmail,
    subject: `Nouvelle réservation — ${esc(prenom)} ${esc(nom)}`,
    replyTo: email,
    html: template(
      "Nouvelle réservation",
      `<p>Une nouvelle demande a été reçue.</p>
      ${recap([
        { label: "Client", value: `${esc(prenom)} ${esc(nom)}` },
        { label: "Email", value: esc(email) },
        ...(tel ? [{ label: "Téléphone", value: esc(tel) }] : []),
        { label: "Prestation", value: esc(prestation) },
        { label: "Date", value: esc(date) },
        ...(info ? [{ label: "Infos", value: esc(info) }] : []),
      ])}`
    ),
  });
}

// 3. Changement d'état → utilisateur
export async function sendResaStatusUser({
  to,
  prenom,
  statut,
  date,
  prestation,
}: {
  to: string;
  prenom: string;
  statut: string;
  date: string;
  prestation: string;
}) {
  const isValidee = statut === "Validée";
  const isAttente = statut === "En attente";
  const color = isValidee ? "#4ade80" : isAttente ? "#fbbf24" : "#ff6478";
  const message = isValidee
    ? `Votre réservation a été <strong style="color:#4ade80;">confirmée</strong>. À très bientôt !`
    : isAttente
      ? `Votre réservation est de nouveau <strong style="color:#fbbf24;">en attente</strong> de confirmation. Julien reviendra vers vous rapidement.`
      : `Votre réservation a été <strong style="color:#ff6478;">refusée</strong>. N'hésitez pas à contacter Julien pour plus d'informations.`;

  await send({
    from: FROM(),
    to,
    subject: `Réservation ${esc(statut.toLowerCase())} — Julien C DJ`,
    html: template(
      `Réservation ${esc(statut)}`,
      `<p>Bonjour <strong style="color:#fff;">${esc(prenom)}</strong>,</p>
      <p>${message}</p>
      ${recap([
        { label: "Prestation", value: esc(prestation) },
        { label: "Date", value: esc(date) },
        { label: "Statut", value: `<span style="color:${color};font-weight:700;">${esc(statut)}</span>` },
      ])}`
    ),
  });
}

// 4. Inscription → utilisateur
export async function sendWelcome({ to, prenom }: { to: string; prenom: string }) {
  await send({
    from: FROM(),
    to,
    subject: "Bienvenue chez Julien C DJ !",
    html: template(
      "Bienvenue !",
      `<p>Bonjour <strong style="color:#fff;">${esc(prenom)}</strong>,</p>
      <p>Votre compte a bien été créé. Vous pouvez dès maintenant accéder au calendrier pour réserver une date.</p>
      <p style="margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/calendrier" style="display:inline-block;background:#3b2fb5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">
          Voir le calendrier
        </a>
      </p>`
    ),
  });
}

// 5. Modification de réservation → utilisateur
export async function sendResaUpdatedUser({
  to,
  prenom,
  before,
  after,
}: {
  to: string;
  prenom: string;
  before: { date: string; prestation: string; info?: string | null };
  after: { date: string; prestation: string; info?: string | null };
}) {
  const changes = diffResa(before, after);
  if (changes.length === 0) return;

  await send({
    from: FROM(),
    to,
    subject: "Votre réservation a été modifiée — Julien C DJ",
    html: template(
      "Réservation modifiée",
      `<p>Bonjour <strong style="color:#fff;">${esc(prenom)}</strong>,</p>
      <p>Voici le récapitulatif des modifications apportées à votre réservation :</p>
      ${recap([
        ...changes,
        { label: "Statut", value: `<span style="color:#fbbf24;font-weight:700;">En attente</span>` },
      ])}
      <p>Votre réservation est repassée <strong style="color:#fbbf24;">en attente</strong> : Julien doit confirmer ces nouvelles informations. Vous recevrez un email dès sa réponse.</p>`
    ),
  });
}

// 6. Modification de réservation par le client → DJ
export async function sendResaUpdatedDJ({
  client,
  before,
  after,
  previousStatut,
}: {
  client: Client;
  before: ResaSnapshot;
  after: ResaSnapshot;
  /** Statut avant la modification (la réservation repasse ensuite « En attente »). */
  previousStatut: string;
}) {
  const djEmail = DJ_EMAIL();
  if (!djEmail) return;
  const changes = diffResa(before, after);
  if (changes.length === 0) return;

  await send({
    from: FROM(),
    to: djEmail,
    subject: `Réservation modifiée — ${esc(client.prenom)} ${esc(client.nom)}`,
    replyTo: client.email,
    html: template(
      "Réservation modifiée",
      `<p>Un client a modifié sa demande de réservation. Elle est repassée <strong style="color:#fbbf24;">en attente</strong> : pensez à la valider ou la refuser depuis l'interface admin.</p>
      ${recap([
        ...clientRows(client),
        {
          label: "Statut",
          value:
            previousStatut === "En attente"
              ? `<span style="color:#fbbf24;font-weight:700;">En attente</span>`
              : `${esc(previousStatut)} → <span style="color:#fbbf24;font-weight:700;">En attente</span>`,
        },
      ])}
      <p style="margin:8px 0 0;">Modifications :</p>
      ${recap(changes)}`
    ),
  });
}

// 7. Annulation de réservation par le client → DJ
export async function sendResaCancelledDJ({
  client,
  resa,
}: {
  client: Client;
  resa: ResaSnapshot;
}) {
  const djEmail = DJ_EMAIL();
  if (!djEmail) return;

  await send({
    from: FROM(),
    to: djEmail,
    subject: `Réservation annulée — ${esc(client.prenom)} ${esc(client.nom)}`,
    replyTo: client.email,
    html: template(
      "Réservation annulée",
      `<p>Un client a <strong style="color:#ff6478;">annulé</strong> sa demande de réservation. La date est de nouveau disponible dans le calendrier.</p>
      ${recap([
        ...clientRows(client),
        { label: "Prestation", value: esc(resa.prestation) },
        { label: "Date", value: esc(resa.date) },
        ...(resa.info ? [{ label: "Infos", value: esc(resa.info) }] : []),
      ])}`
    ),
  });
}

// 8. Suppression d'une réservation par l'admin → utilisateur
export async function sendResaDeletedUser({
  to,
  prenom,
  resa,
}: {
  to: string;
  prenom: string;
  resa: ResaSnapshot;
}) {
  await send({
    from: FROM(),
    to,
    subject: "Réservation annulée — Julien C DJ",
    html: template(
      "Réservation annulée",
      `<p>Bonjour <strong style="color:#fff;">${esc(prenom)}</strong>,</p>
      <p>Votre réservation a été <strong style="color:#ff6478;">annulée</strong> par Julien. N'hésitez pas à le contacter pour plus d'informations ou pour choisir une autre date.</p>
      ${recap([
        { label: "Prestation", value: esc(resa.prestation) },
        { label: "Date", value: esc(resa.date) },
      ])}`
    ),
  });
}

// 9. Suppression du compte → utilisateur
export async function sendAccountDeleted({ to, prenom }: { to: string; prenom: string }) {
  await send({
    from: FROM(),
    to,
    subject: "Votre compte a été supprimé — Julien C DJ",
    html: template(
      "Compte supprimé",
      `<p>Bonjour <strong style="color:#fff;">${esc(prenom)}</strong>,</p>
      <p>Votre compte a bien été supprimé, ainsi que vos réservations et vos avis. Aucune donnée personnelle vous concernant n'est conservée sur le site.</p>
      <p style="color:rgba(140,120,200,0.6);font-size:12px;margin-top:24px;">Si vous n'êtes pas à l'origine de cette suppression, répondez à cet email ou contactez Julien à julien.dj2a@gmail.com.</p>`
    ),
  });
}

// 10. Suppression d'un compte qui avait des réservations → DJ
export async function sendAccountDeletedDJ({
  client,
  reservations,
}: {
  client: Client;
  reservations: (ResaSnapshot & { statut: string })[];
}) {
  const djEmail = DJ_EMAIL();
  if (!djEmail || reservations.length === 0) return;

  const plural = reservations.length > 1;
  await send({
    from: FROM(),
    to: djEmail,
    replyTo: client.email,
    subject: `Compte supprimé — ${plural ? `${reservations.length} réservations annulées` : "1 réservation annulée"} (${esc(client.prenom)} ${esc(client.nom)})`,
    html: template(
      "Compte client supprimé",
      `<p>Un client a supprimé son compte. ${plural ? "Ses réservations ont été supprimées" : "Sa réservation a été supprimée"} et ${plural ? "les dates sont" : "la date est"} de nouveau ${plural ? "disponibles" : "disponible"} dans le calendrier.</p>
      ${recap(clientRows(client))}
      ${reservations
        .map((r) =>
          recap([
            { label: "Prestation", value: esc(r.prestation) },
            { label: "Date", value: esc(r.date) },
            { label: "Statut", value: esc(r.statut) },
            ...(r.info ? [{ label: "Infos", value: esc(r.info) }] : []),
          ])
        )
        .join("")}`
    ),
  });
}
