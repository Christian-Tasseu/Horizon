<template>
  <div class="journal">
    <h1>Mon journal</h1>

    <form @submit.prevent="handleCreate" class="entry-form">
      <textarea
        v-model="content"
        placeholder="Qu'as-tu en tête aujourd'hui ?"
        rows="4"
        required
      ></textarea>
      <button type="submit">Enregistrer</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <p v-if="journalStore.entries.length === 0" class="empty">
      Aucune entrée pour l'instant.
    </p>

    <ul class="entry-list">
      <li
        v-for="entry in journalStore.entries"
        :key="entry.id"
        :class="{ 'is-editing': editingId === entry.id }"
      >
        <time>{{ formatDateTime(entry.created_at) }}</time>
        <span v-if="editingId === entry.id" class="editing-badge">
          Modification en cours
        </span>

        <form
          v-if="editingId === entry.id"
          @submit.prevent="handleUpdate"
          class="edit-form"
        >
          <textarea v-model="draft" rows="4" required></textarea>
          <div class="entry-actions">
            <button type="button" class="secondary cancel-button" @click="cancelEdit">
              Annuler
            </button>
            <button type="submit">Enregistrer</button>
          </div>
        </form>

        <template v-else>
          <p class="entry-content">{{ entry.content }}</p>
          <button
            type="button"
            class="edit-button"
            aria-label="Modifier l'entrée"
            title="Modifier l'entrée"
            @click="startEdit(entry)"
          >
            <span aria-hidden="true">&#9997;</span>
          </button>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useJournalStore } from "../stores/journal.store.js";
import { formatDateTime } from "../utils/date.js";

const errorMessage = ref("");
const content = ref("");
const editingId = ref(null);
const draft = ref("");

const journalStore = useJournalStore();

onMounted(async () => {
  try {
    await journalStore.fetchEntries();
  } catch (error) {
    errorMessage.value = "Erreur lors du chargement des entrées.";
  }
});

const handleCreate = async () => {
  errorMessage.value = "";
  try {
    await journalStore.createEntry({ content: content.value });
    content.value = "";
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.error || "Erreur interne du serveur.";
  }
};

const startEdit = (entry) => {
  editingId.value = entry.id;
  draft.value = entry.content;
};

const cancelEdit = () => {
  editingId.value = null;
  draft.value = "";
};

const handleUpdate = async () => {
  errorMessage.value = "";
  try {
    await journalStore.updateEntry({id: editingId.value, content: draft.value });
    editingId.value = null;
    draft.value = "";
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.error || "Erreur interne du serveur.";
  }
};
</script>

<style scoped>
.journal {
  min-height: calc(100vh - 65px);
  width: 100%;
  padding: 56px clamp(24px, 6vw, 88px) 80px;
  background:
    radial-gradient(circle at 95% 3%, rgba(52, 120, 168, 0.14), transparent 20%),
    linear-gradient(180deg, #f1f6fa 0%, #eaf1f6 100%);
}

.journal h1 {
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(52, 120, 168, 0.2);
  color: #19324a;
  font-size: clamp(44px, 7vw, 78px);
  line-height: 0.95;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 42px 0 34px;
  padding: 26px 28px 28px;
  border: 1px solid rgba(52, 120, 168, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.52);
}

.entry-form textarea {
  min-height: 120px;
  padding: 13px 14px;
  border: 1px solid #d1dce6;
  border-radius: 5px;
  outline: none;
  background: #fafdff;
  color: #19324a;
  line-height: 1.6;
  resize: vertical;
}

.entry-form textarea:focus,
.edit-form textarea:focus {
  border-color: #3478a8;
  box-shadow: 0 0 0 3px rgba(52, 120, 168, 0.13);
}

.entry-form button {
  align-self: flex-end;
  padding: 14px 16px;
  border: none;
  border-radius: 5px;
  background: #3478a8;
  color: #f5f9fc;
  cursor: pointer;
  font-weight: 700;
}

.entry-form button:hover,
.entry-actions button:hover {
  background: #4e8fba;
}

.entry-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry-list li {
  min-width: 0;
  padding: 22px;
  border: 1px solid rgba(52, 120, 168, 0.18);
  border-left: 3px solid #3478a8;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 12px 30px rgba(25, 50, 74, 0.06);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.entry-list li.is-editing {
  border-color: #3478a8;
  box-shadow:
    0 0 0 3px rgba(52, 120, 168, 0.18),
    0 16px 34px rgba(25, 50, 74, 0.12);
  animation: editing-pulse 1.8s ease-in-out infinite;
  transform: translateY(-2px);
}

.entry-list time {
  color: #68746f;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.entry-content {
  margin: 10px 0 0;
  color: #19324a;
  font-family: var(--font-heading);
  font-size: 20px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.editing-badge {
  display: inline-block;
  margin: 10px 0 0;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(52, 120, 168, 0.12);
  color: #286389;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@keyframes editing-pulse {
  0%, 100% {
    box-shadow:
      0 0 0 3px rgba(52, 120, 168, 0.18),
      0 16px 34px rgba(25, 50, 74, 0.12);
  }
  50% {
    box-shadow:
      0 0 0 6px rgba(52, 120, 168, 0.1),
      0 16px 38px rgba(25, 50, 74, 0.16);
  }
}

.empty {
  padding: 36px 0;
  border-top: 1px solid rgba(52, 120, 168, 0.18);
  color: #68746f;
  font-family: var(--font-heading);
  font-size: 22px;
}

.error {
  color: var(--color-danger);
  margin: 0 0 16px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.edit-form textarea {
  min-height: 120px;
  padding: 13px 14px;
  border: 1px solid #d1dce6;
  border-radius: 5px;
  outline: none;
  background: #fafdff;
  color: #19324a;
  font-family: var(--font-heading);
  line-height: 1.6;
  resize: vertical;
}

.entry-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.entry-actions button {
  padding: 10px 13px;
  border: none;
  border-radius: 5px;
  background: #3478a8;
  color: #f5f9fc;
  cursor: pointer;
  font-weight: 700;
}

.entry-actions .secondary {
  background: #fff;
  color: #a63d4d;
  border: 1px solid #c45c6b;
}

.entry-actions .cancel-button:hover {
  border-color: #a63d4d;
  background: #f9dfe3;
  color: #812c3b;
}

.edit-button {
  margin-top: 8px;
  padding: 8px;
  border: 1px solid rgba(166, 61, 77, 0.28);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.42);
  color: #a63d4d;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.edit-button:hover {
  border-color: #a63d4d;
  background: #f9dfe3;
  box-shadow: 0 3px 10px rgba(166, 61, 77, 0.16);
  color: #812c3b;
  transform: translateX(-2px);
}

@media (max-width: 480px) {
  .journal {
    padding: 36px 20px 56px;
  }

  .journal h1 {
    font-size: 48px;
  }

  .entry-form {
    padding: 22px 18px;
  }

  .entry-form button {
    align-self: stretch;
  }
}

@media (max-width: 780px) {
  .entry-list {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .entry-list li.is-editing {
    animation: none;
  }
}
</style>
