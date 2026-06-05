<script setup>
import { RouterView } from 'vue-router'
import appFooter from './components/layout/appFooter.vue';
</script>

<template>
  <div class="app-container">
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
