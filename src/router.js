import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import Forgot from './views/Forgot.vue';
import Reset from './views/Reset.vue';
import Home from './views/Home.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/forgot', component: Forgot },
  { path: '/reset', component: Reset }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
