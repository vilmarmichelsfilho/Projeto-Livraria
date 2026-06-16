import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FavoritosView from '@/views/FavoritosView.vue'
import DetalhesLivros from '@/views/DetalhesLivros.vue'
import LivrosPorGenero from '@/views/LivrosPorGenero.vue'
import CarrinhoView from '@/views/CarrinhoView.vue'

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
    },
    {
      path: '/:genero',
      name: 'Livros Por Genero',
      component: LivrosPorGenero,
    },
    {
          path: '/carrinho',
      name: 'carrinho',
      component: CarrinhoView,
    }
  ],
})

export default router
