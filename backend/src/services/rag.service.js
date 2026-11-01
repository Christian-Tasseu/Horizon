import { journalService } from "./journal.service.js";
import { llmService } from "./llm.service.js";
import { conversationService } from "./conversation.service.js";

const SYSTEM_RULES = `Tu es un assistant qui aide l'utilisateur à relire son journal personnel.
Réponds uniquement à partir des extraits ci-dessous.
Si les extraits ne permettent pas de répondre, dis-le clairement.
N'invente rien.
Cite la date des extraits quand tu t'y réfères.
Adresse-toi à l'utilisateur par "tu" et non par "vous".`;
const HISTORY_LIMIT = 4;
const HISTORY_MAX_CHARS = 500;
const FOLLOW_UP_MAX_CHARS = 40;

export const ragService = {
  buildUserMessage(question, entries) {
    const newEntries = entries
      .map(
        (entry) =>
          `- [${new Date(entry.created_at).toLocaleDateString("fr-FR", {
            dateStyle: "long",
          })}] ${entry.content}`,
      )
      .join("\n");

    return `Extraits du journal :
${newEntries}

Question : ${question}

Réponds uniquement à partir des extraits ci-dessus, sans poser de question.`;
  },

  async answer({ userId, conversationId, question }) {
    const history = await conversationService.getHistory({
      userId,
      conversationId,
    });
    const limitedHistory = history.slice(-HISTORY_LIMIT).map((message) => ({
      ...message,
      content: message.content.slice(0, HISTORY_MAX_CHARS),
    }));
    let searchQuery = question;

    const lastUserMessage = history.findLast(
      (message) => message.role === "user",
    );

    if (question.length < FOLLOW_UP_MAX_CHARS && lastUserMessage) {
      searchQuery = lastUserMessage.content + "\n" + question;
    }
    const entries = await journalService.search({
      userId,
      query: searchQuery,
    });
    if (entries.length === 0) {
      const answer =
        "Je ne trouve rien dans ton journal qui réponde à cette question.";

      const savedConversation = await conversationService.saveExchange({
        userId,
        conversationId,
        question,
        answer,
      });

      return {
        conversationId: savedConversation.conversationId,
        answer,
        sources: [],
      };
    }
    const messages = [
      { role: "system", content: SYSTEM_RULES },
      ...limitedHistory,
      {
        role: "user",
        content: ragService.buildUserMessage(question, entries),
      },
    ];
    const answer = await llmService.chat(messages);
    const savedConversation = await conversationService.saveExchange({
      userId,
      conversationId,
      question,
      answer,
    });
    return {
      conversationId: savedConversation.conversationId,
      answer,
      sources: entries,
    };
  },
};
