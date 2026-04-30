export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Se a chave não existir, avisa logo
  if (!apiKey) {
    return res.status(200).json({ text: "Erro: Chave API não configurada na Vercel." });
  }

  // O Gemini é chato com a ordem das mensagens (deve ser user -> model -> user)
  // Esse filtro garante que não enviemos nada fora dessa ordem
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || m.text) }]
  }));

  const systemInstruction = "Você é o KMFly, um agente de viagens VIP. Seja empolgado e persuasivo.";

  // Usando o modelo mais estável disponível hoje
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

    // Se o Google der erro de API, ele avisa aqui
    if (data.error) {
      console.error("Erro do Google:", data.error.message);
      return res.status(200).json({ text: `Erro do Google: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiText });
    } 
    
    return res.status(200).json({ text: "O Google recebeu a mensagem, mas não gerou resposta. Tente um destino diferente!" });

  } catch (error) {
    return res.status(500).json({ error: "Erro total na conexão com o servidor." });
  }
}
