export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ text: "Erro: Chave API não configurada na Vercel." });
  }

  // Personalidade injetada diretamente no contexto para máxima compatibilidade
  const systemPrompt = "INSTRUÇÃO DE SISTEMA: Você é o KMFly, um agente de viagens VIP de elite. Seja extremamente empolgado, persuasivo e use emojis. Organize as respostas com negritos. RESPONDA SEMPRE NO IDIOMA QUE O USUÁRIO FALAR.";

  // Formatando as mensagens
  const contents = messages.map((m, index) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: (index === 0 && m.role !== 'assistant' ? systemPrompt + "\n\n" + m.content : m.content || m.text) }]
  }));

  // URL estável v1
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ text: `Erro do Google: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiText });
    } 
    
    return res.status(200).json({ text: "Ocorreu um erro na geração da resposta. Tente novamente!" });

  } catch (error) {
    return res.status(500).json({ error: "Erro de conexão." });
  }
}
