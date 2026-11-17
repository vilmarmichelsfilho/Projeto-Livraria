<script setup>
defineProps({
  tipo: { type: String, default: 'info' },
  mensagem: { type: String, required: true },
  tentarNovamente: Boolean,
});
defineEmits(['tentar']);
</script>
<template>
  <div
    :class="['estado-requisicao', tipo]"
    :role="tipo === 'erro' ? 'alert' : 'status'"
    :aria-busy="tipo === 'carregando'"
  >
    <span
      v-if="tipo === 'carregando'"
      class="spinner"
      aria-hidden="true"
    ></span>
    <p>{{ mensagem }}</p>
    <button
      v-if="tentarNovamente"
      class="btn secundario"
      type="button"
      @click="$emit('tentar')"
    >
      Tentar novamente</button
    ><slot />
  </div>
</template>
