export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};

  const systemPrompt = `Eres el florista experto de Selva Garden. Analiza este ramo floral e identifica: 1) Flores principales, 2) Follaje y complementos, 3) Estilo del arreglo, 4) Precio estimado en USD para Caracas Venezuela, 5) Si podemos hacerlo. Responde en espanol. Max 150 palabras.`;

  try {
    const messages = imageBase64
      ? [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
            { type: 'text', text: 'Analiza este ramo floral.' },
          ],
        }]
      : [{ role: 'user', content: '¿Puedes inspirarme con una propuesta de ramo floral para Caracas?' }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Claude API error' });
    }

    const data = await response.json();
    return res.status(200).json({ result: data.content?.[0]?.text || '' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
