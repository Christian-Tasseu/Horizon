<template>
  <div class="habits">
    <h1>Mes habitudes</h1>
    <form @submit.prevent="handleCreate" class="habit-form">
      <input
        v-model="name"
        type="text"
        placeholder="Nom (ex: Sport)"
        required
      />
      <input v-model="description" type="text" placeholder="Description" />
      <button type="submit">Ajouter</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <ul class="habit-list">
      <li v-for="habit in habitsStore.habits" :key="habit.id">
        <div class="habit-header">
          <span>{{ habit.name }}</span>
          <div class="habit-actions">
            <button type="button" @click="handleLog(habit.id)">
              {{ habit.isDone ? "Défaire.." : "Fait.." }}
            </button>
            <button
              type="button"
              class="danger"
              @click="handleArchive(habit.id)"
            >
              Archiver
            </button>
          </div>
        </div>
        <HabitHeatmap :logs="habitsStore.logs[habit.id]" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useHabitsStore } from "../stores/habits.store.js";
import { formatDate } from "../utils/date.js";
import HabitHeatmap from "../components/HabitHeatmap.vue";

const name = ref("");
const description = ref("");
const errorMessage = ref("");

const habitsStore = useHabitsStore();

onMounted(async () => {
  await habitsStore.fetchHabits();
  for (const habit of habitsStore.habits) {
    await habitsStore.fetchLogs(habit.id);
    habit.isDone = habitsStore.logs[habit.id].some(
      (log) => log.completed && log.log_date === today()
    );
  }
});

const today = () => formatDate(new Date());

const handleCreate = async () => {
  errorMessage.value = "";
  try {
    await habitsStore.createHabit({
      name: name.value,
      description: description.value,
      frequency: "daily",
      color: "#1D9E75",
    });
    name.value = "";
    description.value = "";
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.error || "Erreur interne du serveur";
  }
};

const handleLog = async (habitId) => {
  errorMessage.value = "";
  if (habitsStore.logs[habitId].some((log) => log.completed && log.log_date === today())) {
    const logToRemove = habitsStore.logs[habitId].find(
      (log) => log.completed && log.log_date === today()
    );
    if (logToRemove) {
      try {
        await habitsStore.removeLog({ habitId, logId: logToRemove.id });
        await habitsStore.fetchLogs(habitId);
        const habit = habitsStore.habits.find((h) => h.id === habitId);
        if (habit) {
          habit.isDone = false;
        }
      } catch (error) {
        errorMessage.value =
          error?.response?.data?.error || "Erreur interne du serveur";
      }
    }
  } else {
      try {
      await habitsStore.logHabit({
        habitId,
        logDate: today(),
        completed: true,
        note: "",
      });
      await habitsStore.fetchLogs(habitId);
      const habit = habitsStore.habits.find((h) => h.id === habitId);
      if (habit) {
        habit.isDone = true;
      }
    } catch (error) {
      errorMessage.value =
        error?.response?.data?.error || "Erreur interne du serveur";
    }
  }
};

const handleArchive = async (habitId) => {
  errorMessage.value = "";
  try {
    await habitsStore.archiveHabit(habitId);
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.error || "Erreur interne du serveur";
  }
};
</script>

<style scoped>
.habits {
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 24px;
}

.habits h1 {
  margin-bottom: 24px;
}

.habit-form {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.habit-form input {
  flex: 1;
  padding: 10px 12px;
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-ink);
}

.habit-form button {
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
}

.habit-form button:hover {
  background: #17825f;
}

.habit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.habit-list li {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-surface);
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px 16px;
}

.habit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.habit-actions {
  display: flex;
  gap: 8px;
}

.habit-actions button {
  padding: 6px 12px;
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-ink);
  cursor: pointer;
}

.habit-actions button:hover {
  border-color: var(--color-accent);
}

.habit-actions .danger:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.error {
  color: var(--color-danger);
  margin: 0 0 16px;
}
</style>
