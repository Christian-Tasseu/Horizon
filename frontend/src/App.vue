<template>
  <header v-if="auth.isLoggedIn" class="nav">
    <RouterLink class="brand" to="/habitsView" aria-label="Retour à l'accueil Horizon">
      <span class="brand-mark" aria-hidden="true">H</span>
      <span>Horizon</span>
    </RouterLink>
    <nav class="nav-links" aria-label="Navigation principale">
      <RouterLink to="/habitsView">Habitudes</RouterLink>
      <RouterLink to="/journal">Journal</RouterLink>
      <RouterLink to="/chat">Assistant</RouterLink>
    </nav>
    <button
      class="theme-button"
      type="button"
      :aria-label="isDarkMode ? 'Activer le mode jour' : 'Activer le mode nuit'"
      :aria-pressed="isDarkMode"
      @click="toggleTheme"
    >
      <span aria-hidden="true">{{ isDarkMode ? "☀" : "☾" }}</span>
      <span>{{ isDarkMode ? "Mode jour" : "Mode nuit" }}</span>
    </button>
    <button class="logout-button" type="button" @click="handleLogout">
      <span class="logout-icon" aria-hidden="true">&#8594;</span>
      <span>Déconnexion</span>
    </button>
  </header>
  <RouterView />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth.store";

const auth = useAuthStore();
const router = useRouter();
const isDarkMode = ref(localStorage.getItem("horizon-theme") === "dark");

const applyTheme = () => {
  document.documentElement.classList.toggle("dark-mode", isDarkMode.value);
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("horizon-theme", isDarkMode.value ? "dark" : "light");
  applyTheme();
};

onMounted(applyTheme);

const handleLogout = async () => {
  const confirmed = window.confirm("Veux-tu vraiment te déconnecter ?");
  if (!confirmed) {
    return;
  }

  await auth.logout();
  await router.push("/login");
}
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  padding: 20px clamp(20px, 6vw, 88px) 16px;
  border-bottom: 1px solid rgba(52, 120, 168, 0.18);
  background: color-mix(in srgb, var(--color-bg) 92%, transparent);
  backdrop-filter: blur(12px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #19324a;
  font-family: var(--font-heading);
  font-size: 21px;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 27px;
  height: 27px;
  place-items: center;
  border-radius: 50%;
  background: #3478a8;
  color: #f5f9fc;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  flex: 1;
  gap: 24px;
  margin-left: 16px;
}

.nav-links a {
  position: relative;
  display: inline-flex;
  align-items: center;
  color: var(--color-ink-soft);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
  padding: 8px 12px;
  border-radius: 999px;
}

.nav-links a.router-link-active {
  color: var(--color-ink);
  background: var(--color-accent-soft);
}

.nav-links a:hover {
  background: rgba(52, 120, 168, 0.08);
  color: var(--color-ink);
}

.logout-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid rgba(52, 120, 168, 0.28);
  border-radius: 5px;
  background: none;
  color: var(--color-ink-soft);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.theme-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid rgba(52, 120, 168, 0.28);
  border-radius: 5px;
  background: transparent;
  color: var(--color-ink-soft);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.theme-button > span:first-child {
  color: var(--color-accent);
  font-size: 17px;
  line-height: 1;
}

.theme-button:hover {
  background: rgba(52, 120, 168, 0.08);
  color: var(--color-ink);
}

.logout-icon {
  color: #3478a8;
  font-size: 16px;
  line-height: 1;
}

.logout-button:hover {
  background: rgba(52, 120, 168, 0.08);
  color: var(--color-danger);
}

@media (max-width: 480px) {
  .nav {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 18px;
  }

  .nav-links {
    order: 3;
    flex-basis: 100%;
    margin-left: 0;
    gap: 14px;
  }

  .nav-links a,
  .theme-button,
  .logout-button {
    font-size: 10px;
  }
}
</style>