<script setup>
import { RouterView } from 'vue-router'
import appFooter from './components/layout/appFooter.vue';
import AppHeader from './components/layout/appHeader.vue';
</script>

<template>
  <div class="app-container">
    <AppHeader></AppHeader>
     <RouterView class="content-wrap"/>
     <appFooter></appFooter>
  </div>
</template>
<style scoped>
div.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
}
.content-wrap {
  flex: 1;
}
</style>
