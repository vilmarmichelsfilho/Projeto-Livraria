<script setup>
import { useRoute } from "vue-router";
import CatalogoLivros from "@/components/CatalogoLivros.vue";
const route = useRoute();
</script>
<template><CatalogoLivros :genero="String(route.params.genero)" /></template>
