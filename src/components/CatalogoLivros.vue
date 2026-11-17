<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { API_URL, lerResposta, mensagemErro } from '@/utils/api';
import { favoritos, estaFavoritado, alternarFavorito } from '@/utils/favoritos';
import { generos, normalizarTexto } from '@/utils/livrosUtils';
import { adicionaraoarrinho } from '@/utils/cartUtils';
import ProdutoCard from '@/components/Produtos/produtoCard.vue';
import EstadoRequisicao from './EstadoRequisicao.vue';

const props = defineProps({ genero: String, somenteFavoritos: Boolean });
const route = useRoute();
const livros = ref([]);
const carregando = ref(false);
const erro = ref('');
const aviso = ref('');
const adicionando = ref([]);
const exibidos = computed(() =>
  props.somenteFavoritos
    ? livros.value.filter((livro) => favoritos.value.includes(livro.id))
    : livros.value,
);
let consulta = 0;

async function carregar() {
  const numero = ++consulta;
  carregando.value = true;
  erro.value = '';
  try {
    const resposta = await fetch(`${API_URL}/livros?ativo=true`);
    let dados = await lerResposta(resposta);
    if (props.genero)
      dados = dados.filter((livro) => livro.genero === props.genero);
    const busca = normalizarTexto(route.query.q || '');
    if (busca) {
      dados = dados.filter(
        (livro) =>
          normalizarTexto(livro.titulo).includes(busca) ||
          normalizarTexto(livro.autor).includes(busca),
      );
    }
    if (numero === consulta) livros.value = dados;
  } catch (e) {
    if (numero === consulta) erro.value = mensagemErro(e);
  } finally {
    if (numero === consulta) carregando.value = false;
  }
}

async function adicionar(id, quantidade) {
  if (adicionando.value.includes(id)) return;
  adicionando.value.push(id);
  aviso.value = '';
  try {
    const resposta = await fetch(`${API_URL}/livros/${id}`);
    const livro = await lerResposta(resposta);
    adicionaraoarrinho(livro, quantidade);
    aviso.value = 'Livro adicionado ao carrinho.';
  } catch (e) {
    aviso.value =
      e.status || e instanceof TypeError ? mensagemErro(e) : e.message;
  } finally {
    adicionando.value = adicionando.value.filter((item) => item !== id);
  }
}
watch(() => [props.genero, route.query.q], carregar, { immediate: true });
</script>
<template>
  <main class="loja-conteudo">
    <h1>{{ somenteFavoritos ? 'Seus livros favoritos' : 'Livros' }}</h1>
    <nav
      v-if="!somenteFavoritos"
      class="generos"
      aria-label="Gêneros de livros"
    >
      <RouterLink
        to="/"
        :class="{ selecionado: !genero }"
        >Todos</RouterLink
      ><RouterLink
        v-for="item in generos"
        :key="item"
        :to="`/${item}`"
        :class="{ selecionado: genero === item }"
        >{{ item }}</RouterLink
      >
    </nav>
    <EstadoRequisicao
      v-if="aviso"
      :mensagem="aviso"
    />
    <EstadoRequisicao
      v-if="carregando"
      tipo="carregando"
      mensagem="Carregando livros…"
    />
    <EstadoRequisicao
      v-else-if="erro"
      tipo="erro"
      :mensagem="erro"
      tentar-novamente
      @tentar="carregar"
    />
    <EstadoRequisicao
      v-else-if="!exibidos.length"
      :mensagem="
        somenteFavoritos
          ? 'Você ainda não tem livros favoritos disponíveis. Marque a estrela de um livro no catálogo.'
          : 'Nenhum livro encontrado para esta pesquisa.'
      "
      ><RouterLink to="/">Voltar ao catálogo</RouterLink></EstadoRequisicao
    >
    <ul
      v-else
      class="grade-livros"
    >
      <ProdutoCard
        v-for="livro in exibidos"
        :key="livro.id"
        :titulo="livro.titulo"
        :endereco="livro.endereco"
        :autor="livro.autor"
        :preco="livro.preco"
        :capa="livro.capa_url"
        :estoque="livro.estoque"
        :ativo="livro.ativo"
        :id="livro.id"
        :favorito="estaFavoritado(livro.id)"
        :ocupado="adicionando.includes(livro.id)"
        @favoritar="alternarFavorito"
        @adicionarcarrinho="adicionar"
      />
    </ul>
  </main>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.loja-conteudo {
  padding: 70px 6vw 90px;
}
.loja-conteudo > h1 {
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 24px;
}
.generos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px 40px;
  margin: 0 auto 24px;
}
.generos a {
  padding: 10px 24px;
  border-radius: 9px;
  background: var(--livraria-azul);
  color: black;
  font-weight: 700;
}
.generos a.selecionado {
  background: var(--livraria-acao);
  color: white;
}
.grade-livros {
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 38px 64px;
  list-style: none;
  padding: 0;
  max-width: 1252px;
  margin: auto;
}
@media (max-width: 1050px) {
  .grade-livros {
    gap: 30px;
  }
}
@media (max-width: 700px) {
  .loja-conteudo {
    padding: 32px 20px 60px;
  }
  .loja-conteudo > h1 {
    font-size: 28px;
  }
  .generos {
    justify-content: flex-start;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 10px;
    padding-bottom: 8px;
  }
  .generos a {
    font-size: 13px;
    white-space: nowrap;
    padding: 9px 16px;
  }
  .grade-livros {
    gap: 24px;
  }
}
</style>
