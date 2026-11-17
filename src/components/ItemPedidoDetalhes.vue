<script setup>
import AdminModal from "./admin/AdminModal.vue";
import { moeda } from "@/services/pedidosService";
defineProps({ item: { type: Object, required: true } });
const emit = defineEmits(["close"]);
</script>
<template>
  <AdminModal label="Detalhes do item" @close="emit('close')"
    ><h2>{{ item.titulo_livro }}</h2>
    <p>Quantidade: {{ item.quantidade }}</p>
    <p>Preço unitário: {{ moeda(item.preco_unitario) }}</p>
    <p>Subtotal: {{ moeda(item.quantidade * item.preco_unitario) }}</p>
    <div class="admin-modal-actions">
      <button @click="emit('close')">Fechar</button>
    </div></AdminModal
  >
</template>
