import { createRouter, createWebHistory } from 'vue-router';
import { initializeStorageIfNecessary } from '@/util/localStoreManager.js';

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

router.beforeEach( async(to, from, next) => {
    initializeStorageIfNecessary();
    next();
});

export default router;