<template>
  <div class="chat">
    <h1>Poser une question à mon journal</h1>

    <ul class="messages">
      <li
        v-for="(message, index) in chatStore.messages"
        :key="index"
        :class="message.role"
      >
        <p class="text">{{ message.content }}</p>
        <details
          v-if="message.sources && message.sources.length"
          class="sources"
        >
          <summary>Extraits utilisés ({{ message.sources.length }})</summary>
          <ul>
            <li v-for="source in message.sources" :key="source.id">
              <time>{{ formatDateTime(source.created_at) }}</time>
              <span>{{ source.content }}</span>
            </li>
          </ul>
        </details>
      </li>
    </ul>

    <p v-if="chatStore.loading" class="loading">Je cherche dans ton journal…</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <form @submit.prevent="handleAsk" class="ask-form">
      <input
        v-model="question"
        type="text"
        placeholder="Pose ta question…"
        required
      />
      <button type="submit" :disabled="chatStore.loading">Envoyer</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useChatStore } from "../stores/chat.store";
import { formatDateTime } from "../utils/date.js";

const question = ref("");
const errorMessage = ref("");


  const chatStore = useChatStore();

const handleAsk = async () => {
  errorMessage.value = "";
  const ask = question.value;
  question.value = "";

  try {
    await chatStore.ask(ask);
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.error || "Erreur interne du serveur.";
  }
};
</script>

<style scoped>
.chat {
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 24px;
}
.chat h1 {
  margin-bottom: 24px;
}
.messages {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.messages > li {
  padding: 12px 16px;
  border-radius: var(--radius);
  max-width: 85%;
}
.messages > li.user {
  align-self: flex-end;
  background: var(--color-accent);
  color: #fff;
}
.messages > li.assistant {
  align-self: flex-start;
  background: var(--color-surface);
  border: 0.5px solid var(--color-border);
}
.text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
}
.sources {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-ink-soft);
}
.sources ul {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sources time {
  display: block;
  font-size: 12px;
}
.loading {
  color: var(--color-ink-soft);
  margin: 0 0 16px;
}
.ask-form {
  display: flex;
  gap: 8px;
}
.ask-form input {
  flex: 1;
  padding: 10px 12px;
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-ink);
}
.ask-form button {
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
}
.ask-form button:disabled {
  opacity: 0.5;
  cursor: default;
}
.error {
  color: var(--color-danger);
  margin: 0 0 16px;
}
</style>
