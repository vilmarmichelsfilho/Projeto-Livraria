<script setup>
import AdminPedidoPagina from '@/components/admin/AdminPedidoPagina.vue';
</script>
<template>
  <AdminPedidoPagina
    :key="$route.params.id"
    modo="detalhes"
  />
</template>
