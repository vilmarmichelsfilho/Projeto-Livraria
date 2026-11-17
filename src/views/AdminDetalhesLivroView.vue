<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { API_URL, lerResposta, mensagemErro } from '@/utils/api';
import { formataPreco } from '@/utils/produtosUtils';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';
import ConfirmacaoExclusao from '@/components/ConfirmacaoExclusao.vue';
import CapaLivro from '@/components/CapaLivro.vue';

const route = useRoute();
const router = useRouter();
const livro = ref(null);
const carregando = ref(true);
const erro = ref('');
const sucesso = ref('');
const mostrarExclusao = ref(false);
const voltar = String(route.query.voltar || '').startsWith('/admin/livros')
  ? String(route.query.voltar)
  : '/admin/livros';

if (route.query.resultado === 'criado') {
  sucesso.value = 'Livro cadastrado com sucesso.';
}
if (route.query.resultado === 'atualizado') {
  sucesso.value = 'Livro atualizado com sucesso.';
}

async function carregarLivro() {
  carregando.value = true;
  erro.value = '';
  try {
    const resposta = await fetch(`${API_URL}/livros/${route.params.id}`);
    livro.value = await lerResposta(resposta);
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    carregando.value = false;
  }
}

async function voltarAposExclusao() {
  mostrarExclusao.value = false;
  const destino = router.resolve(voltar);
  await router.push({
    path: destino.path,
    query: { ...destino.query, resultado: 'excluido' },
  });
}

async function atualizarAposInativacao() {
  mostrarExclusao.value = false;
  sucesso.value = 'Livro inativado com sucesso. O histórico foi preservado.';
  await carregarLivro();
}

onMounted(carregarLivro);
</script>

<template>
  <section>
    <h1>Detalhes do livro</h1>
    <p class="subtitulo">
      {{
        livro
          ? livro.titulo + ' · Código ' + livro.id
          : 'Consulta por identificador'
      }}
    </p>

    <EstadoRequisicao
      v-if="carregando"
      tipo="carregando"
      mensagem="Carregando livro…"
    />
    <EstadoRequisicao
      v-else-if="erro"
      tipo="erro"
      :mensagem="erro"
      tentar-novamente
      @tentar="carregarLivro"
    >
      <RouterLink :to="voltar">Voltar à listagem</RouterLink>
    </EstadoRequisicao>

    <template v-else-if="livro">
      <EstadoRequisicao
        v-if="sucesso"
        tipo="sucesso"
        :mensagem="sucesso"
      />
      <article class="painel detalhes-admin">
        <CapaLivro
          :src="livro.capa_url"
          :titulo="livro.titulo"
        />
        <div class="dados-livro">
          <h2>{{ livro.titulo }}</h2>
          <p class="texto-suave">{{ livro.autor }} · {{ livro.genero }}</p>
          <p class="preco-detalhe">{{ formataPreco(livro.preco) }}</p>
          <p>
            {{ livro.paginas }} páginas · {{ livro.estoque }} exemplares
            disponíveis
          </p>
          <p>
            Estoque mínimo {{ livro.estoque_minimo }} · Livro
            {{ livro.ativo ? 'ativo' : 'inativo' }}
          </p>
          <p class="descricao-livro">{{ livro.descricao }}</p>
          <p class="texto-suave">Endereço: {{ livro.endereco }}</p>
          <div class="acoes-form">
            <RouterLink
              :to="{
                name: 'admin-livro-editar',
                params: { id: livro.id },
                query: { voltar },
              }"
              class="btn"
            >
              Editar livro
            </RouterLink>
            <button
              class="btn secundario texto-perigo"
              @click="mostrarExclusao = true"
            >
              Excluir livro
            </button>
          </div>
        </div>
      </article>
      <RouterLink
        :to="voltar"
        class="link-voltar"
        ><v-icon
          icon="mdi-arrow-left"
          size="18"
        />
        Voltar à listagem</RouterLink
      >
    </template>

    <ConfirmacaoExclusao
      v-if="mostrarExclusao"
      :livro="livro"
      @cancelar="mostrarExclusao = false"
      @excluido="voltarAposExclusao"
      @inativado="atualizarAposInativacao"
    />
  </section>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.detalhes-admin {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 44px;
  padding: 32px;
}
.dados-livro > p {
  margin-top: 16px;
}
@media (max-width: 1050px) {
  .detalhes-admin {
    grid-template-columns: 190px minmax(0, 1fr);
    gap: 24px;
    padding: 24px;
  }
}
@media (max-width: 700px) {
  .detalhes-admin {
    display: flex;
    flex-direction: column;
    padding: 22px;
  }
  .detalhes-admin > .capa-livro {
    width: 190px;
    align-self: center;
  }
}
</style>
