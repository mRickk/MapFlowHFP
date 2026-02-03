import { createRouter, createWebHistory } from 'vue-router';

import Home from '@/views/Home.vue';

const routes = [
    { path: '/', redirect: '/home' },
    {
        path: '/home',
        name: "Home",
        component: Home,
        meta: { requiresAuth: true, requiresAdmin: false, showSidebar: true, activeMenu: 'home' }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;