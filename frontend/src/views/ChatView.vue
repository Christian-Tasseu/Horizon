<template>
  <main class="chat-page">
    <section class="chat-shell" aria-labelledby="chat-title">
      <header class="chat-header">
        <div>
          <p class="eyebrow">Ton journal, autrement</p>
          <h1 id="chat-title">Parler à mon journal</h1>
          <p class="chat-intro">
            Pose une question et retrouve les motifs qui se cachent dans tes
            notes.
          </p>
        </div>
        <button
          v-if="chat.messages.length"
          class="clear-button"
          type="button"
          @click="chat.clear"
        >
          Nouvelle conversation
        </button>
      </header>

      <div v-if="!chat.messages.length" class="empty-chat">
        <div class="empty-icon" aria-hidden="true">✦</div>
        <h2>Que veux-tu comprendre aujourd'hui ?</h2>
        <p>
          Je m'appuie uniquement sur les entrées de ton journal pour répondre.
        </p>
        <div class="suggestions">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="button"
            @click="useSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <div v-else ref="messageList" class="message-list" aria-live="polite">
        <article
          v-for="(message, index) in chat.messages"
          :key="`${message.role}-${index}`"
          class="message"
          :class="`message--${message.role}`"
        >
          <span class="message-label">
            {{ message.role === "user" ? "Toi" : "Horizon" }}
          </span>
          <p>{{ message.content }}</p>
          <details v-if="message.sources?.length" class="sources">
            <summary class="source-count">
              {{ message.sources.length }}
              {{ message.sources.length > 1 ? "extraits utilisés" : "extrait utilisé" }}
            </summary>
            <ul class="source-list">
              <li v-for="source in message.sources" :key="source.id">
                <time v-if="source.created_at">{{ source.created_at }}</time>
                <span>{{ source.content }}</span>
              </li>
            </ul>
          </details>
        </article>
        <div v-if="chat.isLoading" class="message message--assistant loading-message">
          <span class="message-label">Horizon</span>
          <span class="typing-dots" aria-label="Horizon réfléchit">
            <i></i><i></i><i></i>
          </span>
        </div>
      </div>

      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

      <form class="question-form" @submit.prevent="handleSubmit">
        <label class="sr-only" for="question">Ta question</label>
        <textarea
          id="question"
          v-model="question"
          rows="2"
          maxlength="500"
          placeholder="Ex : Qu'est-ce qui m'aide à me sentir bien ?"
          :disabled="chat.isLoading"
          required
          @keydown.enter.exact.prevent="handleSubmit"
        ></textarea>
        <button
          class="send-button"
          type="submit"
          :disabled="chat.isLoading || !question.trim()"
          aria-label="Envoyer la question"
        >
          <span aria-hidden="true">&#8593;</span>
        </button>
      </form>
      <p class="privacy-note">Les réponses sont générées à partir de ton journal.</p>
    </section>
  </main>
</template>

<script setup>
import { nextTick, ref } from "vue";
import { useChatStore } from "../stores/chat.store.js";

const chat = useChatStore();
const question = ref("");
const errorMessage = ref("");
const messageList = ref(null);
const suggestions = [
  "Quels sont mes moments les plus sereins ?",
  "Qu'est-ce qui revient souvent dans mes pensées ?",
];

const scrollToBottom = async () => {
  await nextTick();
  messageList.value?.scrollTo({
    top: messageList.value.scrollHeight,
    behavior: "smooth",
  });
};

const handleSubmit = async () => {
  const value = question.value.trim();
  if (!value || chat.isLoading) return;

  errorMessage.value = "";
  question.value = "";
  try {
    await chat.ask(value);
    await scrollToBottom();
  } catch (error) {
    question.value = value;
    errorMessage.value =
      error?.response?.data?.error ||
      "Impossible de joindre l'assistant pour le moment.";
  }
};

const useSuggestion = (suggestion) => {
  question.value = suggestion;
  handleSubmit();
};
</script>

<style scoped>
.chat-page {
  min-height: calc(100vh - 72px);
  padding: 48px 24px 64px;
}

.chat-shell {
  width: min(760px, 100%);
  min-height: min(720px, calc(100vh - 136px));
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: clamp(24px, 5vw, 48px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(27, 36, 48, 0.06);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-border);
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.chat-header h1 {
  font-size: clamp(30px, 5vw, 44px);
}

.chat-intro {
  max-width: 440px;
  margin: 12px 0 0;
  color: var(--color-ink-soft);
  line-height: 1.6;
}

.clear-button {
  flex: 0 0 auto;
  padding: 8px 0;
  border: 0;
  background: none;
  color: var(--color-ink-soft);
  cursor: pointer;
  font-size: 12px;
}

.clear-button:hover {
  color: var(--color-accent);
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 52px 0;
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  margin-bottom: 22px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 24px;
}

.empty-chat h2 {
  font-size: 24px;
}

.empty-chat p {
  max-width: 360px;
  margin: 10px 0 26px;
  color: var(--color-ink-soft);
  line-height: 1.5;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.suggestions button {
  padding: 9px 13px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-bg);
  color: var(--color-ink-soft);
  cursor: pointer;
  font-size: 12px;
}

.suggestions button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 480px;
  overflow-y: auto;
  padding: 28px 4px;
}

.message {
  max-width: 84%;
  padding: 14px 18px;
  border-radius: 14px;
  line-height: 1.6;
}

.message--user {
  align-self: flex-end;
  background: var(--color-accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message--assistant {
  align-self: flex-start;
  background: var(--color-bg);
  border-bottom-left-radius: 4px;
}

.message-label {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
}

.message p {
  margin: 0;
  white-space: pre-wrap;
}

.source-count {
  display: inline-block;
  margin-top: 9px;
  color: var(--color-ink-soft);
  font-size: 11px;
  cursor: pointer;
}

.source-count:hover {
  color: var(--color-accent);
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.source-list li {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 10px;
  border-left: 2px solid var(--color-accent);
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  font-size: 12px;
}

.source-list time {
  color: var(--color-ink-soft);
  font-size: 10px;
}

.question-form {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
}

.question-form textarea {
  flex: 1;
  min-height: 52px;
  padding: 14px;
  resize: none;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  outline: none;
  background: var(--color-bg);
  color: var(--color-ink);
}

.question-form textarea:focus {
  border-color: var(--color-accent);
}

.send-button {
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 12px;
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
  font-size: 22px;
}

.send-button:hover:not(:disabled) {
  background: #17825f;
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.privacy-note {
  margin: 12px 0 0;
  color: var(--color-ink-soft);
  font-size: 11px;
  text-align: center;
}

.error {
  margin: 0 0 12px;
  color: var(--color-danger);
  font-size: 13px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 8px 0 3px;
}

.typing-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: pulse 1s infinite ease-in-out;
}

.typing-dots i:nth-child(2) { animation-delay: 0.15s; }
.typing-dots i:nth-child(3) { animation-delay: 0.3s; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0.35; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-2px); }
}

@media (max-width: 560px) {
  .chat-page {
    padding: 24px 12px;
  }

  .chat-shell {
    min-height: calc(100vh - 112px);
    padding: 22px 16px;
  }

  .chat-header {
    flex-direction: column;
    gap: 12px;
  }

  .message {
    max-width: 94%;
  }
}
</style>
