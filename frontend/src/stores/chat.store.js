import { defineStore } from "pinia";
import { api } from "../services/api";
import { ref } from "vue";

export const useChatStore = defineStore("chat", () => {
  const messages = ref([]);
  const loading = ref(false);

  const ask = async (question) => {
    messages.value.push({ role: "user", content: question });
    loading.value = true;
    try {
      const { data } = await api.post("/chat/ask", { question });
      messages.value.push({
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      });
    } finally {
      loading.value = false;
    }
  };

  return { messages, loading, ask };
});
