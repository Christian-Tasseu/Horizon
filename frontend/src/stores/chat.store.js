import { ref } from "vue";
import { defineStore } from "pinia";
import { api } from "../services/api.js";

export const useChatStore = defineStore("chat", () => {
  const messages = ref([]);
  const conversations = ref([]);
  const currentConversationId = ref(null);
  const isLoading = ref(false);

  const fetchConversations = async () => {
    const { data } = await api.get("/chat/conversations");
    conversations.value = data.conversations;
  };

  const openConversation = async (id) => {
    const { data } = await api.get(`/chat/conversations/${id}/messages`);
    messages.value = data.messages;
    currentConversationId.value = id;
  };

  const deleteConversation = async (id) => {
    await api.delete(`/chat/conversation/${id}`);
    if (id === currentConversationId.value) {
      newConversation();
    }
    await fetchConversations();
  };

  const newConversation = () => {
    messages.value = [];
    currentConversationId.value = null;
  };

  const ask = async (question) => {
    const isNewConversation = currentConversationId.value === null;
    messages.value.push({ role: "user", content: question });
    isLoading.value = true;
    try {
      const { data } = await api.post("/chat/ask", {
        question,
        conversationId: currentConversationId.value,
      });
      messages.value.push({
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      });
      currentConversationId.value = data.conversationId;
      if (isNewConversation) {
        try {
          await fetchConversations();
        } catch (error) {
          console.error(
            "Erreur lors du rafraîchissement des conversations :",
            error,
          );
        }
      }
      return data;
    } finally {
      isLoading.value = false;
    }
  };

  const summarizeWeek = async () => {
    isLoading.value = true;
    try {
      const { data } = await api.post("/chat/weekly-summary", {
        conversationId: currentConversationId.value,
      });
      messages.value.push({
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      });
      if (data.conversationId !== undefined) {
        currentConversationId.value = data.conversationId;
      }
      await fetchConversations();
      return data;
    } finally {
      isLoading.value = false;
    }
  };

  const clear = () => {
    messages.value = [];
    newConversation();
  };

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    ask,
    clear,
    summarizeWeek,
    fetchConversations,
    newConversation,
    openConversation,
    deleteConversation,
  };
});
