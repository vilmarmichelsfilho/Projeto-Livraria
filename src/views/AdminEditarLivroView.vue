<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { API_URL, lerResposta, mensagemErro } from '@/utils/api';
import LivrosForm from '@/components/LivrosForm.vue';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';

const route = useRoute();
const router = useRouter();
const livro = ref(null);
const carregando = ref(true);
const salvando = ref(false);
const erro = ref('');
const erroCarga = ref('');
const errosCampos = ref({});
const voltar = String(route.query.voltar || '').startsWith('/admin/livros')
  ? String(route.query.voltar)
  : '/admin/livros';

async function carregarLivro() {
  carregando.value = true;
  erroCarga.value = '';
  try {
    const resposta = await fetch(`${API_URL}/livros/${route.params.id}`);
    livro.value = await lerResposta(resposta);
  } catch (e) {
    erroCarga.value = mensagemErro(e);
  } finally {
    carregando.value = false;
  }
}

async function atualizarLivro(dadosLivro) {
  if (salvando.value) {
    return;
  }
  salvando.value = true;
  erro.value = '';
  errosCampos.value = {};

  try {
    const busca = await fetch(
      `${API_URL}/livros?endereco=${encodeURIComponent(dadosLivro.endereco)}`,
    );
    const existentes = await lerResposta(busca);
    if (
      existentes.some((item) => Number(item.id) !== Number(route.params.id))
    ) {
      erro.value = 'Já existe um livro com este endereço.';
      errosCampos.value = { endereco: 'Escolha um endereço diferente.' };
      return;
    }
    const dados = { ...dadosLivro, atualizado_em: new Date().toISOString() };
    const resposta = await fetch(`${API_URL}/livros/${route.params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    const atualizado = await lerResposta(resposta);
    await router.push({
      name: 'admin-livro',
      params: { id: atualizado.id },
      query: { resultado: 'atualizado', voltar },
    });
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    salvando.value = false;
  }
}

onMounted(carregarLivro);
</script>

<template>
  <section>
    <h1>Editar livro</h1>
    <p class="subtitulo">Os campos com asterisco são obrigatórios</p>
    <EstadoRequisicao
      v-if="carregando"
      tipo="carregando"
      mensagem="Carregando os dados do livro…"
    />
    <EstadoRequisicao
      v-else-if="erroCarga"
      tipo="erro"
      :mensagem="erroCarga"
      tentar-novamente
      @tentar="carregarLivro"
    >
      <RouterLink :to="voltar">Voltar à listagem</RouterLink>
    </EstadoRequisicao>
    <template v-else-if="livro">
      <EstadoRequisicao
        v-if="erro"
        tipo="erro"
        :mensagem="erro"
      />
      <LivrosForm
        :inicial="livro"
        :ocupado="salvando"
        :erros-campos="errosCampos"
        :cancelar="voltar"
        @salvar="atualizarLivro"
      />
    </template>
  </section>
</template>
