import { Resend } from "resend";

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
  try {
    const result = await getResend().emails.send(payload);
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
  const color = isValidee ? "#4ade80" : "#ff6478";
  const message = isValidee
    ? `Votre réservation a été <strong style="color:#4ade80;">confirmée</strong>. À très bientôt !`
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
  const changes: { label: string; value: string }[] = [];

  if (before.date !== after.date)
    changes.push({ label: "Date", value: `${esc(before.date)} → <strong style="color:#fff;">${esc(after.date)}</strong>` });
  if (before.prestation !== after.prestation)
    changes.push({ label: "Prestation", value: `${esc(before.prestation)} → <strong style="color:#fff;">${esc(after.prestation)}</strong>` });
  if ((before.info ?? "") !== (after.info ?? ""))
    changes.push({ label: "Infos", value: `${esc(before.info || "—")} → <strong style="color:#fff;">${esc(after.info || "—")}</strong>` });

  if (changes.length === 0) return;

  await send({
    from: FROM(),
    to,
    subject: "Votre réservation a été modifiée — Julien C DJ",
    html: template(
      "Réservation modifiée",
      `<p>Bonjour <strong style="color:#fff;">${esc(prenom)}</strong>,</p>
      <p>Voici le récapitulatif des modifications apportées à votre réservation :</p>
      ${recap(changes)}
      <p style="color:rgba(140,120,200,0.6);font-size:12px;margin-top:16px;">En attente de confirmation de Julien.</p>`
    ),
  });
}
