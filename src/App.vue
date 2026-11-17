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
</style>
