<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { mensagemErro } from '@/services/api';
import LayoutAdminAvaliacoes from '@/components/Avaliacoes/LayoutAdminAvaliacoes.vue';
import EstrelasAvaliacao from '@/components/Avaliacoes/EstrelasAvaliacao.vue';
import ExcluirAvaliacao from '@/components/Avaliacoes/ExcluirAvaliacao.vue';
import { dataAvaliacao } from '@/utils/avaliacoesAdmin';
import { formataPreco } from '@/utils/produtosUtils';

const route = useRoute();
const router = useRouter();
const avaliacao = ref(null);
const carregandoPainel = ref(true);
const erroPainel = ref('');

async function carregarPainel() {
  carregandoPainel.value = true;
  erroPainel.value = '';
  avaliacao.value = null;
  try {
    // Consulta o registro pelo ID, como solicitado na atividade de CRUD.
    const resposta = await api.get('/avaliacoes/' + route.params.id);
    const registro = resposta.data;
    const livros = await api.get('/livros', {
      params: { id: registro.id_livro },
    });
    const usuarios = await api.get('/usuarios', {
      params: { id: registro.id_usuario },
    });
    avaliacao.value = {
      ...registro,
      autor: usuarios.data[0]?.nome || 'Leitor',
      livro: livros.data[0] || {
        titulo: 'Livro indisponível',
        autor: '',
        capa_url: '',
        preco: null,
      },
    };
  } catch (erro) {
    // Em 404, o template apresenta o estado de registro não encontrado.
    if (erro.response?.status !== 404) {
      erroPainel.value = mensagemErro(erro);
    }
  } finally {
    carregandoPainel.value = false;
  }
}
onMounted(carregarPainel);
</script>

<template>
  <LayoutAdminAvaliacoes>
    <div class="admin-titulo">
      <RouterLink
        to="/admin/avaliacoes"
        aria-label="Voltar à lista"
        ><v-icon
          icon="mdi-chevron-left"
          aria-hidden="true"
      /></RouterLink>
      <h1>Consultar avaliação</h1>
    </div>
    <p
      v-if="carregandoPainel"
      role="status"
    >
      Carregando avaliação…
    </p>
    <div
      v-else-if="erroPainel"
      class="av-erro"
      role="alert"
    >
      {{ erroPainel
      }}<button
        class="av-botao"
        @click="carregarPainel"
      >
        Tentar novamente
      </button>
    </div>
    <template v-else-if="avaliacao">
      <p class="admin-subtitulo">Avaliação #{{ avaliacao.id }}</p>
      <div class="admin-cartao admin-livro">
        <img
          v-if="avaliacao.livro.capa_url"
          :src="avaliacao.livro.capa_url"
          :alt="`Capa de ${avaliacao.livro.titulo}`"
        />
        <div>
          <h2>{{ avaliacao.livro.titulo }}</h2>
          <p class="admin-meta">{{ avaliacao.livro.autor }}</p>
          <p
            v-if="avaliacao.livro.preco !== null"
            class="admin-preco"
          >
            {{ formataPreco(avaliacao.livro.preco) }}
          </p>
        </div>
      </div>
      <article class="admin-cartao admin-consulta">
        <h2>{{ avaliacao.autor }}</h2>
        <p class="admin-meta">Autor da avaliação</p>
        <div class="admin-nota">
          <EstrelasAvaliacao :nota="avaliacao.nota" /><span
            >{{ avaliacao.nota }} de 5</span
          >
        </div>
        <h3>Comentário</h3>
        <p class="admin-comentario">
          {{ avaliacao.comentario || 'Sem comentário.' }}
        </p>
        <p class="admin-data">
          Publicada em
          <time :datetime="avaliacao.criado_em">{{
            dataAvaliacao(avaliacao.criado_em)
          }}</time>
        </p>
      </article>
      <div class="admin-detalhe-acoes">
        <ExcluirAvaliacao
          :avaliacao-id="avaliacao.id"
          :livro="avaliacao.livro"
          :autor="avaliacao.autor"
          moderacao
          @excluida="router.push('/admin/avaliacoes')"
          >Excluir avaliação</ExcluirAvaliacao
        >
        <RouterLink
          class="av-botao"
          to="/admin/avaliacoes"
          >Voltar à lista</RouterLink
        >
      </div>
      <p class="admin-aviso">
        A nota e o comentário são editados apenas pelo autor.
      </p>
    </template>
    <div
      v-else
      class="admin-cartao admin-vazio"
    >
      <h2>Avaliação não encontrada</h2>
      <p>Ela pode ter sido excluída ou não estar disponível no servidor.</p>
      <RouterLink
        class="av-botao"
        to="/admin/avaliacoes"
        >Voltar à lista</RouterLink
      >
    </div>
  </LayoutAdminAvaliacoes>
</template>
