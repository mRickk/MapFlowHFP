import { createRouter, createWebHistory } from 'vue-router';

import Map from '@/views/Map.vue';
import Inspiration from '@/views/Inspiration.vue';
import MyMaps from '@/views/MyMaps.vue';
import Profile from '@/views/Profile.vue';

const routes = [
    { path: '/', redirect: '/map' },
    {
        path: '/map',
        name: "Map",
        component: Map,
        meta: { activeMenu: 'map' }
    },
    {
        path: '/inspiration',
        name: "Inspiration",
        component: Inspiration,
        meta: { activeMenu: 'inspiration' }
    },
    {
        path: '/my-maps',
        name: "MyMaps",
        component: MyMaps,
        meta: { activeMenu: 'my-maps' }
    },
    {
        path: '/profile',
        name: "Profile",
        component: Profile,
        meta: { activeMenu: 'profile' }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;