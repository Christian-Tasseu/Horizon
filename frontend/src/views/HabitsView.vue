<template>
  <div class="habits">
    <header class="page-header">
      <div>
        <p class="eyebrow">Tableau de bord / Horizon</p>
        <h1>Mes habitudes<span>.</span></h1>
        <p class="page-subtitle">
          Un rythme simple, visible, et assez souple pour durer.
        </p>
      </div>
      <div class="today-card">
        <span>Aujourd'hui</span>
        <strong>{{ displayDate }}</strong>
      </div>
    </header>

    <section class="create-section" aria-labelledby="create-title">
      <div class="section-label">
        <span class="section-number">01</span>
        <div>
          <p class="eyebrow">Nouveau départ</p>
          <h2 id="create-title">Ajouter une habitude</h2>
        </div>
      </div>
      <form @submit.prevent="handleCreate" class="habit-form">
        <label>
          <span>Nom</span>
          <input
            v-model="name"
            type="text"
            placeholder="Ex : Lire 20 minutes"
            required
          />
        </label>
        <label>
          <span>Intention</span>
          <input
            v-model="description"
            type="text"
            placeholder="Pourquoi est-ce important ?"
          />
        </label>
        <label class="color-field">
          <span>Couleur</span>
          <span class="color-picker">
            <input v-model="color" type="color" aria-label="Choisir une couleur" />
            <strong>{{ color }}</strong>
          </span>
        </label>
        <button type="submit">
          <span>Ajouter</span>
          <span aria-hidden="true">&#8594;</span>
        </button>
      </form>
    </section>

    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <section class="habits-section" aria-labelledby="habits-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Ton rythme</p>
          <h2 id="habits-title">En ce moment</h2>
        </div>
        <span class="habit-count"
          >{{ habitsStore.habits.length }} habitude<span
            v-if="habitsStore.habits.length !== 1"
            >s</span
          ></span
        >
      </div>

      <ul class="habit-list">
        <li
          v-for="habit in habitsStore.habits"
          :key="habit.id"
          class="habit-card"
          :style="{ '--habit-color': habit.color || '#3478a8' }"
        >
          <div class="habit-header">
            <div class="habit-title">
              <span class="status-mark" :class="{ done: habit.isDone }"></span>
              <div>
                <h3>{{ habit.name }}</h3>
                <p v-if="habit.description">{{ habit.description }}</p>
              </div>
            </div>
            <span class="habit-state">
              {{ habit.isDone ? "Accomplie aujourd'hui" : "À faire aujourd'hui" }}
            </span>
          </div>

          <div class="heatmap-wrap">
            <HabitHeatmap
              :logs="habitsStore.logs[habit.id]"
              :color="habit.color"
            />
          </div>

          <div class="habit-footer">
            <button
              type="button"
              class="complete-button"
              :class="{ completed: habit.isDone }"
              @click="handleLog(habit.id)"
            >
              <span>{{ habit.isDone ? "Défaire" : "Marquer comme fait" }}</span>
              <span aria-hidden="true">{{ habit.isDone ? "&#10003;" : "&#8594;" }}</span>
            </button>
            <button
              type="button"
              class="archive-button"
              aria-label="Archiver l'habitude"
              @click="handleArchive(habit.id)"
            >
              Archiver
            </button>
          </div>
        </li>
      </ul>

      <p v-if="!habitsStore.habits.length" class="empty-state">
        Ta première habitude peut commencer ici.
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useHabitsStore } from "../stores/habits.store.js";
import { formatDate } from "../utils/date.js";
import HabitHeatmap from "../components/HabitHeatmap.vue";

const name = ref("");
const description = ref("");
const color = ref("#1D9E75");
const errorMessage = ref("");
const displayDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

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
      color: color.value,
    });
    name.value = "";
    description.value = "";
    color.value = "#1D9E75";
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
  min-height: 100vh;
  width: 100%;
  padding: 56px clamp(24px, 6vw, 88px) 80px;
  background:
    radial-gradient(circle at 95% 3%, rgba(52, 120, 168, 0.14), transparent 20%),
    linear-gradient(180deg, #f1f6fa 0%, #eaf1f6 100%);
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(52, 120, 168, 0.2);
}

.eyebrow {
  margin: 0 0 12px;
  color: #3478a8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.page-header h1 {
  color: #19324a;
  font-size: clamp(44px, 7vw, 78px);
  line-height: 0.95;
}

.page-header h1 span {
  color: #3478a8;
}

.page-subtitle {
  margin: 18px 0 0;
  color: #68746f;
  font-size: 15px;
}

.today-card {
  min-width: 168px;
  padding: 15px 18px;
  border-left: 2px solid #3478a8;
  color: #68746f;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.today-card strong {
  display: block;
  margin-top: 8px;
  color: #19324a;
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: capitalize;
}

.create-section {
  margin: 42px 0 58px;
  padding: 26px 28px 28px;
  border: 1px solid rgba(52, 120, 168, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.52);
}

.section-label,
.section-heading {
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-number {
  color: #3478a8;
  font-family: var(--font-heading);
  font-size: 30px;
}

.create-section h2,
.habits-section h2 {
  color: #19324a;
  font-size: 25px;
}

.create-section .eyebrow,
.habits-section .eyebrow {
  margin-bottom: 5px;
}

.habit-form {
  display: grid;
  grid-template-columns: 1fr 1.35fr auto auto;
  align-items: end;
  gap: 12px;
  margin-top: 24px;
}

.habit-form label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: #19324a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.habit-form input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #d1dce6;
  border-radius: 5px;
  outline: none;
  background: #fafdff;
  color: #19324a;
  font-size: 14px;
}

.habit-form input:focus {
  border-color: #3478a8;
  box-shadow: 0 0 0 3px rgba(52, 120, 168, 0.13);
}

.color-field {
  min-width: 112px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
}

.habit-form .color-picker input[type="color"] {
  width: 42px;
  height: 42px;
  padding: 3px;
  border: 1px solid #d1dce6;
  border-radius: 5px;
  background: #fafdff;
  cursor: pointer;
}

.color-picker strong {
  color: #68746f;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.habit-form button,
.complete-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 16px;
  border: 0;
  border-radius: 5px;
  background: #3478a8;
  color: #f5f9fc;
  cursor: pointer;
  font-weight: 700;
  white-space: nowrap;
}

.habit-form button:hover,
.complete-button:hover {
  background: #4e8fba;
}

.habits-section {
  padding-bottom: 30px;
}

.section-heading {
  justify-content: space-between;
  margin-bottom: 20px;
}

.habit-count {
  color: #68746f;
  font-size: 12px;
}

.habit-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.habit-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 22px;
  padding: 22px;
  border: 1px solid rgba(52, 120, 168, 0.18);
  border-top: 3px solid var(--habit-color);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 12px 30px rgba(25, 50, 74, 0.06);
}

.habit-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.habit-title {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 12px;
}

.status-mark {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  margin-top: 7px;
  border: 2px solid var(--habit-color);
  border-radius: 50%;
}

.status-mark.done {
  background: var(--habit-color);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--habit-color) 15%, transparent);
}

.habit-title h3 {
  overflow: hidden;
  color: #19324a;
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.habit-title p {
  margin: 5px 0 0;
  color: #68746f;
  font-size: 12px;
}

.habit-state {
  color: #68746f;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-align: right;
  text-transform: uppercase;
}

.heatmap-wrap {
  min-width: 0;
  overflow-x: auto;
  padding-bottom: 2px;
}

.habit-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(52, 120, 168, 0.14);
}

.complete-button {
  padding: 10px 13px;
  font-size: 12px;
}

.complete-button.completed {
  background: #d7e7f2;
  color: #286389;
}

.archive-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #607d95;
  cursor: pointer;
  font-size: 11px;
}

.archive-button:hover {
  color: var(--color-danger);
  text-decoration: underline;
}

.empty-state {
  padding: 36px 0;
  border-top: 1px solid rgba(52, 120, 168, 0.18);
  color: #68746f;
  font-family: var(--font-heading);
  font-size: 22px;
}

.error {
  color: var(--color-danger);
  margin: -40px 0 34px;
  font-size: 13px;
}

@media (max-width: 780px) {
  .habits {
    padding: 36px 20px 56px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
    padding-bottom: 34px;
  }

  .today-card {
    min-width: 0;
  }

  .create-section {
    padding: 22px 18px;
  }

  .habit-form,
  .habit-list {
    grid-template-columns: 1fr;
  }

  .habit-form button {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 48px;
  }

  .habit-header {
    flex-direction: column;
  }

  .habit-state {
    text-align: left;
  }
}
</style>
