<script setup>
import { computed, ref } from 'vue';
import AdminModal from './admin/AdminModal.vue';
import { moeda } from '@/services/pedidosService';
const props = defineProps({
  livros: { type: Array, required: true },
  itens: { type: Array, required: true },
  item: { type: Object, default: null },
});
const emit = defineEmits(['close', 'save']);
const livroId = ref(props.item?.id_livro ?? '');
const quantidade = ref(props.item?.quantidade ?? 1);
const erro = ref('');
const disponiveis = computed(() =>
  props.livros.filter(
    (livro) =>
      String(livro.id) === String(props.item?.id_livro) ||
      !props.itens.some((item) => String(item.id_livro) === String(livro.id)),
  ),
);
const livro = computed(() =>
  props.livros.find((livro) => String(livro.id) === String(livroId.value)),
);
function salvar() {
  if (
    !livro.value ||
    !Number.isInteger(quantidade.value) ||
    quantidade.value < 1
  ) {
    erro.value =
      'Selecione um livro e informe uma quantidade inteira maior que zero.';
    return;
  }
  emit('save', {
    ...props.item,
    id_livro: livro.value.id,
    titulo_livro: livro.value.titulo,
    quantidade: quantidade.value,
    preco_unitario: props.item?.preco_unitario ?? livro.value.preco,
  });
}
</script>
<template>
  <AdminModal
    :label="item ? 'Editar item' : 'Adicionar item'"
    @close="emit('close')"
  >
    <h2>{{ item ? 'Editar item' : 'Adicionar item' }}</h2>
    <form @submit.prevent="salvar">
      <label class="admin-field"
        ><span>Livro *</span
        ><select
          v-model="livroId"
          required
          :disabled="!!item"
        >
          <option
            value=""
            disabled
          >
            Selecione um livro
          </option>
          <option
            v-for="opcao in disponiveis"
            :key="opcao.id"
            :value="opcao.id"
          >
            {{ opcao.titulo }}
          </option>
        </select></label
      >
      <label class="admin-field"
        ><span>Quantidade *</span
        ><input
          v-model.number="quantidade"
          type="number"
          min="1"
          step="1"
          required
      /></label>
      <p
        v-if="livro"
        style="margin-top: 16px"
      >
        Preço unitário: {{ moeda(item?.preco_unitario ?? livro.preco) }} ·
        Estoque: {{ livro.estoque }}
      </p>
      <p v-if="!disponiveis.length">
        Todos os livros disponíveis já foram adicionados.
      </p>
      <p
        v-if="erro"
        class="admin-feedback error"
        role="alert"
      >
        {{ erro }}
      </p>
      <div class="admin-modal-actions">
        <button
          type="button"
          class="admin-button-secondary"
          @click="emit('close')"
        >
          Cancelar</button
        ><button :disabled="!disponiveis.length">
          {{ item ? 'Salvar item' : 'Adicionar item' }}
        </button>
      </div>
    </form>
  </AdminModal>
</template>
