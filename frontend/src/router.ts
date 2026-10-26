
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

export const router = createRouter({
  history: createWebHistory('/portal'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: App,
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: App,
    },
    {
      path: '/account',
      name: 'account',
      component: App,
    },
    {
      path: '/inbox',
      name: 'inbox',
      component: App,
    },
    {
      path: '/support',
      name: 'support',
      component: App,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})
