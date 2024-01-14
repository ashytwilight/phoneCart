import { createRouter, createWebHashHistory} from "vue-router";

const routes = [
    {
        name: 'Home',
        path: '/',
        component: () => import('../components/HomePage.vue'),
        meta: {
            keepAlive: true
        }
    },
    {
        name: 'Login',
        path: '/login',
        component: () => import('../components/LoginPage.vue'),
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
