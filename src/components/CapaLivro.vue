<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  src: String,
  titulo: { type: String, required: true },
});
const falhou = ref(false);
watch(
  () => props.src,
  () => {
    falhou.value = false;
  },
);
</script>
<template>
  <img
    v-if="src && !falhou"
    class="capa-livro"
    :src="src"
    :alt="`Capa do livro ${titulo}`"
    loading="lazy"
    @error="falhou = true"
  />
  <div
    v-else
    class="capa-livro capa-ausente"
    role="img"
    :aria-label="`Capa indisponível de ${titulo}`"
  >
    <span>{{ titulo }}</span
    ><small>Capa indisponível</small>
  </div>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.capa-livro {
  display: block;
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: contain;
}
.capa-ausente {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  gap: 24px;
  color: var(--livraria-acao);
  border: 1px solid var(--livraria-borda);
  background: var(--livraria-suave);
  text-align: center;
}
.capa-ausente span {
  font-size: 24px;
  font-weight: 700;
}
</style>
