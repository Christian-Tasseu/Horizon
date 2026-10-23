import {createRouter, createWebHistory} from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HabitsView from '../views/HabitsView.vue'
import { useAuthStore } from '../stores/auth.store.js';
import JournalView from '../views/JournalView.vue'
import ChatView from '../views/ChatView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/habitsView',
            name: 'habitsView',
            component: HabitsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/journal',
            name: 'journal',
            component: JournalView,
            meta: { requiresAuth: true }
        },
        {
            path: '/chat',
            name: 'chat',
            component: ChatView,
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/login';
  }
});

export default router;