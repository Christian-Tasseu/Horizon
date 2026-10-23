<template>
  <main class="auth-page">
    <section class="auth-intro" aria-labelledby="intro-title">
      <div class="brand-mark">H</div>
      <p class="eyebrow">Horizon / rituels quotidiens</p>
      <h1 id="intro-title">Les petites actions font les grands jours.</h1>
      <p class="intro-copy">
        Donne une direction simple à tes habitudes, puis regarde-les prendre
        forme jour après jour.
      </p>
      <div class="intro-note">
        <span class="note-dot"></span>
        <span>Un espace calme pour avancer régulièrement.</span>
      </div>
    </section>

    <section class="auth-panel" aria-labelledby="form-title">
      <div class="auth-header">
        <p class="eyebrow">Bienvenue</p>
        <h2 id="form-title">
          {{ isRegistering ? "Créer ton espace" : "Reprendre le fil" }}
        </h2>
        <p class="form-intro">
          {{ isRegistering
            ? "Commence avec quelques habitudes qui comptent vraiment."
            : "Retrouve tes habitudes et continue là où tu t'es arrêté." }}
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label v-if="isRegistering" for="display-name">Prénom ou nom</label>
        <input
          v-if="isRegistering"
          id="display-name"
          v-model="displayName"
          type="text"
          placeholder="Comment t'appeler ?"
          autocomplete="name"
          required
        />

        <label for="email">Adresse email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="toi@exemple.com"
          autocomplete="email"
          required
        />

        <label for="password">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Ton mot de passe"
          :autocomplete="isRegistering ? 'new-password' : 'current-password'"
          required
        />

        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

        <button class="submit-button" type="submit">
          <span>{{ isRegistering ? "Créer mon compte" : "Se connecter" }}</span>
          <span aria-hidden="true">&#8594;</span>
        </button>
      </form>

      <div class="auth-switch">
        <span>{{ isRegistering ? "Tu as déjà un compte ?" : "Nouveau sur Horizon ?" }}</span>
        <button type="button" @click="toggleMode">
          {{ isRegistering ? "Se connecter" : "S'inscrire" }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth.store.js";
import { useRouter } from "vue-router";

const router = useRouter();
const auth = useAuthStore();

const isRegistering = ref(false);
const displayName = ref("");
const email = ref("");
const password = ref("");
const errorMessage = ref("");

const toggleMode = () => {
  isRegistering.value = !isRegistering.value;
  errorMessage.value = "";
};

const handleSubmit = async () => {
  errorMessage.value = "";
  try {
    if (isRegistering.value) {
      await auth.register(email.value, password.value, displayName.value);
    } else {
      await auth.login(email.value, password.value);
    }
    router.push("/habitsView");
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.error || "Erreur interne du serveur";
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(360px, 1.1fr);
  background: #f1f6fa;
  overflow: hidden;
}

.auth-intro {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 72px clamp(32px, 8vw, 120px);
  color: #f5f9fc;
  background:
    radial-gradient(circle at 15% 15%, rgba(99, 161, 201, 0.2), transparent 28%),
    linear-gradient(145deg, #19324a 0%, #245779 52%, #3478a8 100%);
}

.auth-intro::after {
  content: "";
  position: absolute;
  right: -90px;
  bottom: -90px;
  width: 300px;
  height: 300px;
  border: 1px solid rgba(245, 249, 252, 0.25);
  border-radius: 50%;
  box-shadow: 0 0 0 28px rgba(245, 249, 252, 0.04), 0 0 0 56px rgba(245, 249, 252, 0.03);
}

.brand-mark {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 72px;
  border: 1px solid rgba(246, 244, 237, 0.45);
  border-radius: 50%;
  color: #8fc0df;
  font-family: var(--font-heading);
  font-size: 26px;
}

.eyebrow {
  margin: 0 0 16px;
  color: #b9d4e8;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.auth-intro h1 {
  max-width: 560px;
  font-size: clamp(42px, 5vw, 72px);
  line-height: 0.98;
}

.intro-copy {
  max-width: 420px;
  margin: 28px 0 0;
  color: rgba(245, 249, 252, 0.72);
  font-size: 16px;
  line-height: 1.7;
}

.intro-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 64px;
  color: #d5e7f3;
  font-size: 12px;
}

.note-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8fc0df;
  box-shadow: 0 0 0 5px rgba(143, 192, 223, 0.15);
}

.auth-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: min(100%, 520px);
  padding: 72px clamp(32px, 7vw, 104px);
  background: #f1f6fa;
}

.auth-header h2 {
  color: #19324a;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1;
}

.form-intro {
  max-width: 360px;
  margin: 18px 0 0;
  color: #607487;
  font-size: 14px;
  line-height: 1.6;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 38px;
}

.auth-form label {
  margin-top: 10px;
  color: #19324a;
  font-size: 12px;
  font-weight: 600;
}

.auth-form input {
  width: 100%;
  padding: 15px 16px;
  border: 1px solid #d1dce6;
  border-radius: 6px;
  outline: none;
  background: rgba(255, 255, 255, 0.78);
  color: #19324a;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.auth-form input:focus {
  border-color: #3478a8;
  box-shadow: 0 0 0 3px rgba(52, 120, 168, 0.13);
}

.auth-form input::placeholder {
  color: #8a9cac;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding: 16px 18px;
  border: 0;
  border-radius: 6px;
  background: #3478a8;
  color: #f5f9fc;
  cursor: pointer;
  font-weight: 700;
  transition: transform 160ms ease, background 160ms ease;
}

.submit-button:hover {
  background: #4e8fba;
  transform: translateY(-2px);
}

.submit-button span:last-child {
  font-size: 21px;
  line-height: 0;
}

.error {
  margin: 12px 0 0;
  color: var(--color-danger);
  font-size: 13px;
  line-height: 1.4;
}

.auth-switch {
  display: flex;
  gap: 6px;
  margin-top: 28px;
  color: #607487;
  font-size: 13px;
}

.auth-switch button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #3478a8;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.auth-switch button:hover {
  color: #19324a;
  text-decoration: underline;
}

@media (max-width: 760px) {
  .auth-page {
    display: block;
  }

  .auth-intro {
    min-height: 340px;
    padding: 32px 28px 48px;
  }

  .brand-mark {
    margin-bottom: 42px;
  }

  .auth-intro h1 {
    max-width: 470px;
    font-size: 44px;
  }

  .intro-copy,
  .intro-note {
    display: none;
  }

  .auth-panel {
    width: 100%;
    padding: 48px 28px 56px;
  }
}
</style>