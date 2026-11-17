import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import FavoritosView from '@/views/FavoritosView.vue';
import DetalhesLivros from '@/views/DetalhesLivros.vue';
import LivrosPorGenero from '@/views/LivrosPorGenero.vue';
import CarrinhoView from '@/views/CarrinhoView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash };
    }
    if (
      [
        'entrar',
        'cadastro',
        'minha-conta',
        'editar-dados',
        'alterar-senha',
      ].includes(to.name)
    ) {
      return { top: 0 };
    }
  },
  routes: [
    {
      path: '/admin',
      component: () => import('@/components/layout/AdminLayout.vue'),
      meta: { admin: true },
      children: [
        { path: '', redirect: '/admin/pedidos' },
        {
          path: 'livros',
          name: 'admin-livros',
          component: () => import('@/views/AdminListarLivrosView.vue'),
        },
        {
          path: 'livros/novo',
          name: 'admin-livro-novo',
          component: () => import('@/views/AdminCadastrarLivroView.vue'),
        },
        {
          path: 'livros/:id/editar',
          name: 'admin-livro-editar',
          component: () => import('@/views/AdminEditarLivroView.vue'),
        },
        {
          path: 'livros/:id',
          name: 'admin-livro',
          component: () => import('@/views/AdminDetalhesLivroView.vue'),
        },
        {
          path: 'pedidos',
          name: 'admin-pedidos',
          component: () => import('@/views/AdminListarPedidosView.vue'),
        },
        {
          path: 'pedidos/novo',
          name: 'admin-criar-pedido',
          component: () => import('@/views/AdminCriarPedidoView.vue'),
        },
        {
          path: 'pedidos/:id/editar',
          name: 'admin-editar-pedido',
          component: () => import('@/views/AdminEditarPedidoView.vue'),
        },
        {
          path: 'pedidos/:id',
          name: 'admin-detalhes-pedido',
          component: () => import('@/views/AdminDetalhesPedidoView.vue'),
        },
      ],
    },
    {
      path: '/entrar',
      name: 'entrar',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('@/views/CadastroView.vue'),
    },
    { path: '/usuario', redirect: '/minha-conta' },
    {
      path: '/minha-conta',
      name: 'minha-conta',
      component: () => import('@/views/MinhaContaView.vue'),
      meta: { requerLogin: true },
    },
    {
      path: '/minha-conta/editar',
      name: 'editar-dados',
      component: () => import('@/views/EditarDadosView.vue'),
      meta: { requerLogin: true },
    },
    {
      path: '/minha-conta/senha',
      name: 'alterar-senha',
      component: () => import('@/views/AlterarSenhaView.vue'),
      meta: { requerLogin: true },
    },
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
      path: '/carrinho',
      name: 'carrinho',
      component: CarrinhoView,
    },
    {
      path: '/:genero',
      name: 'Livros Por Genero',
      component: LivrosPorGenero,
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requerLogin && !sessionStorage.getItem('iflibrary_usuario')) {
    return '/entrar';
  }
});
export default router;
