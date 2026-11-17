<script setup>
import { ref } from 'vue'
import BookIcon from '@iconify-vue/mdi/book-open-outline'
import MenuIcon from '@iconify-vue/mdi/menu'
import DashboardIcon from '@iconify-vue/mdi/view-grid-outline'
import AccountIcon from '@iconify-vue/mdi/account-outline'
import OrdersIcon from '@iconify-vue/mdi/clipboard-text-outline'
import StarIcon from '@iconify-vue/mdi/star-outline'
import '@/assets/avaliacoes.css'
import '@/assets/adminAvaliacoes.css'

const menuAberto = ref(false)
</script>

<template>
  <div class="avaliacoes-ui admin-avaliacoes">
    <header class="admin-cabecalho">
      <RouterLink to="/" class="admin-marca"><BookIcon aria-hidden="true" /><span>IFLibrary</span></RouterLink>
      <span class="admin-identificacao">Administração</span>
      <button class="admin-menu-botao" aria-label="Menu da administração" :aria-expanded="menuAberto" aria-controls="menu-administracao" @click="menuAberto = !menuAberto" @keydown.esc="menuAberto = false"><MenuIcon aria-hidden="true" /></button>
      <nav v-if="menuAberto" id="menu-administracao" class="admin-menu" aria-label="Menu da administração" @keydown.esc="menuAberto = false">
        <RouterLink to="/admin/avaliacoes" @click="menuAberto = false">Avaliações</RouterLink>
        <RouterLink to="/" @click="menuAberto = false">Voltar à loja</RouterLink>
      </nav>
    </header>
    <main class="admin-conteudo"><slot /></main>
    <nav class="admin-navegacao" aria-label="Áreas da administração">
      <button disabled title="Painel ainda não disponível"><DashboardIcon aria-hidden="true" /><span>Painel</span></button>
      <button disabled title="Administração de livros ainda não disponível"><BookIcon aria-hidden="true" /><span>Livros</span></button>
      <button disabled title="Administração de usuários ainda não disponível"><AccountIcon aria-hidden="true" /><span>Usuários</span></button>
      <button disabled title="Administração de pedidos ainda não disponível"><OrdersIcon aria-hidden="true" /><span>Pedidos</span></button>
      <RouterLink to="/admin/avaliacoes" aria-current="true"><StarIcon aria-hidden="true" /><span>Avaliações</span></RouterLink>
    </nav>
  </div>
</template>
