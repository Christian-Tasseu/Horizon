<template>
  <div class="habits">
    <h1>Mes habitudes</h1>

    <form @submit.prevent="handleCreate" class="habit-form">
      <input v-model="name" type="text" placeholder="Nom (ex: Sport)" required />
      <input v-model="description" type="text" placeholder="Description" />
      <button type="submit">Ajouter</button>
    </form>

    <ul class="habit-list">
      <li v-for="habit in habitsStore.habits" :key="habit.id">
        {{ habit.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>

  import { ref, onMounted } from 'vue' ;
  import { useHabitsStore } from '../stores/habits.store.js';

  const name = ref('');
  const description = ref('');
  const errorMessage = ref('');

  const habitsStore = useHabitsStore();

  onMounted(async () => {
    await habitsStore.fetchHabits();
  })

  const handleCreate = async () => {
    try {
      await habitsStore.createHabit({ name: name.value, description: description.value, frequency: 'daily', color: '#1D9E75' })
    } catch (error){
      errorMessage.value = error?.response?.data?.error || "Erreur interne du serveur"
    }
    name.value = ''
    description.value = ''
  }

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
  background: #17825F;
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
  background: var(--color-surface);
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px 16px;
}
</style>