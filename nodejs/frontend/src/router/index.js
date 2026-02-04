import { createRouter, createWebHistory } from 'vue-router';
import { initializeUserStorage } from '@/services/userService.js';
import { initializePoiStorage } from '@/services/poiService.js';

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
    initializeUserStorage();
    initializePoiStorage();
    next();
});

export default router;