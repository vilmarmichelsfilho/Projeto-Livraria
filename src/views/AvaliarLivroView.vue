<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { mensagemErro } from '@/services/api';
import usuariosService from '@/services/usuariosService';
import {
  avaliacoes,
  erroAvaliacoes,
  carregandoAvaliacoes,
  carregarAvaliacoes,
  salvarAvaliacao,
} from '@/services/avaliacoesService';
import EstrelasAvaliacao from '@/components/Avaliacoes/EstrelasAvaliacao.vue';
import ExcluirAvaliacao from '@/components/Avaliacoes/ExcluirAvaliacao.vue';
import '@/assets/avaliacoes.css';
import { formataPreco } from '@/utils/produtosUtils';

const route = useRoute();
const router = useRouter();
const livro = ref(null);
const usuario = ref(null);
const minha = computed(() =>
  avaliacoes.value.find(
    (item) =>
      livro.value &&
      usuario.value &&
      String(item.id_livro) === String(livro.value.id) &&
      String(item.id_usuario) === String(usuario.value.id),
  ),
);
const nota = ref(0);
const comentario = ref('');
const erro = ref('');
const erroConsulta = ref('');
const carregandoLivro = ref(true);
const salvando = ref(false);
let consulta = 0;
async function carregarFormulario() {
  const numero = ++consulta;
  carregandoLivro.value = true;
  erroConsulta.value = '';
  erro.value = '';
  livro.value = null;
  try {
    const [{ data }, leitor, leuAvaliacoes] = await Promise.all([
      api.get('/livros', {
        params: { endereco: route.params.endereco, ativo: true },
      }),
      usuariosService.atual(),
      carregarAvaliacoes(),
    ]);
    if (numero !== consulta) return;
    if (leitor.perfil !== 'CLIENTE')
      throw new Error('Entre com uma conta de cliente para avaliar.');
    if (!leuAvaliacoes) throw new Error(erroAvaliacoes.value);
    livro.value = data[0] ?? null;
    usuario.value = leitor;
    nota.value = minha.value?.nota ?? 0;
    comentario.value = minha.value?.comentario ?? '';
  } catch (falha) {
    if (numero === consulta) erroConsulta.value = mensagemErro(falha);
  } finally {
    if (numero === consulta) carregandoLivro.value = false;
  }
}
watch(() => route.params.endereco, carregarFormulario, { immediate: true });
const voltar = computed(() => ({
  path: `/livro/${livro.value?.endereco}`,
  hash: '#avaliacoes',
}));
async function salvar() {
  if (salvando.value) return;
  erro.value = '';
  if (!nota.value) {
    erro.value = 'Selecione uma nota de 1 a 5 estrelas.';
    return;
  }
  salvando.value = true;
  try {
    await salvarAvaliacao(livro.value.id, nota.value, comentario.value);
    await router.push(voltar.value);
  } catch (falha) {
    erro.value = mensagemErro(falha);
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <main class="avaliacoes-ui avaliar-pagina">
    <p
      v-if="carregandoLivro"
      role="status"
    >
      Carregando livro…
    </p>
    <div
      v-else-if="erroConsulta"
      class="av-erro"
      role="alert"
    >
      {{ erroConsulta }}
      <button
        type="button"
        class="av-botao"
        @click="carregarFormulario"
      >
        Tentar novamente
      </button>
      <RouterLink
        class="av-botao"
        :to="{
          name: 'Detalhes Livro',
          params: { endereco: route.params.endereco },
        }"
        >Voltar ao livro</RouterLink
      >
    </div>
    <template v-else-if="livro">
      <div class="titulo-pagina">
        <RouterLink
          :to="voltar"
          class="av-mobile voltar"
          aria-label="Voltar ao livro"
          ><v-icon
            icon="mdi-chevron-left"
            aria-hidden="true"
        /></RouterLink>
        <h1>
          <span class="av-desktop">{{
            minha ? 'Editar minha avaliação' : 'Avaliar livro'
          }}</span
          ><span class="av-mobile">{{
            minha ? 'Editar avaliação' : 'Avaliar livro'
          }}</span>
        </h1>
      </div>
      <p class="av-suave subtitulo">
        <span class="av-desktop"
          >Conte como foi sua leitura de {{ livro.titulo }}.</span
        ><span class="av-mobile">Compartilhe sua experiência de leitura.</span>
      </p>
      <p
        v-if="carregandoAvaliacoes"
        role="status"
      >
        Carregando avaliações…
      </p>
      <div
        v-else-if="erroAvaliacoes"
        class="av-erro"
        role="alert"
      >
        {{ erroAvaliacoes }}
        <button
          type="button"
          class="av-botao"
          @click="carregarFormulario"
        >
          Tentar novamente
        </button>
      </div>
      <form
        v-else
        class="av-formulario"
        @submit.prevent="salvar"
      >
        <div class="livro-resumo">
          <img
            class="av-mobile capa"
            :src="livro.capa_url"
            v-if="livro.capa_url"
            :alt="`Capa de ${livro.titulo}`"
          />
          <div>
            <h2>{{ livro.titulo }}</h2>
            <p class="av-suave autor">
              {{ livro.autor
              }}<span class="av-desktop"> · {{ livro.genero }}</span>
            </p>
            <p class="av-mobile preco">{{ formataPreco(livro.preco) }}</p>
          </div>
        </div>
        <fieldset>
          <legend>Sua nota *</legend>
          <div class="selecao-nota">
            <EstrelasAvaliacao
              v-model:nota="nota"
              editavel
            />
            <span aria-live="polite">{{
              nota ? `${nota} de 5 estrelas` : 'Selecione uma nota de 1 a 5.'
            }}</span>
          </div>
        </fieldset>
        <label for="comentario">Comentário (opcional)</label>
        <textarea
          id="comentario"
          v-model="comentario"
          rows="5"
          maxlength="2000"
          placeholder="Conte o que achou do livro."
          aria-describedby="limite-comentario"
        />
        <span
          id="limite-comentario"
          class="contador av-suave"
          >{{ comentario.length }} / 2.000</span
        >
        <p class="orientacao">
          <span class="av-desktop"
            >Uma avaliação por livro. Você pode editar ou excluir a sua
            depois.</span
          ><span class="av-mobile"
            >Uma avaliação por cliente e livro. Você pode editar ou excluir a
            sua.</span
          >
        </p>
        <p
          v-if="erro || erroAvaliacoes"
          class="av-erro"
          role="alert"
        >
          {{ erro || erroAvaliacoes }}
        </p>
        <div class="av-acoes">
          <button
            class="av-botao principal"
            :disabled="salvando || !!erroAvaliacoes"
          >
            {{
              salvando
                ? 'Salvando…'
                : minha
                  ? 'Salvar alterações'
                  : 'Publicar avaliação'
            }}
          </button>
          <RouterLink
            class="av-botao"
            :to="voltar"
            >Cancelar</RouterLink
          >
          <ExcluirAvaliacao
            v-if="minha"
            :avaliacao-id="minha.id"
            :livro="livro"
            @excluida="router.push(voltar)"
            >Excluir avaliação</ExcluirAvaliacao
          >
        </div>
      </form>
    </template>
    <template v-else
      ><h1>Livro não encontrado</h1>
      <RouterLink
        class="av-botao"
        to="/"
        >Voltar ao catálogo</RouterLink
      ></template
    >
  </main>
</template>

<style scoped>
.avaliar-pagina {
  width: min(1216px, calc(100% - 48px));
  margin: 34px auto 54px;
}
.subtitulo {
  font-size: 17px;
  margin-top: 8px;
}
.av-formulario {
  max-width: 840px;
  margin: 42px auto 0;
  padding: 26px 36px 46px;
  line-height: 1.25;
  border-radius: 16px;
  background: #e9f5fa url('/images/avaliacoes/form.svg') center / 100% 100%
    no-repeat;
}
.av-formulario h2 {
  font-size: 23px;
}
.autor {
  margin-top: 8px;
  margin-bottom: 32px;
}
fieldset {
  border: 0;
  padding: 0;
  margin: 0 0 18px;
}
legend,
label {
  display: block;
  font-size: 18px;
  font-weight: 700;
}
.selecao-nota {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-top: 14px;
  color: var(--av-primaria);
}
textarea {
  display: block;
  width: 100%;
  min-height: 160px;
  resize: vertical;
  padding: 18px;
  margin-top: 12px;
  border: 1px solid #dce8ed;
  border-radius: 7px;
  background: #fff;
  color: var(--av-texto);
  font: inherit;
  font-size: 17px;
}
textarea::placeholder {
  color: var(--av-suave);
}
.contador {
  display: block;
  text-align: right;
  font-size: 12px;
  margin-top: 4px;
}
.orientacao {
  margin: 18px 0 36px;
  color: var(--av-primaria);
}
.principal {
  min-width: 240px;
}
@media (max-width: 650px) {
  .avaliar-pagina {
    width: calc(100% - 40px);
    margin: 16px auto 36px;
  }
  .titulo-pagina {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .titulo-pagina h1 {
    font-size: 24px;
  }
  .voltar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    min-height: 44px;
    flex-shrink: 0;
    margin-left: -8px;
  }
  .voltar svg {
    width: 24px;
    height: 24px;
  }
  .subtitulo {
    font-size: 14px;
    margin-top: 8px;
  }
  .av-formulario {
    padding: 0;
    margin: 40px auto 0;
    border-radius: 0;
    background: none;
  }
  .livro-resumo {
    display: flex;
    gap: 14px;
    padding: 14px;
    border: 1px solid #d4e3ea;
    border-radius: 9px;
    background: white;
    margin-bottom: 28px;
  }
  .livro-resumo > div {
    min-width: 0;
  }
  .capa {
    width: 68px;
    height: 106px;
    object-fit: contain;
    object-position: top;
    flex-shrink: 0;
  }
  .av-formulario h2 {
    font-size: 16px;
    overflow-wrap: anywhere;
    line-height: 1.4;
  }
  .autor {
    font-size: 12px;
    margin: 8px 0;
  }
  .preco {
    font-size: 16px;
    font-weight: 700;
  }
  legend,
  label {
    font-size: 14px;
  }
  fieldset {
    margin-bottom: 30px;
  }
  .selecao-nota {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-top: 20px;
    font-size: 14px;
    color: var(--av-suave);
  }
  .selecao-nota :deep(.escolha) {
    gap: 2px;
  }
  textarea {
    min-height: 154px;
    margin-top: 8px;
    padding: 12px;
    font-size: 16px;
    line-height: 1.5;
  }
  .contador {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .orientacao {
    font-size: 13px;
    line-height: 1.8;
    color: var(--av-suave);
    margin: 32px 0 48px;
  }
  .av-acoes {
    flex-direction: column;
    align-items: stretch;
  }
  .av-acoes > .av-botao,
  .av-acoes :deep(> button) {
    width: 100%;
    min-height: 48px;
    font-size: 15px;
    border-radius: 8px;
    scroll-margin-bottom: 90px;
  }
  .av-acoes :deep(> .texto-perigo) {
    border: 1px solid #d95767;
    color: #bb4154;
    background: white;
  }
}
</style>
