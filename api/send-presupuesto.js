export const config = { maxDuration: 30 };

const WA_NUMBER = '584120000000';

function buildHtml({ cliente_nombre, items = [], subtotal, mano_de_obra, total, notas }) {
  const nombre = cliente_nombre || 'Cliente';
  const rows = items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E8EDE9;font-size:13px;color:#2A2A2A;">${i.nombre || i.name || ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8EDE9;font-size:13px;text-align:center;color:#2A2A2A;">${i.cantidad || i.qty || 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8EDE9;font-size:13px;text-align:right;color:#2A2A2A;">$${Number(i.precio_unit ?? i.unit ?? 0).toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8EDE9;font-size:13px;font-weight:600;text-align:right;color:#1A3C2E;">$${Number(i.subtotal ?? (i.qty * i.unit) ?? 0).toFixed(2)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6F1;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F1;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1A3C2E;padding:28px 32px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.12em;color:rgba(255,255,255,0.55);font-weight:600;text-transform:uppercase;">Floristería</p>
            <h1 style="margin:4px 0 0;font-size:28px;font-weight:700;color:#fff;font-family:Georgia,serif;">Selva Garden 🌿</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 0;">
            <p style="margin:0;font-size:16px;color:#1A1A1A;">Hola <strong>${nombre}</strong>, aquí está tu presupuesto:</p>
          </td>
        </tr>

        <!-- Items table -->
        <tr>
          <td style="padding:20px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8EDE9;border-radius:10px;overflow:hidden;">
              <thead>
                <tr style="background:#F4F6F1;">
                  <th style="padding:9px 12px;font-size:10px;letter-spacing:0.08em;color:#888;text-align:left;font-weight:600;text-transform:uppercase;">Flor / Elemento</th>
                  <th style="padding:9px 12px;font-size:10px;letter-spacing:0.08em;color:#888;text-align:center;font-weight:600;text-transform:uppercase;">Cant.</th>
                  <th style="padding:9px 12px;font-size:10px;letter-spacing:0.08em;color:#888;text-align:right;font-weight:600;text-transform:uppercase;">Unit.</th>
                  <th style="padding:9px 12px;font-size:10px;letter-spacing:0.08em;color:#888;text-align:right;font-weight:600;text-transform:uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:16px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:7px 0;font-size:13px;color:#4A4A4A;border-bottom:1px solid #F0F0F0;">Subtotal flores y materiales</td>
                <td style="padding:7px 0;font-size:13px;color:#4A4A4A;text-align:right;border-bottom:1px solid #F0F0F0;">$${Number(subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;font-size:13px;color:#4A4A4A;border-bottom:1px solid #F0F0F0;">Servicio y elaboración</td>
                <td style="padding:7px 0;font-size:13px;color:#4A4A4A;text-align:right;border-bottom:1px solid #F0F0F0;">$${Number(mano_de_obra).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:12px 0 4px;font-size:16px;font-weight:700;color:#1A3C2E;">Total</td>
                <td style="padding:12px 0 4px;font-size:22px;font-weight:700;color:#1A3C2E;text-align:right;font-family:Georgia,serif;">$${Number(total)}</td>
              </tr>
            </table>
          </td>
        </tr>

        ${notas ? `
        <!-- Notas -->
        <tr>
          <td style="padding:16px 32px 0;">
            <div style="background:#F4F6F1;border-radius:10px;padding:14px 16px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.08em;color:#888;font-weight:600;text-transform:uppercase;">Notas</p>
              <p style="margin:0;font-size:13px;color:#2A2A2A;line-height:1.5;">${notas}</p>
            </div>
          </td>
        </tr>` : ''}

        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px;">
            <p style="margin:0 0 14px;font-size:14px;color:#1A1A1A;font-weight:600;">Para confirmar tu arreglo:</p>
            <a href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola Selva Garden, quiero confirmar mi presupuesto para ${nombre} por $${Number(total)}.`)}"
               style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:14px;font-weight:600;">
              💬 Confirmar por WhatsApp
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F4F6F1;padding:16px 32px;border-top:1px solid #E8EDE9;">
            <p style="margin:0;font-size:11px;color:#999;text-align:center;">Válido por 48 horas · Selva Garden · Caracas, Venezuela</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { cliente_email, cliente_nombre, items, subtotal, mano_de_obra, total, notas } = req.body;

  if (!cliente_email) return res.status(400).json({ error: 'cliente_email is required' });

  if (!process.env.RESEND_API_KEY) {
    console.warn('[send-presupuesto] RESEND_API_KEY not set — skipping email');
    return res.status(200).json({ ok: true, skipped: true });
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Selva Garden <onboarding@resend.dev>';
  const html = buildHtml({ cliente_nombre, items, subtotal, mano_de_obra, total, notas });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [cliente_email],
      subject: 'Tu presupuesto de Selva Garden 🌿',
      html,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('[send-presupuesto] Resend error:', JSON.stringify(data));
    return res.status(502).json({ error: data.message || 'Email delivery failed' });
  }

  return res.status(200).json({ ok: true, resend_id: data.id });
}
