export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { imageBase64, mimeType = 'image/jpeg', notes = '' } = req.body || {};
  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 required' });
  }

  const prompt = `Eres Selva, asistente botánica experta de Selva Garden en Caracas.
Analiza esta planta y proporciona:
1. **Identificación**: nombre común y científico si es posible
2. **Estado**: diagnóstico del estado actual (saludable / estrés / problema)
3. **Problema detectado**: si hay síntomas visibles (amarillamiento, manchas, plagas, etc.)
4. **Causa probable**: qué está causando el problema
5. **Solución**: pasos concretos para remediar (máx 3 pasos)
6. **Cuidados preventivos**: 2 consejos rápidos

${notes ? `Nota del usuario: ${notes}` : ''}

Responde en español, de forma cálida y práctica. Máx 250 palabras.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Claude API error' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ result: text });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
