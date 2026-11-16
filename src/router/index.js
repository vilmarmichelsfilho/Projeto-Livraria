// ETAPA API: conferir a rota planejada no comentário de cada tela. Os novos arquivos Vue têm somente comentários; implementar seus blocos antes de importar ou registrar as rotas. Preservar as rotas existentes e revisar o caminho genérico /:genero ao adicionar páginas.
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
      path: "/entrar",
      name: "entrar",
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/cadastro",
      name: "cadastro",
      component: () => import("@/views/CadastroView.vue"),
    },
    { path: "/usuario", redirect: "/minha-conta" },
    {
      path: "/minha-conta",
      name: "minha-conta",
      component: () => import("@/views/MinhaContaView.vue"),
      meta: { requerLogin: true },
    },
    {
      path: "/minha-conta/editar",
      name: "editar-dados",
      component: () => import("@/views/EditarDadosView.vue"),
      meta: { requerLogin: true },
    },
    {
      path: "/minha-conta/senha",
      name: "alterar-senha",
      component: () => import("@/views/AlterarSenhaView.vue"),
      meta: { requerLogin: true },
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

router.beforeEach((to) => {
  if (to.meta.requerLogin && !sessionStorage.getItem("iflibrary_token"))
    return "/entrar";
});
export default router;
