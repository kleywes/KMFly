export default async function handler(req, res) {
  const { messages } = req.body;

  // Traduzindo o histórico para o formato que o Gemini entende
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || m.text }]
  }));

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    
    // Pegando a resposta do texto do Gemini
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    res.status(200).json({ text: aiResponse });
  } catch (error) {
    res.status(500).json({ error: "Erro ao chamar o Gemini" });
  }
}
