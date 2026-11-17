<script setup>
import AdminModal from "./admin/AdminModal.vue";
import AdminIcon from "./admin/AdminIcon.vue";
defineProps({
  pedido: { type: Object, required: true },
  busy: Boolean,
  erro: { type: String, default: "" },
});
const emit = defineEmits(["close", "confirm", "view"]);
</script>
<template>
  <AdminModal
    :label="
      pedido.status === 'RASCUNHO'
        ? 'Excluir rascunho?'
        : 'Pedido já confirmado'
    "
    :busy="busy"
    @close="!busy && emit('close')"
  >
    <div
      class="admin-modal-symbol"
      :class="{ lock: pedido.status !== 'RASCUNHO' }"
    >
      <AdminIcon :name="pedido.status === 'RASCUNHO' ? 'trash' : 'lock'" />
    </div>
    <h2>
      {{
        pedido.status === "RASCUNHO"
          ? "Excluir rascunho?"
          : "Pedido já confirmado"
      }}
    </h2>
    <template v-if="pedido.status === 'RASCUNHO'"
      ><p>O pedido #{{ pedido.id }} e seus itens serão removidos.</p>
      <p class="admin-modal-explanation">
        Este pedido ainda não foi confirmado. Esta ação não pode ser desfeita.
      </p></template
    >
    <template v-else
      ><p>
        O pedido #{{ pedido.id }} está
        {{ pedido.status === "CANCELADO" ? "cancelado" : "confirmado" }} e faz
        parte do histórico.
      </p>
      <p class="admin-modal-explanation">
        Somente rascunhos podem ser excluídos. Para este pedido, use o
        cancelamento permitido.
      </p></template
    >
    <p v-if="erro" class="admin-feedback error" role="alert">{{ erro }}</p>
    <div class="admin-modal-actions">
      <button
        class="admin-button-secondary"
        :disabled="busy"
        @click="emit('close')"
      >
        Cancelar</button
      ><button
        v-if="pedido.status === 'RASCUNHO'"
        class="admin-button-destructive"
        :disabled="busy"
        @click="emit('confirm')"
      >
        {{ busy ? "Excluindo…" : "Excluir rascunho" }}</button
      ><button v-else @click="emit('view')">Voltar ao pedido</button>
    </div>
  </AdminModal>
</template>
