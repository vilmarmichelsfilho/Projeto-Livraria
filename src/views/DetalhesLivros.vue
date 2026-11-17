<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { API_URL, lerResposta, mensagemErro } from '@/utils/api';
import { formataPreco } from '@/utils/produtosUtils';
import { adicionaraoarrinho } from '@/utils/cartUtils';
import { estaFavoritado, alternarFavorito } from '@/utils/favoritos';
import CapaLivro from '@/components/CapaLivro.vue';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';
const route = useRoute();
const livro = ref(null),
  carregando = ref(false),
  erro = ref(''),
  aviso = ref(''),
  adicionando = ref(false);
const avaliacoes = ref([]),
  erroAvaliacoes = ref(''),
  carregandoAvaliacoes = ref(false);
const media = computed(() =>
  avaliacoes.value.length
    ? (
        avaliacoes.value.reduce((soma, item) => soma + item.nota, 0) /
        avaliacoes.value.length
      ).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
    : '—',
);
function iconeMedia(estrela) {
  const nota = Number(media.value.replace(',', '.'));
  if (nota >= estrela) return 'mdi-star';
  if (nota >= estrela - 0.5) return 'mdi-star-half-full';
  return 'mdi-star-outline';
}
let consulta = 0;
async function carregarAvaliacoes(id = livro.value?.id) {
  const numero = consulta;
  carregandoAvaliacoes.value = true;
  erroAvaliacoes.value = '';
  try {
    const resposta = await fetch(`${API_URL}/avaliacoes?id_livro=${id}`);
    const dados = await lerResposta(resposta);
    if (numero === consulta) avaliacoes.value = dados;
  } catch (e) {
    if (numero === consulta) erroAvaliacoes.value = mensagemErro(e);
  } finally {
    if (numero === consulta) carregandoAvaliacoes.value = false;
  }
}
async function carregar() {
  const numero = ++consulta;
  carregando.value = true;
  erro.value = '';
  aviso.value = '';
  livro.value = null;
  avaliacoes.value = [];
  try {
    const endereco = encodeURIComponent(route.params.endereco);
    const resposta = await fetch(
      `${API_URL}/livros?endereco=${endereco}&ativo=true`,
    );
    const encontrados = await lerResposta(resposta);
    if (numero !== consulta) return;
    if (!encontrados.length) {
      erro.value =
        'Livro não encontrado. Ele pode ter sido excluído ou inativado.';
      return;
    }
    const respostaLivro = await fetch(`${API_URL}/livros/${encontrados[0].id}`);
    const dados = await lerResposta(respostaLivro);
    if (numero === consulta) {
      livro.value = dados;
      carregarAvaliacoes(dados.id);
    }
  } catch (e) {
    if (numero === consulta) erro.value = mensagemErro(e);
  } finally {
    if (numero === consulta) carregando.value = false;
  }
}
async function adicionar() {
  if (adicionando.value) return;
  adicionando.value = true;
  aviso.value = '';
  try {
    const resposta = await fetch(`${API_URL}/livros/${livro.value.id}`);
    const atualizado = await lerResposta(resposta);
    adicionaraoarrinho(atualizado, 1);
    aviso.value = 'Livro adicionado ao carrinho.';
  } catch (e) {
    aviso.value =
      e.status || e instanceof TypeError ? mensagemErro(e) : e.message;
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
      <section class="avaliacoes-leitores">
        <h2>Avaliações dos leitores</h2>
        <EstadoRequisicao
          v-if="carregandoAvaliacoes"
          tipo="carregando"
          mensagem="Carregando avaliações…"
        /><EstadoRequisicao
          v-else-if="erroAvaliacoes"
          tipo="erro"
          :mensagem="erroAvaliacoes"
          tentar-novamente
          @tentar="carregarAvaliacoes()"
        /><template v-else
          ><p class="resumo-notas">
            <strong>{{ media }}</strong
            ><span
              class="estrelas"
              aria-hidden="true"
              ><v-icon
                v-for="estrela in 5"
                :key="estrela"
                :icon="iconeMedia(estrela)"
                size="22" /></span
            >{{ avaliacoes.length }} avaliações publicadas
          </p>
          <p
            v-if="!avaliacoes.length"
            class="texto-suave"
          >
            Este livro ainda não tem avaliações.
          </p>
          <article
            v-for="item in avaliacoes"
            :key="item.id"
            class="avaliacao"
          >
            <h3>{{ item.nome || 'Leitor' }}</h3>
            <time :datetime="item.criado_em">{{
              new Date(item.criado_em).toLocaleDateString('pt-BR')
            }}</time>
            <p
              class="estrelas"
              :aria-label="`${item.nota} de 5 estrelas`"
            >
              <v-icon
                v-for="estrela in 5"
                :key="estrela"
                :icon="estrela <= item.nota ? 'mdi-star' : 'mdi-star-outline'"
                size="22"
              />
            </p>
            <p>{{ item.comentario || 'Avaliação sem comentário.' }}</p>
          </article></template
        >
      </section>
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
.avaliacoes-leitores {
  margin-top: 70px;
}
.avaliacoes-leitores h2 {
  font-size: 30px;
  font-weight: 700;
}
.resumo-notas {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  margin: 12px 0 30px;
  color: #53636a;
}
.resumo-notas strong {
  font-size: 36px;
  font-weight: 700;
  color: #263e49;
}
.estrelas {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #c9952f;
}
.avaliacao {
  padding: 24px;
  margin: 24px 0;
  border: 1px solid var(--livraria-borda);
  border-radius: 8px;
  background: white;
}
.avaliacao h3 {
  font-size: 18px;
  font-weight: 700;
}
.avaliacao time {
  color: #53636a;
  font-size: 13px;
}
.avaliacao .estrelas {
  margin: 16px 0;
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
  .avaliacoes-leitores {
    margin-top: 50px;
  }
  .avaliacoes-leitores h2 {
    font-size: 25px;
  }
  .avaliacao {
    padding: 20px;
  }
}
</style>
