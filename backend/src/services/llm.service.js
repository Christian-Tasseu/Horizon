const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "llama3.2:3b";

export const llmService = {
  async generate(prompt) {
    let response;
    try {
      response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      });
      
    } catch {
      const error = new Error(
        "L'IA locale ne répond pas. Ollama est-il lancé ?",
      );
      error.status = 503;
      throw error;
    }
    if (!response.ok) {
        const error = new Error(
          "Une erreur est survenue lors de la communication avec l'IA.",
        );
        error.status = 503;
        throw error;
      }
      const res = await response.json()
      return res.message.content;
  },
};
