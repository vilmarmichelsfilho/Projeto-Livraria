import { ref } from 'vue';
import api, { mensagemErro } from './api';
import usuariosService from './usuariosService';

export const avaliacoes = ref([]);
export const erroAvaliacoes = ref('');
export const carregandoAvaliacoes = ref(false);
let carregamento;

export function carregarAvaliacoes() {
  if (carregamento) return carregamento;
  carregandoAvaliacoes.value = true;
  erroAvaliacoes.value = '';
  carregamento = (async () => {
    try {
      const { data } = await api.get('/avaliacoes');
      const ids = new Set(data.map((item) => String(item.id_usuario)));
      const params = new URLSearchParams();
      for (const id of ids) params.append('id', id);
      const autores = ids.size
        ? (await api.get('/usuarios', { params })).data
        : [];
      const nomes = new Map(autores.map(({ id, nome }) => [String(id), nome]));
      avaliacoes.value = data.map((item) => ({
        ...item,
        autor: nomes.get(String(item.id_usuario)) || 'Leitor',
      }));
      return true;
    } catch (erro) {
      erroAvaliacoes.value = mensagemErro(erro);
      return false;
    } finally {
      carregandoAvaliacoes.value = false;
      carregamento = undefined;
    }
  })();
  return carregamento;
}

export async function salvarAvaliacao(idLivro, nota, comentario) {
  const texto = comentario.trim();
  if (!Number.isInteger(nota) || nota < 1 || nota > 5 || texto.length > 2000) {
    throw new Error('Selecione uma nota de 1 a 5 e use até 2.000 caracteres.');
  }

  const usuario = await usuariosService.atual();
  if (usuario.perfil !== 'CLIENTE') {
    throw new Error('Entre com uma conta de cliente para avaliar.');
  }
  const { data: livro } = await api.get(`/livros/${idLivro}`);
  if (!livro.ativo)
    throw new Error('Este livro está indisponível para avaliação.');

  const { data: existentes } = await api.get('/avaliacoes', {
    params: { id_livro: livro.id, id_usuario: usuario.id },
  });
  const anterior = existentes[0];
  const agora = new Date().toISOString();
  const campos = { nota, comentario: texto, atualizado_em: agora };
  const { data } = anterior
    ? await api.patch(`/avaliacoes/${anterior.id}`, campos)
    : await api.post('/avaliacoes', {
        ...campos,
        id_livro: livro.id,
        id_usuario: usuario.id,
        criado_em: agora,
      });

  avaliacoes.value = [
    ...avaliacoes.value.filter((item) => String(item.id) !== String(data.id)),
    { ...data, autor: usuario.nome },
  ];
  return data;
}

export async function excluirAvaliacao(id) {
  const usuario = await usuariosService.atual();
  const { data: avaliacao } = await api.get(`/avaliacoes/${id}`);
  if (
    usuario.perfil !== 'ADMIN' &&
    String(avaliacao.id_usuario) !== String(usuario.id)
  ) {
    throw new Error('Você só pode excluir a própria avaliação.');
  }
  await api.delete(`/avaliacoes/${avaliacao.id}`);
  avaliacoes.value = avaliacoes.value.filter(
    (item) => String(item.id) !== String(id),
  );
}
