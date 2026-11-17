<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { API_URL, lerResposta, mensagemErro } from '@/utils/api';
import { favoritos, estaFavoritado, alternarFavorito } from '@/utils/favoritos';
import { generos, normalizarTexto } from '@/utils/livrosUtils';
import { adicionarAoCarrinho } from '@/utils/cartUtils';
import ProdutoCard from '@/components/Produtos/produtoCard.vue';
import EstadoRequisicao from './EstadoRequisicao.vue';

const props = defineProps({ genero: String, somenteFavoritos: Boolean });
const route = useRoute();
const livros = ref([]);
const carregando = ref(false);
const erro = ref('');
const aviso = ref('');
const adicionando = ref([]);

// A API carrega os livros uma vez. Os filtros usam essa lista na tela.
const exibidos = computed(() => {
  const resultado = [];
  const pesquisa = normalizarTexto(route.query.q || '');

  for (const livro of livros.value) {
    if (props.genero && livro.genero !== props.genero) {
      continue;
    }
    if (props.somenteFavoritos && !favoritos.value.includes(livro.id)) {
      continue;
    }

    const texto = normalizarTexto(livro.titulo + ' ' + livro.autor);
    if (pesquisa && !texto.includes(pesquisa)) {
      continue;
    }
    resultado.push(livro);
  }
  return resultado;
});

async function carregar() {
  if (carregando.value) {
    return;
  }
  carregando.value = true;
  erro.value = '';
  try {
    const resposta = await fetch(API_URL + '/livros?ativo=true');
    livros.value = await lerResposta(resposta);
  } catch (erroApi) {
    erro.value = mensagemErro(erroApi);
  } finally {
    carregando.value = false;
  }
}

async function adicionar(id, quantidade) {
  if (adicionando.value.includes(id)) {
    return;
  }
  adicionando.value.push(id);
  aviso.value = '';
  try {
    // Consulta o estoque atual antes de colocar o livro no carrinho.
    const resposta = await fetch(API_URL + '/livros/' + id);
    const livro = await lerResposta(resposta);
    adicionarAoCarrinho(livro, quantidade);
    aviso.value = 'Livro adicionado ao carrinho.';
  } catch (erroApi) {
    aviso.value = mensagemErro(erroApi);
  } finally {
    adicionando.value = adicionando.value.filter((item) => item !== id);
  }
}

onMounted(carregar);
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
