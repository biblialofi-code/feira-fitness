// api/score.js — registra score/lead da feira e devolve total + posição no ranking.
// Tabela nova: scores_feira (separada da anônima de perguntas).
// Dados pessoais só entram na ação 'registrar_lead', com consentimento.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(200).json({ ok: false, reason: "sem config" });

  const base = url.replace(/\/+$/, "");
  const H = {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };

  try {
    const { acao, score, gargalo, cadastro } = req.body || {};

    if (acao === "registrar_score") {
      // insere o score (anônimo) e retorna total + posição
      const ins = await fetch(`${base}/rest/v1/scores_feira`, {
        method: "POST",
        headers: { ...H, Prefer: "return=minimal" },
        body: JSON.stringify({ score: Number(score) || 0, gargalo: (gargalo || "").slice(0, 40) }),
      });
      if (!ins.ok) {
        const detail = await ins.text();
        return res.status(200).json({ ok: false, detail });
      }
      // total de academias avaliadas
      const cnt = await fetch(`${base}/rest/v1/scores_feira?select=score`, { headers: H });
      const rows = await cnt.json();
      const total = Array.isArray(rows) ? rows.length : 0;
      // posição = quantos têm score MAIOR que o meu, +1
      const maiores = Array.isArray(rows) ? rows.filter((r) => Number(r.score) > Number(score)).length : 0;
      const posicao = maiores + 1;
      return res.status(200).json({ ok: true, total, posicao });
    }

    if (acao === "registrar_lead") {
      // grava o cadastro completo (com dados pessoais e consentimento já dado no front)
      const c = cadastro || {};
      const row = {
        score: Number(score) || 0,
        gargalo: (gargalo || "").slice(0, 40),
        nome: (c.nome || "").slice(0, 80),
        funcao: (c.funcao || "").slice(0, 60),
        academia: (c.academia || "").slice(0, 80),
        unidades: (c.unidades || "").slice(0, 20),
        alunos: (c.alunos || "").slice(0, 20),
        inativos: (c.inativos || "").slice(0, 20),
        telefone: (c.telefone || "").slice(0, 40),
        email: (c.email || "").slice(0, 120),
      };
      const ins = await fetch(`${base}/rest/v1/leads_feira`, {
        method: "POST",
        headers: { ...H, Prefer: "return=minimal" },
        body: JSON.stringify(row),
      });
      if (!ins.ok) {
        const detail = await ins.text();
        return res.status(200).json({ ok: false, detail });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "ação desconhecida" });
  } catch (e) {
    return res.status(200).json({ ok: false, detail: String(e) });
  }
}
