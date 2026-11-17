<script setup>
import { nextTick, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { API_URL, lerResposta, mensagemErro } from '@/utils/api';
import { formataPreco } from '@/utils/produtosUtils';
import { adicionarAoCarrinho } from '@/utils/cartUtils';
import { estaFavoritado, alternarFavorito } from '@/utils/favoritos';
import AvaliacoesLivro from '@/components/Avaliacoes/AvaliacoesLivro.vue';
import CapaLivro from '@/components/CapaLivro.vue';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';
const route = useRoute();
const livro = ref(null);
const carregando = ref(false);
const erro = ref('');
const aviso = ref('');
const adicionando = ref(false);
let consulta = 0;
async function carregar() {
  const numero = ++consulta;
  carregando.value = true;
  erro.value = '';
  aviso.value = '';
  livro.value = null;
  try {
    const endereco = encodeURIComponent(route.params.endereco);
    const resposta = await fetch(
      `${API_URL}/livros?endereco=${endereco}&ativo=true`,
    );
    const encontrados = await lerResposta(resposta);
    if (numero !== consulta) {
      return;
    }
    if (!encontrados.length) {
      erro.value =
        'Livro não encontrado. Ele pode ter sido excluído ou inativado.';
      return;
    }
    livro.value = encontrados[0];
    carregando.value = false;
    if (route.hash === '#avaliacoes') {
      await nextTick();
      if (numero === consulta)
        document.getElementById('avaliacoes')?.scrollIntoView();
    }
  } catch (e) {
    if (numero === consulta) {
      erro.value = mensagemErro(e);
    }
  } finally {
    if (numero === consulta) {
      carregando.value = false;
    }
  }
}
async function adicionar() {
  if (adicionando.value) {
    return;
  }
  adicionando.value = true;
  aviso.value = '';
  try {
    const resposta = await fetch(`${API_URL}/livros/${livro.value.id}`);
    const atualizado = await lerResposta(resposta);
    adicionarAoCarrinho(atualizado, 1);
    aviso.value = 'Livro adicionado ao carrinho.';
  } catch (e) {
    aviso.value = mensagemErro(e);
  } finally {
    adicionando.value = false;
  }
}
watch(() => route.params.endereco, carregar, { immediate: true });
</script>
<template>
  <main class="detalhes-loja">
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
      @tentar="carregar"
      ><RouterLink to="/">Voltar ao catálogo</RouterLink></EstadoRequisicao
    >
    <template v-else-if="livro"
      ><article class="livro-loja">
        <CapaLivro
          :src="livro.capa_url"
          :titulo="livro.titulo"
        />
        <div>
          <h1>{{ livro.titulo }}</h1>
          <p class="autor">{{ livro.autor }}</p>
          <p class="descricao-livro">{{ livro.descricao }}</p>
          <p class="preco-detalhe">{{ formataPreco(livro.preco) }}</p>
          <p>
            {{
              livro.estoque > 0 && livro.ativo
                ? `${livro.estoque} exemplares disponíveis`
                : 'Livro indisponível'
            }}
          </p>
          <div class="acoes-form">
            <button
              class="btn"
              :disabled="livro.estoque <= 0 || !livro.ativo || adicionando"
              @click="adicionar"
            >
              <v-icon
                icon="mdi-cart"
                size="20"
              />{{
                adicionando
                  ? 'Adicionando…'
                  : livro.estoque > 0 && livro.ativo
                    ? 'Adicionar ao carrinho'
                    : 'Sem estoque'
              }}</button
            ><button
              class="btn secundario"
              :aria-pressed="estaFavoritado(livro.id)"
              @click="alternarFavorito(livro.id)"
            >
              {{
                estaFavoritado(livro.id) ? 'Remover dos favoritos' : 'Favoritar'
              }}
            </button>
          </div>
          <EstadoRequisicao
            v-if="aviso"
            :mensagem="aviso"
          />
          <dl class="dados-editoriais">
            <div>
              <dt>Gênero</dt>
              <dd>{{ livro.genero }}</dd>
            </div>
            <div>
              <dt>Páginas</dt>
              <dd>{{ livro.paginas }}</dd>
            </div>
          </dl>
        </div>
      </article>
      <AvaliacoesLivro
        :key="livro.id"
        :livro="livro"
      />
    </template>
  </main>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.detalhes-loja {
  padding: 48px;
}
.livro-loja {
  display: grid;
  grid-template-columns: minmax(200px, 400px) minmax(0, 1fr);
  gap: 48px;
}
.livro-loja h1 {
  font-size: 32px;
  font-weight: 700;
}
.livro-loja .autor {
  color: #53636a;
  font-size: 20px;
  font-weight: 600;
}
.dados-editoriais {
  display: flex;
  gap: 56px;
  margin-top: 20px;
}
.dados-editoriais dt {
  font-size: 32px;
  font-weight: 700;
}
@media (max-width: 700px) {
  .detalhes-loja {
    padding: 28px 20px;
  }
  .livro-loja {
    display: flex;
    flex-direction: column;
    gap: 26px;
  }
  .livro-loja > .capa-livro {
    width: 200px;
    align-self: center;
  }
  .livro-loja h1 {
    font-size: 27px;
  }
  .livro-loja .autor {
    font-size: 18px;
  }
  .dados-editoriais dt {
    font-size: 23px;
  }
}
</style>
