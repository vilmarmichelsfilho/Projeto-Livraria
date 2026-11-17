<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
const props = defineProps({
  titulo: { type: String, required: true },
  acao: { type: String, required: true },
  busy: Boolean,
  erro: { type: String, default: '' },
});
const emit = defineEmits(['close', 'confirm']);
const dialog = ref(null);
let foco;
onMounted(() => {
  foco = document.activeElement;
  dialog.value.showModal();
});
onBeforeUnmount(() => {
  dialog.value?.close();
  foco?.focus();
});
function fechar(event) {
  event.preventDefault();
  if (!props.busy) emit('close');
}
</script>
<template>
  <dialog
    ref="dialog"
    class="cliente-dialog"
    :aria-label="titulo"
    :aria-busy="busy"
    @cancel="fechar"
    @click="
      (event) => {
        if (event.target === dialog && !busy) emit('close');
      }
    "
  >
    <h2>{{ titulo }}</h2>
    <slot />
    <p
      v-if="erro"
      class="cliente-erro"
      role="alert"
    >
      {{ erro }}
    </p>
    <div class="cliente-dialog-acoes">
      <button
        type="button"
        class="cliente-botao secundario"
        :disabled="busy"
        @click="emit('close')"
      >
        Voltar</button
      ><button
        type="button"
        class="cliente-botao perigo"
        :disabled="busy"
        @click="emit('confirm')"
      >
        {{ busy ? 'Aguarde…' : acao }}
      </button>
    </div>
  </dialog>
</template>
