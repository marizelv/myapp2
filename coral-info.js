// api/coral-info.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { species } = req.body;

    const prompt = `
You are a marine biologist and coral taxonomy expert. 
Use https://coralsoftheworld.org and other scientific sources for the coral species **${species}**.

Provide a concise scientific summary of the coral species **${species}**, including:
- Common name (if available)
- Morphological features (form, color, and corallite)
- Characteristics, Color, Abundance
- Typical habitat and distribution
- Ecological importance or threats
- Endangered species or not
Write the answer in Endangered Species as first answer and 150 words.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert coral reef biologist." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to get OpenAI response'
      });
    }

    return res.status(200).json({
      details: data.choices[0].message.content.trim(),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
