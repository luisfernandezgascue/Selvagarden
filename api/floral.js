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

  const prompt = imageBase64
    ? `Eres Selva, florista experta de Selva Garden en Caracas.
Analiza este ramo/arreglo floral y proporciona:
1. **Identificación de flores**: lista las flores o plantas que ves
2. **Estilo**: describe el estilo del arreglo (romántico, minimalista, silvestre, etc.)
3. **Paleta de colores**: describe la paleta
4. **Cómo recrearlo**: pasos para crear algo similar con flores disponibles en Venezuela
5. **Alternativas locales**: flores venezolanas que podrían sustituir las del arreglo
6. **Ocasión ideal**: para qué ocasión es perfecto

${notes ? `Nota del usuario: ${notes}` : ''}

Responde en español, de forma inspiradora y práctica. Máx 280 palabras.`
    : `Eres Selva, florista experta de Selva Garden en Caracas.
El usuario te pide inspiración floral${notes ? `: "${notes}"` : ' sin especificar preferencias'}.

Crea una propuesta de ramo o arreglo floral:
1. **Concepto**: nombre creativo y estilo del arreglo
2. **Flores protagonistas**: 3-4 flores principales con descripción
3. **Flores de relleno**: 2-3 complementos
4. **Follaje**: hojas o ramas recomendadas
5. **Paleta**: 3 colores del arreglo
6. **Mensaje**: qué transmite este arreglo
7. **Disponible en Selva Garden**: flores de nuestra selección

Responde en español, de forma poética y visual. Máx 280 palabras.`;

  try {
    const messages = imageBase64
      ? [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
            { type: 'text', text: prompt },
          ],
        }]
      : [{ role: 'user', content: prompt }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        messages,
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
