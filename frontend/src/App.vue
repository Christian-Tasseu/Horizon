<template>
  <header v-if="auth.isLoggedIn" class="nav">
    <nav>
      <RouterLink to="/habitsView">Habitudes</RouterLink>
      <RouterLink to="/journal">Journal</RouterLink>
      <RouterLink to="/chat">Chat</RouterLink>
    </nav>
    <button type="button" @click="handleLogout">Déconnexion</button>
  </header>
  <RouterView />
</template>

<script setup>
import { useAuthStore } from './stores/auth.store';

const auth = useAuthStore();

const handleLogout = async () => {
  await auth.logout();
  window.location.href = '/login'
}
</script>

<style scoped>
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 640px;
  margin: 0 auto;
  padding: 16px 24px 0;
}

.nav nav {
  display: flex;
  gap: 16px;
}

.nav a {
  color: var(--color-ink-soft);
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
}

.nav a.router-link-active {
  color: var(--color-ink);
  border-bottom-color: var(--color-accent);
}

.nav button {
  background: none;
  border: none;
  color: var(--color-ink-soft);
  cursor: pointer;
}

.nav button:hover {
  color: var(--color-danger);
}
</style>