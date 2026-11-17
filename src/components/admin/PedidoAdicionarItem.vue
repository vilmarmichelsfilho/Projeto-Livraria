<script setup>
import { computed, ref, watch } from 'vue';
const props = defineProps({
  livros: { type: Array, required: true },
  itens: { type: Array, required: true },
  disabled: Boolean,
});
const emit = defineEmits(['add']);
const livroId = ref('');
const quantidade = ref(1);
const erro = ref('');
const disponiveis = computed(() =>
  props.livros.filter(
    (livro) =>
      !props.itens.some((item) => String(item.id_livro) === String(livro.id)),
  ),
);
watch(
  disponiveis,
  (livros) => {
    if (!livros.some((livro) => String(livro.id) === String(livroId.value))) {
      livroId.value = livros[0]?.id ?? '';
    }
  },
  { immediate: true },
);
function adicionar() {
  const livro = disponiveis.value.find(
    (livro) => String(livro.id) === String(livroId.value),
  );
  if (!livro || !Number.isInteger(quantidade.value) || quantidade.value < 1) {
    erro.value = 'Informe uma quantidade inteira maior que zero.';
    return;
  }
  emit('add', {
    id_livro: livro.id,
    titulo_livro: livro.titulo,
    preco_unitario: livro.preco,
    quantidade: quantidade.value,
  });
  quantidade.value = 1;
  erro.value = '';
}
</script>
<template>
  <div class="admin-inline-item admin-mobile-only">
    <label class="admin-field"
      ><span>Adicionar livro</span
      ><select
        v-model="livroId"
        :disabled="disabled || !disponiveis.length"
      >
        <option
          v-if="!disponiveis.length"
          value=""
        >
          Todos os livros foram adicionados
        </option>
        <option
          v-for="livro in disponiveis"
          :key="livro.id"
          :value="livro.id"
        >
          {{ livro.titulo }}
        </option>
      </select></label
    >
    <label class="admin-field"
      ><span>Quantidade *</span
      ><input
        v-model.number="quantidade"
        type="number"
        inputmode="numeric"
        min="1"
        step="1"
        :disabled="disabled"
    /></label>
    <p
      v-if="erro"
      class="admin-feedback error"
      role="alert"
    >
      {{ erro }}
    </p>
    <button
      type="button"
      class="admin-button-secondary"
      :disabled="disabled || !disponiveis.length"
      @click="adicionar"
    >
      Adicionar item
    </button>
  </div>
</template>
