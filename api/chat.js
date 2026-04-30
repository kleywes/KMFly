export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(200).json({ text: "Erro: Chave não configurada." });

  // Simplificando o histórico para o formato que o Pro exige
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || m.text) }]
  }));

  // Instrução de personalidade como primeira mensagem
  contents.unshift({
    role: 'user',
    parts: [{ text: "SISTEMA: Você é o KMFly, um agente de viagens VIP de elite. Seja empolgado, use muitos emojis e responda sempre no idioma do usuário." }]
  });

  // USANDO GEMINI-PRO NA ROTA v1beta (O mais compatível do mundo)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ text: `Erro do Google: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    }

    return res.status(200).json({ text: "IA não respondeu. Tente novamente!" });

  } catch (error) {
    return res.status(500).json({ error: "Erro de conexão." });
  }
}
