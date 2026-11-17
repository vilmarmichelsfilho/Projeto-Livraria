<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import usuariosService from '@/services/usuariosService';
import AdminIcon from '@/components/admin/AdminIcon.vue';
import '@/assets/admin.css';
const usuario = ref(null);
const menuAberto = ref(false);
const router = useRouter();
const route = useRoute();
const secaoLivros = computed(() => route.path.startsWith('/admin/livros'));
onMounted(async () => {
  if (!sessionStorage.getItem('iflibrary_usuario')) {
    return;
  }
  try {
    usuario.value = await usuariosService.atual();
  } catch {
    usuario.value = null;
  }
});
async function sair() {
  try {
    await usuariosService.sair();
  } finally {
    await router.push('/entrar');
  }
}
</script>

<template>
  <div class="admin-shell">
    <header
      class="admin-header"
      @keydown.esc="menuAberto = false"
    >
      <RouterLink
        to="/admin"
        class="admin-brand"
        ><AdminIcon name="book" /><span>IFLibrary</span></RouterLink
      >
      <span class="admin-heading">Administração</span>
      <RouterLink
        to="/minha-conta"
        class="admin-account"
        ><span>{{ usuario?.nome || 'Administrador' }}</span
        ><AdminIcon name="user"
      /></RouterLink>
      <button
        type="button"
        class="admin-menu-toggle"
        aria-label="Abrir menu da conta"
        :aria-expanded="menuAberto"
        aria-controls="admin-mobile-menu"
        @click="menuAberto = !menuAberto"
      >
        <AdminIcon :name="menuAberto ? 'close' : 'menu'" />
      </button>
      <nav
        v-if="menuAberto"
        id="admin-mobile-menu"
        class="admin-mobile-menu"
        aria-label="Conta e loja"
        @keydown.esc="menuAberto = false"
      >
        <RouterLink
          to="/minha-conta"
          @click="menuAberto = false"
          >{{ usuario?.nome || 'Minha conta' }}</RouterLink
        >
        <RouterLink
          to="/"
          @click="menuAberto = false"
          >Voltar à loja</RouterLink
        >
        <button
          type="button"
          @click="
            menuAberto = false;
            sair();
          "
        >
          Sair da conta
        </button>
      </nav>
    </header>
    <aside
      class="admin-sidebar"
      aria-label="Menu administrativo"
    >
      <nav>
        <span
          class="admin-nav-item"
          aria-disabled="true"
          ><AdminIcon name="dashboard" />Painel</span
        >
        <RouterLink
          to="/admin/livros"
          class="admin-nav-item"
          :class="{ active: route.path.startsWith('/admin/livros') }"
          :aria-current="
            route.path.startsWith('/admin/livros') ? 'page' : undefined
          "
          ><AdminIcon name="book" />Livros</RouterLink
        >
        <RouterLink
          to="/admin/usuarios"
          class="admin-nav-item"
          :class="{ active: route.path.startsWith('/admin/usuarios') }"
          ><AdminIcon name="users" />Usuários</RouterLink
        >
        <RouterLink
          to="/admin/pedidos"
          class="admin-nav-item"
          :class="{ active: route.path.startsWith('/admin/pedidos') }"
          :aria-current="
            route.path.startsWith('/admin/pedidos') ? 'page' : undefined
          "
          ><AdminIcon name="orders" />Pedidos</RouterLink
        >
        <RouterLink
          to="/admin/avaliacoes"
          class="admin-nav-item"
          :class="{ active: route.path.startsWith('/admin/avaliacoes') }"
          :aria-current="
            route.path.startsWith('/admin/avaliacoes') ? 'page' : undefined
          "
          ><AdminIcon name="star" />Avaliações</RouterLink
        >
      </nav>
      <div class="admin-sidebar-footer">
        <RouterLink to="/">Voltar à loja</RouterLink
        ><a
          href="/entrar"
          @click.prevent="sair"
          >Sair da conta</a
        >
      </div>
    </aside>
    <main
      class="admin-main"
      :class="{ 'admin-livros': secaoLivros }"
    >
      <RouterView :key="route.path" />
    </main>
  </div>
</template>
