<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { API_URL, lerResposta, mensagemErro } from '@/utils/api';

const props = defineProps({ livro: { type: Object, required: true } });
const emit = defineEmits(['cancelar', 'excluido', 'inativado']);
const dialogo = ref(null);
const vinculos = ref(null);
const avaliacoes = ref([]);
const carregando = ref(true);
const salvando = ref(false);
const erro = ref('');
const temPedidos = computed(() => vinculos.value && vinculos.value.pedidos > 0);
let focoAnterior;

// O JSON Server é padrão; a interface consulta os relacionamentos.
async function carregarVinculos() {
  carregando.value = true;
  erro.value = '';
  try {
    await lerResposta(await fetch(`${API_URL}/livros/${props.livro.id}`));
    const respostaPedidos = await fetch(`${API_URL}/pedidos`);
    const pedidos = await lerResposta(respostaPedidos);
    const respostaAvaliacoes = await fetch(
      `${API_URL}/avaliacoes?id_livro=${props.livro.id}`,
    );
    avaliacoes.value = await lerResposta(respostaAvaliacoes);
    const relacionados = pedidos.filter((pedido) =>
      (pedido.itens || []).some(
        (item) => Number(item.id_livro) === Number(props.livro.id),
      ),
    );
    vinculos.value = {
      pedidos: relacionados.length,
      pode_excluir: relacionados.length === 0,
    };
    return true;
  } catch (e) {
    erro.value = mensagemErro(e);
    return false;
  } finally {
    carregando.value = false;
  }
}

async function excluirLivro() {
  if (
    salvando.value ||
    carregando.value ||
    erro.value ||
    !vinculos.value?.pode_excluir
  ) {
    return;
  }
  salvando.value = true;
  try {
    // Confere os pedidos novamente antes das exclusões.
    const conferido = await carregarVinculos();
    if (!conferido || !vinculos.value.pode_excluir) {
      return;
    }
    for (const avaliacao of avaliacoes.value) {
      const resposta = await fetch(`${API_URL}/avaliacoes/${avaliacao.id}`, {
        method: 'DELETE',
      });
      if (resposta.status !== 404) {
        await lerResposta(resposta);
      }
    }
    const resposta = await fetch(`${API_URL}/livros/${props.livro.id}`, {
      method: 'DELETE',
    });
    await lerResposta(resposta);
    emit('excluido');
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    salvando.value = false;
  }
}

async function inativarLivro() {
  if (salvando.value || carregando.value || erro.value) {
    return;
  }
  salvando.value = true;
  try {
    const resposta = await fetch(`${API_URL}/livros/${props.livro.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ativo: false,
        atualizado_em: new Date().toISOString(),
      }),
    });
    await lerResposta(resposta);
    emit('inativado');
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    salvando.value = false;
  }
}

function cancelar() {
  if (!salvando.value) {
    emit('cancelar');
  }
}

onMounted(() => {
  focoAnterior = document.activeElement;
  dialogo.value.showModal();
  carregarVinculos();
});
onBeforeUnmount(() => {
  dialogo.value.close();
  focoAnterior?.focus();
});
</script>

<template>
  <dialog
    ref="dialogo"
    class="confirmacao"
    aria-labelledby="titulo-exclusao"
    aria-describedby="detalhe-exclusao"
    @cancel.prevent="cancelar"
  >
    <v-icon
      :icon="temPedidos ? 'mdi-lock-outline' : 'mdi-delete-outline'"
      class="icone-dialogo"
      :color="temPedidos ? '#c9952f' : '#af4653'"
      size="26"
    />
    <h2 id="titulo-exclusao">
      <template v-if="carregando">Verificando vínculos…</template>
      <template v-else-if="temPedidos">Este livro tem pedidos</template>
      <template v-else>Excluir livro?</template>
    </h2>

    <p>{{ livro.titulo }}</p>
    <p
      id="detalhe-exclusao"
      class="texto-suave"
    >
      <template v-if="temPedidos">
        Preserve o histórico. Você pode inativar o livro para impedir novas
        compras.
      </template>
      <template v-else-if="vinculos">
        O livro será removido do catálogo. Suas avaliações também serão
        excluídas.
      </template>
      <template v-else>Aguarde a consulta dos pedidos e avaliações.</template>
    </p>
    <p
      v-if="erro"
      role="alert"
      class="erro-campo"
    >
      {{ erro }}
    </p>

    <div class="acoes-dialogo">
      <button
        autofocus
        class="btn secundario"
        :disabled="salvando"
        @click="cancelar"
      >
        Cancelar
      </button>
      <button
        v-if="erro"
        class="btn"
        :disabled="salvando"
        @click="carregarVinculos"
      >
        Tentar novamente
      </button>
      <button
        v-else-if="temPedidos"
        class="btn"
        :disabled="salvando || !livro.ativo"
        @click="inativarLivro"
      >
        {{
          salvando
            ? 'Inativando…'
            : livro.ativo
              ? 'Inativar livro'
              : 'Livro já inativo'
        }}
      </button>
      <button
        v-else
        class="btn perigo"
        :disabled="salvando || carregando || !vinculos"
        @click="excluirLivro"
      >
        {{ salvando ? 'Excluindo…' : 'Excluir livro' }}
      </button>
    </div>
  </dialog>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.confirmacao {
  position: fixed;
  margin: auto;
  width: min(650px, calc(100vw - 32px));
  max-height: calc(100dvh - 32px);
  border: 1px solid var(--livraria-borda);
  border-radius: 16px;
  padding: 36px;
  color: #263e49;
  box-shadow: 0 12px 48px #263e4920;
}
.confirmacao::backdrop {
  background: #263e4950;
}
.confirmacao .icone-dialogo {
  width: 26px;
  height: 26px;
  object-fit: contain;
  margin-bottom: 8px;
}
.confirmacao h2 {
  font-size: 28px;
  font-weight: 700;
}
.confirmacao > p {
  margin-top: 28px;
}
.confirmacao .texto-suave {
  margin-top: 38px;
}
.acoes-dialogo {
  display: grid;
  grid-template-columns: 1fr 1.9fr;
  gap: 20px;
  margin-top: 56px;
}
@media (max-width: 700px) {
  .confirmacao {
    padding: 26px 24px;
  }
  .confirmacao h2 {
    font-size: 25px;
  }
  .acoes-dialogo {
    display: flex;
    flex-direction: column-reverse;
    margin-top: 30px;
    gap: 12px;
  }
  .confirmacao .texto-suave {
    margin-top: 24px;
  }
}
</style>
