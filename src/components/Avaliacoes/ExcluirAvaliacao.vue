<script setup>
import { ref, useId } from 'vue';
import { excluirAvaliacao } from '@/services/avaliacoesService';
import { mensagemErro } from '@/services/api';

const props = defineProps({
  avaliacaoId: { type: [Number, String], required: true },
  livro: { type: Object, required: true },
  moderacao: Boolean,
  autor: { type: String, default: '' },
});
const id = useId();
const emit = defineEmits(['excluida']);
const dialogo = ref(null);
const erro = ref('');
const excluindo = ref(false);
function abrir() {
  erro.value = '';
  dialogo.value.showModal();
}
async function excluir() {
  if (excluindo.value) return;
  excluindo.value = true;
  erro.value = '';
  try {
    await excluirAvaliacao(props.avaliacaoId);
    dialogo.value.close();
    emit('excluida');
  } catch (falha) {
    erro.value = mensagemErro(falha);
  } finally {
    excluindo.value = false;
  }
}
</script>

<template>
  <button
    type="button"
    class="av-botao texto-perigo"
    @click="abrir"
  >
    <slot>Excluir</slot>
  </button>
  <dialog
    ref="dialogo"
    class="av-dialogo"
    :class="{ 'av-moderacao': moderacao }"
    :aria-labelledby="`${id}-titulo`"
    :aria-describedby="`${id}-descricao ${id}-aviso`"
    @click="
      (event) => {
        if (event.target === dialogo) dialogo.close();
      }
    "
  >
    <v-icon
      icon="mdi-trash-can-outline"
      class="av-mobile lixeira"
      aria-hidden="true"
    />
    <h2 :id="`${id}-titulo`">Excluir avaliação?</h2>
    <p
      v-if="moderacao"
      :id="`${id}-descricao`"
    >
      {{
        autor && autor !== 'Você' ? `A opinião de ${autor}` : 'Sua opinião'
      }}
      será removida da página do livro.
    </p>
    <p
      v-else
      :id="`${id}-descricao`"
    >
      Sua avaliação de {{ livro.titulo }} será removida.
    </p>
    <p
      v-if="!moderacao"
      class="av-suave av-desktop"
    >
      Ela deixará de aparecer na página do livro.
    </p>
    <p
      :id="`${id}-aviso`"
      class="texto-perigo aviso-exclusao"
    >
      {{
        moderacao
          ? 'A exclusão é definitiva. O autor poderá publicar outra avaliação.'
          : 'Esta ação não pode ser desfeita.'
      }}
    </p>
    <p
      v-if="erro"
      role="alert"
      class="av-erro"
    >
      {{ erro }}
    </p>
    <div class="av-acoes">
      <button
        type="button"
        class="av-botao manter"
        autofocus
        @click="dialogo.close()"
      >
        <template v-if="moderacao">Manter avaliação</template
        ><template v-else
          ><span class="av-desktop">Cancelar</span
          ><span class="av-mobile">Manter avaliação</span></template
        >
      </button>
      <button
        type="button"
        class="av-botao perigo"
        :disabled="excluindo"
        @click="excluir"
      >
        {{ excluindo ? 'Excluindo…' : 'Excluir avaliação' }}
      </button>
    </div>
  </dialog>
</template>
