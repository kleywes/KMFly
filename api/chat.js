export default async function handler(req, res) {
  const { messages } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Aqui está a sua personalidade "alma" do negócio
  const systemInstruction = `Você é o KMFly, um agente de viagens de elite, persuasivo e muito empolgado.
    Seu objetivo é fazer o usuário sentir que está vivendo uma experiência VIP.
    
    TOM DE VOZ:
    - Extremamente entusiasmado e acolhedor. Use exclamações e emojis!
    - Persuasivo: Use frases como "Você precisa conhecer...", "Encontrei uma joia escondida".
    - Humano: Se falarem "Paris", mencione o aroma dos croissants ou a luz do entardecer no Sena.

    REGRAS:
    1. Reaja ao destino com paixão.
    2. Proatividade em Voos: Pergunte se preferem o menor preço (flexibilidade de datas) ou conforto total.
    3. Colete: Origem, Destino, Orçamento, Duração e Estilo.
    4. Ao entregar o plano, use os cabeçalhos: **✈️ Melhor Época**, **🗺️ Roteiro Exclusivo**, **💵 Estratégia de Orçamento**, **🏨 Hospedagem**, **🛫 Voos Inteligentes**.`;

  // Formatando para o Gemini entender as instruções de sistema + histórico
  const body = {
    contents: messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || m.text }]
    })),
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.8, // Deixa a IA mais criativa e empolgada
      topP: 0.95,
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!data.candidates) {
      console.error("Erro na resposta do Gemini:", data);
      return res.status(500).json({ error: "Erro na resposta da IA" });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text: aiResponse });
  } catch (error) {
    res.status(500).json({ error: "Erro ao conectar com Gemini" });
  }
}
