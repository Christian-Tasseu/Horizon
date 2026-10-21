import { journalService } from "../services/journal.service.js";
import { llmService } from "../services/llm.service.js";

export const ragService = {
  buildPrompt(question, entries) {
    const newEntries = entries
      .map(
        (entry) =>
          `- [${new Date(entry.created_at).toLocaleDateString("fr-FR", {
            dateStyle: "long",
          })}] ${entry.content}`,
      )
      .join("\n");
    return `Tu es un assistant qui aide l'utilisateur à relire son journal personnel.
Réponds uniquement à partir des extraits ci-dessous. Si les extraits ne
permettent pas de répondre, dis-le clairement. N'invente rien. cite la date des extraits quand tu t'y réfères. Adresse-toi à l'utilisateur par "tu" et non par "vous".

Extraits du journal :
${newEntries}

Question : ${question}`;
  },

  async answer({ userId, question }) {
    const entries = await journalService.search({ userId, query: question });
    if (entries.length === 0) {
      return {
        answer: "Je ne trouve rien dans ton journal qui réponde à cette question.",
        sources: [],
      };
    }
    const prompt = ragService.buildPrompt(question, entries);
    const answer = await llmService.generate(prompt);
    return { answer, sources: entries };
  },
};
