import { chatRepository } from "../repositories/chat.repository.js";

const assertOwned = async ({ userId, conversationId }) => {
  const conversation = await chatRepository.findConversationById({
    id: conversationId,
  });

  if (!conversation || conversation.user_id !== userId) {
    const error = new Error("Conversation introuvable");
    error.status = 404;
    throw error;
  }
};

export const conversationService = {
  async saveExchange({ userId, conversationId, question, answer, sources }) {
    let currentConversationId = conversationId;

    if (currentConversationId) {
      await assertOwned({ userId, conversationId: currentConversationId });
    } else {
      currentConversationId = await chatRepository.createConversation({
        userId,
        title: question.trim().slice(0, 60),
      });
    }

    await chatRepository.addMessage({
      conversationId: currentConversationId,
      role: "user",
      content: question,
      sources: null,
    });

    await chatRepository.addMessage({
      conversationId: currentConversationId,
      role: "assistant",
      content: answer,
      sources,
    });

    return { conversationId: currentConversationId };
  },
  async list(userId) {
    const conversations = await chatRepository.findConversationsByUser({
      userId,
    });
    return conversations;
  },
  async remove({ userId, conversationId }) {
    await assertOwned({ userId, conversationId })
    await chatRepository.deleteConversation({ id: conversationId })
  },
  async getMessages({ userId, conversationId }) {
    await assertOwned({ userId, conversationId });
    return await chatRepository.findMessages({ conversationId });
  },
  async getHistory({ userId, conversationId, limit }) {
    if (!conversationId) {
      return [];
    } else {
      await assertOwned({ userId, conversationId });
      const messages = await chatRepository.findRecentMessages({ conversationId, limit });
      return messages;
    }
  },
};
