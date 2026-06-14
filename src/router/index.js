import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/layout/HomeView.vue'
import FavoritosView from '@/components/layout/FavoritosView.vue'
import DetalhesLivros from '@/views/DetalhesLivros.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/favoritos',
      name: 'favoritos',
      component: FavoritosView,
    },
    {
      path: '/livro/:endereco',
      name: 'Detalhes Livro',
      component: DetalhesLivros,
    }
  ],
})

export default router
