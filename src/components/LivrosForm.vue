<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { generos, criarEndereco } from '@/utils/livrosUtils';

const props = defineProps({
  inicial: Object,
  ocupado: Boolean,
  errosApi: { type: Object, default: () => ({}) },
  cancelar: { type: String, default: '/admin/livros' },
});
const emit = defineEmits(['salvar']);

// Os mesmos campos atendem ao cadastro e à edição.
const livro = ref({
  titulo: '',
  autor: '',
  genero: '',
  preco: '',
  paginas: '',
  estoque: '',
  estoque_minimo: 5,
  capa_url: '',
  descricao: '',
  ativo: true,
  endereco: '',
  ...props.inicial,
});
const erros = ref({});

function erroCampo(campo) {
  return erros.value[campo] || props.errosApi[campo];
}

function salvarLivro() {
  livro.value.endereco =
    livro.value.endereco.trim() || criarEndereco(livro.value.titulo);
  erros.value = validarLivro(livro.value);

  if (Object.keys(erros.value).length > 0) {
    const campo = Object.keys(erros.value)[0];
    document.getElementById(`livro-${campo}`)?.focus();
    return;
  }

  emit('salvar', { ...livro.value });
}
function validarLivro(livro) {
  const erros = {};

  function verificarTexto(campo, nome, limite) {
    const texto = livro[campo];
    if (typeof texto !== 'string' || texto.trim() === '') {
      erros[campo] = `${nome} é obrigatório.`;
    } else if (texto.trim().length > limite) {
      erros[campo] = `Use até ${limite} caracteres.`;
    }
  }

  verificarTexto('titulo', 'Título', 180);
  verificarTexto('autor', 'Autor', 120);
  verificarTexto('genero', 'Gênero', 60);
  verificarTexto('descricao', 'Descrição', 10000);

  const preco = livro.preco;
  const centavos = preco * 100;
  const casasInvalidas = Math.abs(centavos - Math.round(centavos)) > 0.00001;
  if (
    !Number.isFinite(preco) ||
    preco <= 0 ||
    preco > 99999999.99 ||
    casasInvalidas
  ) {
    erros.preco =
      'Informe um preço maior que zero, com até duas casas decimais.';
  }

  if (!Number.isSafeInteger(livro.paginas) || livro.paginas < 1) {
    erros.paginas = 'Informe um número inteiro maior que zero.';
  }
  if (!Number.isSafeInteger(livro.estoque) || livro.estoque < 0) {
    erros.estoque = 'Informe um número inteiro igual ou maior que zero.';
  }
  if (!Number.isSafeInteger(livro.estoque_minimo) || livro.estoque_minimo < 0) {
    erros.estoque_minimo = 'Informe um número inteiro igual ou maior que zero.';
  }
  if (typeof livro.ativo !== 'boolean') {
    erros.ativo = 'Selecione se o livro está ativo.';
  }

  const enderecoValido =
    typeof livro.endereco === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(livro.endereco) &&
    livro.endereco.length <= 200;
  if (!enderecoValido) {
    erros.endereco =
      'Use letras minúsculas, números e hífens no endereço do livro.';
  }

  if (livro.capa_url) {
    const capaValida =
      typeof livro.capa_url === 'string' &&
      livro.capa_url.length <= 500 &&
      /^(\/images\/[\w.-]+|https?:\/\/[^\s]+)$/i.test(livro.capa_url);
    if (!capaValida) {
      erros.capa_url = 'Use /images/arquivo.jpg ou uma URL http/https válida.';
    }
  }

  return erros;
}
</script>

<template>
  <form
    class="painel livro-form"
    novalidate
    :aria-busy="ocupado"
    @submit.prevent="salvarLivro"
  >
    <fieldset :disabled="ocupado">
      <legend class="sr-only">Dados do livro</legend>
      <div class="form-grid">
        <div class="campo">
          <label for="livro-titulo">Título *</label>
          <input
            id="livro-titulo"
            v-model="livro.titulo"
            type="text"
            maxlength="180"
            required
            :aria-invalid="!!erroCampo('titulo')"
            aria-describedby="erro-titulo"
          />
          <p
            v-if="erroCampo('titulo')"
            id="erro-titulo"
            class="erro-campo"
          >
            {{ erroCampo('titulo') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-autor">Autor *</label>
          <input
            id="livro-autor"
            v-model="livro.autor"
            type="text"
            maxlength="120"
            required
            :aria-invalid="!!erroCampo('autor')"
            aria-describedby="erro-autor"
          />
          <p
            v-if="erroCampo('autor')"
            id="erro-autor"
            class="erro-campo"
          >
            {{ erroCampo('autor') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-genero">Gênero *</label>
          <select
            id="livro-genero"
            v-model="livro.genero"
            required
            :aria-invalid="!!erroCampo('genero')"
            aria-describedby="erro-genero"
          >
            <option
              value=""
              disabled
            >
              Selecione o gênero
            </option>
            <option
              v-for="genero in generos"
              :key="genero"
            >
              {{ genero }}
            </option>
            <option v-if="livro.genero && !generos.includes(livro.genero)">
              {{ livro.genero }}
            </option>
          </select>
          <p
            v-if="erroCampo('genero')"
            id="erro-genero"
            class="erro-campo"
          >
            {{ erroCampo('genero') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-preco">Preço (R$) *</label>
          <input
            id="livro-preco"
            v-model.number="livro.preco"
            type="number"
            min="0.01"
            step="0.01"
            required
            :aria-invalid="!!erroCampo('preco')"
            aria-describedby="erro-preco"
          />
          <p
            v-if="erroCampo('preco')"
            id="erro-preco"
            class="erro-campo"
          >
            {{ erroCampo('preco') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-paginas">Páginas *</label>
          <input
            id="livro-paginas"
            v-model.number="livro.paginas"
            type="number"
            min="1"
            step="1"
            required
            :aria-invalid="!!erroCampo('paginas')"
            aria-describedby="erro-paginas"
          />
          <p
            v-if="erroCampo('paginas')"
            id="erro-paginas"
            class="erro-campo"
          >
            {{ erroCampo('paginas') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-estoque">Estoque disponível *</label>
          <input
            id="livro-estoque"
            v-model.number="livro.estoque"
            type="number"
            min="0"
            step="1"
            required
            :aria-invalid="!!erroCampo('estoque')"
            aria-describedby="erro-estoque"
          />
          <p
            v-if="erroCampo('estoque')"
            id="erro-estoque"
            class="erro-campo"
          >
            {{ erroCampo('estoque') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-estoque_minimo">Estoque mínimo *</label>
          <input
            id="livro-estoque_minimo"
            v-model.number="livro.estoque_minimo"
            type="number"
            min="0"
            step="1"
            required
            :aria-invalid="!!erroCampo('estoque_minimo')"
            aria-describedby="erro-estoque_minimo"
          />
          <p
            v-if="erroCampo('estoque_minimo')"
            id="erro-estoque_minimo"
            class="erro-campo"
          >
            {{ erroCampo('estoque_minimo') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-capa_url">Capa (opcional)</label>
          <input
            id="livro-capa_url"
            v-model="livro.capa_url"
            type="text"
            maxlength="500"
            placeholder="/images/sombra-e-ossos.jpg"
            :aria-invalid="!!erroCampo('capa_url')"
            aria-describedby="erro-capa_url"
          />
          <p
            v-if="erroCampo('capa_url')"
            id="erro-capa_url"
            class="erro-campo"
          >
            {{ erroCampo('capa_url') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-descricao">Descrição *</label>
          <textarea
            id="livro-descricao"
            v-model="livro.descricao"
            rows="3"
            maxlength="10000"
            required
            :aria-invalid="!!erroCampo('descricao')"
            aria-describedby="erro-descricao"
          ></textarea>
          <p
            v-if="erroCampo('descricao')"
            id="erro-descricao"
            class="erro-campo"
          >
            {{ erroCampo('descricao') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-ativo">Ativo *</label>
          <select
            id="livro-ativo"
            v-model="livro.ativo"
            required
          >
            <option :value="true">Sim</option>
            <option :value="false">Não</option>
          </select>
          <p
            v-if="erroCampo('ativo')"
            class="erro-campo"
          >
            {{ erroCampo('ativo') }}
          </p>
        </div>

        <div class="campo">
          <label for="livro-endereco">Endereço do livro (opcional)</label>
          <input
            id="livro-endereco"
            v-model="livro.endereco"
            type="text"
            maxlength="200"
            placeholder="Gerado a partir do título"
            :aria-invalid="!!erroCampo('endereco')"
            aria-describedby="erro-endereco"
          />
          <p
            v-if="erroCampo('endereco')"
            id="erro-endereco"
            class="erro-campo"
          >
            {{ erroCampo('endereco') }}
          </p>
        </div>
      </div>

      <div class="acoes-form">
        <button
          class="btn"
          type="submit"
        >
          {{
            ocupado
              ? 'Salvando…'
              : inicial
                ? 'Salvar alterações'
                : 'Cadastrar livro'
          }}
        </button>
        <RouterLink
          :to="cancelar"
          class="btn secundario"
          :aria-disabled="ocupado"
          @click="ocupado && $event.preventDefault()"
        >
          Cancelar
        </RouterLink>
      </div>
    </fieldset>
  </form>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.livro-form {
  padding: 28px 32px 48px;
}
.livro-form fieldset {
  border: 0;
  padding: 0;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 30px;
}
@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .livro-form {
    padding: 22px 18px 28px;
  }
}
</style>
