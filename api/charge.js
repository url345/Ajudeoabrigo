// POST /api/charge  { amount: 25.5 }  ->  cria a cobrança Pix na Nova Pay e devolve a resposta dela.
// Variáveis na Vercel: NOVAPAY_CI, NOVAPAY_CS e (opcional) ALLOWED_ORIGIN, ex.: https://url345.github.io
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const amount = Number((req.body || {}).amount);
  if (!(amount >= 1 && amount <= 10000)) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  try {
    const r = await fetch('https://api.anovapay.com.br/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ci: process.env.NOVAPAY_CI,
        cs: process.env.NOVAPAY_CS,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100) / 100, // em reais, não em centavos
        description: 'Doação Ajude o Abrigo',
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: 'Falha ao gerar o Pix', detail: data });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Falha ao gerar o Pix' });
  }
}
