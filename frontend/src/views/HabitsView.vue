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
          <h2 id="create-title">
            {{
              editingId !== null
                ? "Modifier une habitude"
                : "Ajouter une habitude"
            }}
          </h2>
          <p v-if="editingId !== null" class="editing-context">
            Modification de « {{ draftName }} »
          </p>
        </div>
      </div>

      <form
        v-if="editingId !== null"
        class="habit-form"
        @submit.prevent="handleUpdate"
      >
        <label>
          <span>Nom</span>
          <input
            v-model="draftName"
            type="text"
            placeholder="Ex : Lire 20 minutes"
            required
          />
        </label>
        <label>
          <span>Intention</span>
          <input
            v-model="draftDesc"
            type="text"
            placeholder="Pourquoi est-ce important ?"
          />
        </label>
        <label class="color-field">
          <span>Couleur</span>
          <span class="color-picker">
            <input
              v-model="draftColor"
              type="color"
              aria-label="Choisir une couleur"
            />
            <strong>{{ draftColor }}</strong>
          </span>
        </label>
        <div class="form-actions">
          <button type="submit" class="submit-button">
            <span>Enregistrer</span>
            <span aria-hidden="true">&#8594;</span>
          </button>
          <button type="button" class="cancel-button" @click="cancelEdit">
            Annuler
          </button>
        </div>
      </form>

      <form v-else @submit.prevent="handleCreate" class="habit-form">
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
            <input
              v-model="color"
              type="color"
              aria-label="Choisir une couleur"
            />
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
        <div class="habit-filter">
          <button
            type="button"
            :class="{ active: !viewArchive }"
            @click="viewArchive = false"
          >
            Actives ({{ habitsStore.habits.length }})
          </button>
          <button
            type="button"
            :class="{ active: viewArchive }"
            @click="viewArchive = true"
          >
            Archivées ({{ habitsStore.archivedHabits.length }})
          </button>
        </div>
      </div>

      <ul v-if="viewArchive" class="habit-list">
        <li
          v-for="habit in habitsStore.archivedHabits"
          :key="habit.id"
          class="habit-card"
          :class="{ 'is-editing': editingId === habit.id }"
          :style="{ '--habit-color': habit.color || '#3478a8' }"
        >
          <span v-if="editingId === habit.id" class="editing-badge">
            Modification en cours
          </span>
          <div class="habit-header">
            <div class="habit-title">
              <span
                class="status-mark"
                :class="{ done: isDone(habit.id) }"
              ></span>
              <div>
                <h3>{{ habit.name }}</h3>
                <p v-if="habit.description">{{ habit.description }}</p>
              </div>
            </div>
            <span class="habit-state">
              {{
                isDone(habit.id)
                  ? "Accomplie aujourd'hui"
                  : "À faire aujourd'hui"
              }}
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
              :class="{ completed: isDone(habit.id) }"
              :style="{ backgroundColor: habit.color || '#3478a8' }"
              disabled
              @click="handleLog(habit.id)"
            >
              <span>{{
                isDone(habit.id) ? "Défaire" : "Marquer comme fait"
              }}</span>
              <span aria-hidden="true">{{
                isDone(habit.id) ? "&#10003;" : "&#8594;"
              }}</span>
            </button>
            <button
              type="button"
              class="edit-button"
              aria-label="Modifier l'habitude"
              title="Modifier l'habitude"
              disabled
              @click="startEdit(habit)"
            >
              <span aria-hidden="true">&#9997;</span>
            </button>
            <button
              type="button"
              class="archive-button"
              aria-label="Restaurer l'habitude"
              @click="handleRestore(habit.id)"
            >
              Restaurer
            </button>
          </div>
        </li>
      </ul>
      <ul v-else class="habit-list">
        <li
          v-for="habit in habitsStore.habits"
          :key="habit.id"
          class="habit-card"
          :class="{ 'is-editing': editingId === habit.id }"
          :style="{ '--habit-color': habit.color || '#3478a8' }"
        >
          <span v-if="editingId === habit.id" class="editing-badge">
            Modification en cours
          </span>
          <div class="habit-header">
            <div class="habit-title">
              <span
                class="status-mark"
                :class="{ done: isDone(habit.id) }"
              ></span>
              <div>
                <h3>{{ habit.name }}</h3>
                <p v-if="habit.description">{{ habit.description }}</p>
              </div>
            </div>
            <span class="habit-state">
              {{
                isDone(habit.id)
                  ? "Accomplie aujourd'hui"
                  : "À faire aujourd'hui"
              }}
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
              :class="{ completed: isDone(habit.id) }"
              :style="{ backgroundColor: habit.color || '#3478a8' }"
              @click="handleLog(habit.id)"
            >
              <span>{{
                isDone(habit.id) ? "Défaire" : "Marquer comme fait"
              }}</span>
              <span aria-hidden="true">{{
                isDone(habit.id) ? "&#10003;" : "&#8594;"
              }}</span>
            </button>
            <button
              type="button"
              class="edit-button"
              aria-label="Modifier l'habitude"
              title="Modifier l'habitude"
              @click="startEdit(habit)"
            >
              <span aria-hidden="true">&#9997;</span>
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

      <p
        v-if="!viewArchive && !habitsStore.habits.length"
        class="empty-state"
      >
        Ta première habitude peut commencer ici.
      </p>
      <p
        v-if="viewArchive && !habitsStore.archivedHabits.length"
        class="empty-state"
      >
        Aucune habitude archivée.
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
const editingId = ref(null);
const draftName = ref("");
const draftDesc = ref("");
const draftColor = ref("");
const errorMessage = ref("");
const viewArchive = ref(false);
const displayDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

const habitsStore = useHabitsStore();

onMounted(async () => {
  await habitsStore.fetchHabits();
  await habitsStore.fetchArchived();
  for (const habit of habitsStore.habits) {
    await habitsStore.fetchLogs(habit.id);
  }
  for (const habit of habitsStore.archivedHabits) {
    await habitsStore.fetchLogs(habit.id);
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

const startEdit = (habit) => {
  editingId.value = habit.id;
  draftName.value = habit.name;
  draftDesc.value = habit.description;
  draftColor.value = habit.color;
};

const cancelEdit = () => {
  editingId.value = null;
  draftName.value = "";
  draftDesc.value = "";
  draftColor.value = "";
};

const handleUpdate = async () => {
  errorMessage.value = "";
  try {
    await habitsStore.updateHabit({
      id: editingId.value,
      name: draftName.value,
      description: draftDesc.value,
      color: draftColor.value,
    });
    editingId.value = null;
    draftName.value = "";
    draftDesc.value = "";
    draftColor.value = "";
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.error || "Erreur interne du serveur.";
  }
};

const todayLog = (habitId) => {
  return habitsStore.logs[habitId]?.find(
    (log) => log.completed && log.log_date === today(),
  );
};
const isDone = (habitId) => {
  return Boolean(todayLog(habitId));
};
const handleLog = async (habitId) => {
  errorMessage.value = "";
  if (isDone(habitId)) {
    const logToRemove = todayLog(habitId);
    if (logToRemove) {
      try {
        await habitsStore.removeLog({ habitId, logId: logToRemove.id });
        await habitsStore.fetchLogs(habitId);
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

const handleRestore = async (habitId) => {
  errorMessage.value = "";
  try {
    await habitsStore.restoreHabit(habitId);
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
    radial-gradient(
      circle at 95% 3%,
      rgba(52, 120, 168, 0.14),
      transparent 20%
    ),
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

.editing-context {
  margin: 8px 0 0;
  color: #3478a8;
  font-size: 12px;
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

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-actions button {
  width: 100%;
}

.habit-form .cancel-button {
  justify-content: center;
  border: 1px solid #c45c6b;
  background: #fff;
  color: #a63d4d;
}

.habit-form .cancel-button:hover {
  border-color: #a63d4d;
  background: #f9dfe3;
  color: #812c3b;
}

.edit-button {
  margin-right: auto;
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

.habit-filter {
  display: flex;
  gap: 8px;
}

.habit-filter button {
  padding: 8px 11px;
  border: 1px solid rgba(52, 120, 168, 0.2);
  border-radius: 999px;
  background: transparent;
  color: #607487;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
}

.habit-filter button:hover,
.habit-filter button.active {
  border-color: #3478a8;
  background: #dcebf5;
  color: #286389;
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
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.habit-card.is-editing {
  border-color: var(--habit-color);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--habit-color) 22%, transparent),
    0 16px 34px rgba(25, 50, 74, 0.12);
  animation: editing-pulse 1.8s ease-in-out infinite;
  transform: translateY(-2px);
}

.editing-badge {
  align-self: flex-start;
  padding: 5px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--habit-color) 14%, white);
  color: #286389;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@keyframes editing-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--habit-color) 22%, transparent),
      0 16px 34px rgba(25, 50, 74, 0.12);
  }
  50% {
    box-shadow:
      0 0 0 6px color-mix(in srgb, var(--habit-color) 10%, transparent),
      0 16px 38px rgba(25, 50, 74, 0.16);
  }
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

.habit-card .complete-button:disabled,
.habit-card .edit-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
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

@media (prefers-reduced-motion: reduce) {
  .habit-card.is-editing {
    animation: none;
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
