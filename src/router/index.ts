import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainView from '@/views/main-view.vue';
import GameView from '@/views/game-view.vue';

import {GameFactory } from '@/game/game-factory';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'main',
    component: MainView
  },
  {
    path: '/game/:gameType',
    name: 'game',
    component: GameView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
