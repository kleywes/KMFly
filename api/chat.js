export default async function handler(req, res) {
  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || m.text) }]
  }));

  // URL Direta e Simplificada para o Gemini Pro
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.candidates) {
      const text = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text });
    } else {
      res.status(200).json({ text: "Conectado, mas o Google não gerou texto. Tente novamente!" });
    }
  } catch (e) {
    res.status(500).json({ error: "Erro de conexão" });
  }
}
