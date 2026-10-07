import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth.store.js'

const app = createApp(App);
app.use(createPinia());
await useAuthStore().initialize();
app.use(router);
app.mount('#app')
