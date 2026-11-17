<script setup>
import { ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { API_URL, lerResposta, mensagemErro } from '@/utils/api';
import LivrosForm from '@/components/LivrosForm.vue';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';

const route = useRoute();
const router = useRouter();
const salvando = ref(false);
const erro = ref('');
const errosCampos = ref({});
const voltar = String(route.query.voltar || '').startsWith('/admin/livros')
  ? String(route.query.voltar)
  : '/admin/livros';

// Recebe os dados validados pelo formulário e cadastra na API.
async function cadastrarLivro(novoLivro) {
  if (salvando.value) return;
  salvando.value = true;
  erro.value = '';
  errosCampos.value = {};

  try {
    const busca = await fetch(
      `${API_URL}/livros?endereco=${encodeURIComponent(novoLivro.endereco)}`,
    );
    const existentes = await lerResposta(busca);
    if (existentes.length > 0) {
      erro.value = 'Já existe um livro com este endereço.';
      errosCampos.value = { endereco: 'Escolha um endereço diferente.' };
      return;
    }
    const agora = new Date().toISOString();
    const dados = { ...novoLivro, criado_em: agora, atualizado_em: agora };
    const resposta = await fetch(`${API_URL}/livros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    const livro = await lerResposta(resposta);

    await router.push({
      name: 'admin-livro',
      params: { id: livro.id },
      query: { resultado: 'criado', voltar },
    });
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <section>
    <h1>Cadastrar livro</h1>
    <p class="subtitulo">Os campos com asterisco são obrigatórios</p>
    <EstadoRequisicao
      v-if="erro"
      tipo="erro"
      :mensagem="erro"
    />
    <LivrosForm
      :ocupado="salvando"
      :erros-api="errosCampos"
      :cancelar="voltar"
      @salvar="cadastrarLivro"
    />
    <RouterLink
      :to="voltar"
      class="link-voltar"
      ><v-icon
        icon="mdi-arrow-left"
        size="18"
      />
      Voltar à listagem</RouterLink
    >
  </section>
</template>
