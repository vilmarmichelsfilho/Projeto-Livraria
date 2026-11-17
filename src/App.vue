<script setup>
import { RouterView, useRoute } from 'vue-router'
import NavegacaoMobile from './components/Avaliacoes/NavegacaoMobile.vue'
import appFooter from './components/layout/appFooter.vue';
import AppHeader from './components/layout/appHeader.vue';
const route = useRoute()
</script>

<template>
  <div class="app-container" :class="{ 'avaliacao-mobile': route.name === 'Avaliar Livro' }">
    <AppHeader v-if="!route.meta.adminAvaliacoes" class="cabecalho-desktop"></AppHeader>
    <NavegacaoMobile v-if="route.name === 'Avaliar Livro'" />
     <RouterView class="content-wrap"/>
     <appFooter v-if="!route.meta.adminAvaliacoes" class="rodape-desktop"></appFooter>
  </div>
</template>
<style scoped>
div.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.content-wrap {
  flex: 1;
}
@media (max-width: 650px) {
  :global(html:has(.avaliacao-mobile)) { scroll-padding-bottom: calc(90px + env(safe-area-inset-bottom)); }
  .avaliacao-mobile { padding-bottom: calc(70px + env(safe-area-inset-bottom)); }
  .avaliacao-mobile .cabecalho-desktop, .avaliacao-mobile .rodape-desktop { display: none; }
}
</style>
