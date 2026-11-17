<script setup>
import { RouterView, useRoute } from "vue-router";
import appFooter from "./components/layout/appFooter.vue";
import AppHeader from "./components/layout/appHeader.vue";
const route = useRoute();
</script>

<template>
  <div class="app-container">
    <AppHeader v-if="!route.meta.admin"></AppHeader>
    <RouterView class="content-wrap" />
    <appFooter v-if="!route.meta.admin"></appFooter>
import { computed } from "vue";
import ContaMobileChrome from "./components/layout/ContaMobileChrome.vue";
const route = useRoute();
const contaMobile = computed(() =>
  [
    "/entrar",
    "/cadastro",
    "/minha-conta",
    "/minha-conta/editar",
    "/minha-conta/senha",
  ].includes(route.path),
);
import appFooter from "./components/layout/appFooter.vue";
import AppHeader from "./components/layout/appHeader.vue";
</script>

<template>
  <div class="app-container" :class="{ 'conta-shell': contaMobile }">
    <ContaMobileChrome v-if="contaMobile" />
    <AppHeader class="conta-desktop-header"></AppHeader>
    <RouterView class="content-wrap" />
    <appFooter class="conta-desktop-footer"></appFooter>
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
@media (max-width: 680px) {
  div.conta-shell {
    min-height: 100dvh;
    padding-bottom: calc(74px + env(safe-area-inset-bottom, 0px));
  }
  .conta-shell .conta-desktop-header,
  .conta-shell .conta-desktop-footer {
    display: none;
  }
}
</style>
