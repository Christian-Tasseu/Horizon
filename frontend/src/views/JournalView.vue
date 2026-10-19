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
      <li v-for="entry in journalStore.entries" :key="entry.id">
        <time>{{ formatDateTime(entry.created_at) }}</time>

        <form
          v-if="editingId === entry.id"
          @submit.prevent="handleUpdate"
          class="edit-form"
        >
          <textarea v-model="draft" rows="4" required></textarea>
          <div class="entry-actions">
            <button type="button" class="secondary" @click="cancelEdit">
              Annuler
            </button>
            <button type="submit">Enregistrer</button>
          </div>
        </form>

        <template v-else>
          <p class="entry-content">{{ entry.content }}</p>
          <button type="button" class="link" @click="startEdit(entry)">
            Modifier
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
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 24px;
}

.journal h1 {
  margin-bottom: 24px;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.entry-form textarea {
  padding: 12px;
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-ink);
  resize: vertical;
}

.entry-form button {
  align-self: flex-end;
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
}

.entry-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-list li {
  background: var(--color-surface);
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
}

.entry-list time {
  font-size: 12px;
  color: var(--color-ink-soft);
}

.entry-content {
  margin: 6px 0 0;
  font-family: var(--font-heading);
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty {
  color: var(--color-ink-soft);
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
  padding: 12px;
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-ink);
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
  padding: 8px 14px;
  border: none;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
}

.entry-actions .secondary {
  background: var(--color-surface);
  color: var(--color-ink);
  border: 0.5px solid var(--color-border);
}

.link {
  margin-top: 8px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-ink-soft);
  font-size: 13px;
  cursor: pointer;
}

.link:hover {
  color: var(--color-accent);
}
</style>
