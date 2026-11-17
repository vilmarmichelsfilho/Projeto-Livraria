<script setup>
defineProps({ nota: { type: Number, default: 0 }, editavel: Boolean, resumo: Boolean })
defineEmits(['update:nota'])
</script>

<template>
  <div v-if="editavel" class="estrelas escolha" role="radiogroup" aria-label="Sua nota" aria-required="true">
    <label v-for="valor in 5" :key="valor" :title="`${valor} de 5 estrelas`">
      <input type="radio" name="nota" :value="valor" :checked="nota === valor" required
        :aria-label="`${valor} de 5 estrelas`" @change="$emit('update:nota', valor)">
      <img :class="{ preenchida: valor <= nota }" :src="`/images/avaliacoes/${valor <= nota ? 'star' : 'star-input-empty'}.svg`" alt="">
    </label>
  </div>
  <span v-else class="estrelas" role="img" :aria-label="`${nota} de 5 estrelas`">
    <img v-for="valor in 5" :key="valor" :src="`/images/avaliacoes/${valor <= Math.round(nota) ? (resumo ? 'star-summary' : 'star') : 'star-empty'}.svg`" alt="">
  </span>
</template>

<style scoped>
.estrelas { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
.estrelas img { display: block; pointer-events: none; }
.escolha { gap: 3px; }
.escolha .preenchida { transform: scale(1.7); }
label { position: relative; display: grid; place-items: center; width: 44px; height: 44px; cursor: pointer; border-radius: 6px; }
input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
label:has(input:focus-visible) { outline: 3px solid #476978; outline-offset: 2px; }
label:hover { background: #dcebf1; }
</style>
