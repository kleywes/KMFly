export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ text: "Erro: Chave API não configurada na Vercel." });
  }

  // Ajuste fino no formato das mensagens para evitar erros de validação
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || m.text) }]
  }));

  const systemInstruction = "Você é o KMFly, um agente de viagens VIP de elite. Seja extremamente empolgado, persuasivo e use muitos emojis. Organize as respostas com negritos e cabeçalhos.";

  // Mudamos para a versão v1 (estável) e garantimos o nome do modelo correto
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: { 
          parts: [{ text: systemInstruction }] 
        },
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erro detalhado do Google:", data.error);
      return res.status(200).json({ text: `Erro do Google: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiText });
    } 
    
    return res.status(200).json({ text: "O Google não gerou uma resposta. Tente reformular sua pergunta." });

  } catch (error) {
    return res.status(500).json({ error: "Erro de conexão com o servidor da API." });
  }
}
