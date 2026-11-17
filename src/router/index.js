// Rotas de Igor: loja e CRUD administrativo de livros; colegas mantêm seus recursos.
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import FavoritosView from "@/views/FavoritosView.vue";
import DetalhesLivros from "@/views/DetalhesLivros.vue";
import LivrosPorGenero from "@/views/LivrosPorGenero.vue";
import CarrinhoView from "@/views/CarrinhoView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/admin",
      component: () => import("@/components/layout/AdminLayout.vue"),
      meta: { admin: true },
      children: [
        { path: "", redirect: "/admin/livros" },
        {
          path: "livros",
          name: "admin-livros",
          component: () => import("@/views/AdminListarLivrosView.vue"),
        },
        {
          path: "livros/novo",
          name: "admin-livro-novo",
          component: () => import("@/views/AdminCadastrarLivroView.vue"),
        },
        {
          path: "livros/:id/editar",
          name: "admin-livro-editar",
          component: () => import("@/views/AdminEditarLivroView.vue"),
        },
        {
          path: "livros/:id",
          name: "admin-livro",
          component: () => import("@/views/AdminDetalhesLivroView.vue"),
        },
      ],
    },
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/favoritos",
      name: "favoritos",
      component: FavoritosView,
    },
    {
      path: "/livro/:endereco",
      name: "Detalhes Livro",
      component: DetalhesLivros,
    },
    {
      path: "/:genero",
      name: "Livros Por Genero",
      component: LivrosPorGenero,
    },
    {
      path: "/carrinho",
      name: "carrinho",
      component: CarrinhoView,
    },
  ],
});

export default router;
