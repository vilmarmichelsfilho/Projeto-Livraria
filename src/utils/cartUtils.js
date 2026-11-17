// Estado compartilhado do carrinho; as consultas da API ficam nas telas Vue.
import { reactive, computed } from 'vue';

export const carrinho = reactive([]);
export const total = computed(
  () =>
    carrinho.reduce(
      (soma, item) => soma + Math.round(item.precoTotal * 100),
      0,
    ) / 100,
);

export function adicionaraoarrinho(livro, quantidade) {
  const item = carrinho.find((registro) => registro.id === livro.id);
  const novaQuantidade = (item ? item.quantidade : 0) + quantidade;
  if (!livro.ativo || novaQuantidade > livro.estoque || novaQuantidade < 1) {
    throw new Error('A quantidade solicitada não está disponível no estoque.');
  }
  const dados = {
    ...livro,
    capa: livro.capa_url,
    quantidade: novaQuantidade,
    precoTotal: Math.round(novaQuantidade * livro.preco * 100) / 100,
  };
  if (item) Object.assign(item, dados);
  else carrinho.push(dados);
}

export function removerItem(id) {
  const indice = carrinho.findIndex((item) => item.id === id);
  if (indice !== -1) carrinho.splice(indice, 1);
}
