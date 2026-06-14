<script setup>
import { RouterView } from 'vue-router'
import appFooter from './components/layout/appFooter.vue';
import AppHeader from './components/layout/appHeader.vue';
</script>

<template>
  <div class="app-container">
    <AppHeader></AppHeader>
     <RouterView/>
     <appFooter></appFooter>
  </div>
</template>
<style scoped>
div.app-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
}
</style>
