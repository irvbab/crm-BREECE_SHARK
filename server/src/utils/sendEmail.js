import { OAuth2Client } from 'google-auth-library';

export async function sendEmail({ to, subject, html }) {
  // 1. Obtenir un jeton d'accès temporaire grâce au refresh token
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const { token } = await client.getAccessToken();

  // 2. Construire l'email au format attendu par Gmail
  const message = [
    `From: CRM Breece <${process.env.GMAIL_SENDER}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`, // gère les accents
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n');

  // 3. Envoyer via l'API Gmail (HTTPS, donc compatible avec Render)
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: Buffer.from(message).toString('base64url') }),
  });

  if (!res.ok) throw new Error(`Gmail API : ${res.status} ${await res.text()}`);
}