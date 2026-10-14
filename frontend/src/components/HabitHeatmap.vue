<template>
  <div class="heatmap">
    <div
      v-for="day in days"
      :key="day.date"
      class="cell"
      :class="{ done: day.done }"
      :title="day.date"
    ></div>
  </div>
</template>

<script setup>
    import { computed } from 'vue';
    import { formatDate } from '../utils/date.js';

    const props =defineProps({
        logs: {type: Array, default: () => []}
    });

    const days = computed (() => {
      const doneDates = new Set(
        props.logs
          .filter(log => log.completed)
          .map(log => log.log_date)
        );
        const now = new Date();
        const result = [];
        for (let i = 83; i>= 0; i--) {
            const iDate = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i))
            result.push({ date: iDate, done: doneDates.has(iDate) });
        }
        return result;
    })

</script>

<style scoped>
.heatmap {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  grid-auto-flow: column;
  grid-auto-columns: 12px;
  gap: 3px;
}

.cell {
  border-radius: 2px;
  background: var(--color-border);
}

.cell.done {
  background: var(--color-accent);
}
</style>