<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Mot de passe" />
    <button type="submit">Se connecter</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </form>
</template>

<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '../stores/auth.store.js'
    import { useRouter } from 'vue-router';

    const router = useRouter();

    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const auth = useAuthStore();

    const handleSubmit = async () => {
        errorMessage.value = ''
        try {
            await auth.login(email.value, password.value)
            router.push('/habitsView');
        } catch (error) {
            errorMessage.value = error?.response?.data?.error || "Erreur interne du serveur";
        }
    }
</script>