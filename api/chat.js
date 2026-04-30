export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Filtro de segurança para o formato do Gemini
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || m.text) }]
  }));

  const systemInstruction = "Você é o KMFly, um agente de viagens VIP, extremamente empolgado e persuasivo. Use emojis e organize o roteiro com negritos.";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiText });
    } else {
      console.error("Resposta inválida do Gemini:", data);
      return res.status(200).json({ text: "Desculpe, tive um pequeno problema técnico. Pode repetir?" });
    }
  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
}
