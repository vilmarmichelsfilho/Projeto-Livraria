// ETAPA API: conferir a rota planejada no comentário de cada tela. Os novos arquivos Vue têm somente comentários; implementar seus blocos antes de importar ou registrar as rotas. Preservar as rotas existentes e revisar o caminho genérico /:genero ao adicionar páginas.
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FavoritosView from '@/views/FavoritosView.vue'
import DetalhesLivros from '@/views/DetalhesLivros.vue'
import LivrosPorGenero from '@/views/LivrosPorGenero.vue'
import CarrinhoView from '@/views/CarrinhoView.vue'
import AvaliarLivroView from '@/views/AvaliarLivroView.vue'
import AdminAvaliacoesView from '@/views/AdminAvaliacoesView.vue'
import AdminConsultarAvaliacaoView from '@/views/AdminConsultarAvaliacaoView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
  routes: [
    { path: '/admin/avaliacoes', name: 'Admin Avaliações', component: AdminAvaliacoesView, meta: { adminAvaliacoes: true } },
    { path: '/admin/avaliacoes/:id', name: 'Admin Consultar Avaliação', component: AdminConsultarAvaliacaoView, meta: { adminAvaliacoes: true } },
    { path: '/livro/:endereco/avaliar', name: 'Avaliar Livro', component: AvaliarLivroView },
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
