import { ref } from "vue";
import { defineStore } from "pinia";
import { api } from "../services/api.js";

export const useChatStore = defineStore("chat", () => {
  const messages = ref([]);
  const isLoading = ref(false);

  const ask = async (question) => {
    messages.value.push({ role: "user", content: question });
    isLoading.value = true;
    try {
      const { data } = await api.post("/chat/ask", { question });
      messages.value.push({
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      });
      return data;
    } finally {
      isLoading.value = false;
    }
  };

  const clear = () => {
    messages.value = [];
  };

  return { messages, isLoading, ask, clear };
});
