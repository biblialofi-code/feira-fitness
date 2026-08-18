// api/chat.js — proxy para a API do Claude, guarda a chave em segredo.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Chave de API não configurada." });
  try {
    const { system, messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "messages inválido." });
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 400, system: system || "", messages }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: "Erro na API", detail: data });
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join(" ").trim();
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "Falha inesperada", detail: String(e) });
  }
}
