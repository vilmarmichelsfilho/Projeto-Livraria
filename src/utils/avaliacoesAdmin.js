import { computed, ref } from 'vue';
import api, { mensagemErro } from '@/services/api';
import {
  avaliacoes,
  carregarAvaliacoes,
  erroAvaliacoes,
} from '@/services/avaliacoesService';

const livros = ref(new Map());
export const carregandoPainel = ref(false);
export const erroPainel = ref('');
export async function carregarPainel() {
  carregandoPainel.value = true;
  erroPainel.value = '';
  try {
    const [avaliacoesCarregadas, { data }] = await Promise.all([
      carregarAvaliacoes(),
      api.get('/livros'),
    ]);
    if (!avaliacoesCarregadas) {
      erroPainel.value = erroAvaliacoes.value;
      return;
    }
    livros.value = new Map(data.map((livro) => [String(livro.id), livro]));
  } catch (erro) {
    erroPainel.value = mensagemErro(erro);
  } finally {
    carregandoPainel.value = false;
  }
}

export const avaliacoesComLivros = computed(() =>
  avaliacoes.value
    .map((avaliacao) => ({
      ...avaliacao,
      livro: livros.value.get(String(avaliacao.id_livro)) ?? {
        titulo: 'Livro indisponível',
        autor: '',
        capa_url: '',
        preco: null,
      },
    }))
    .sort((a, b) => Date.parse(b.criado_em) - Date.parse(a.criado_em)),
);

export const dataAvaliacao = (data) =>
  new Date(data).toLocaleDateString('pt-BR');
export const normalizarBusca = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
