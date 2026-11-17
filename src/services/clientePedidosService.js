import api from './api';
const base = '/cliente/pedidos';
export const moedaPedido = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
export const dataPedido = (valor) =>
  valor ? new Date(valor).toLocaleDateString('pt-BR') : '—';
export const statusPedido = {
  RASCUNHO: 'Rascunho',
  RECEBIDO: 'Recebido',
  EM_SEPARACAO: 'Em separação',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};
export const etapasCliente = [
  'RECEBIDO',
  'EM_SEPARACAO',
  'ENVIADO',
  'ENTREGUE',
];
export const erroClientePedido = (erro) =>
  erro.response?.data?.message ||
  (erro.response?.status === 404
    ? 'Pedido não encontrado.'
    : 'Não foi possível carregar os pedidos. Confira sua conexão e tente novamente.');
export const totalPedidoItens = (itens) =>
  itens.reduce(
    (total, item) =>
      total + Math.round(Number(item.preco_unitario) * 100) * item.quantidade,
    0,
  ) / 100;
export default {
  async listar() {
    return (await api.get(base)).data;
  },
  async obter(id) {
    return (await api.get(`${base}/${id}`)).data;
  },
  async criar(itens) {
    return (await api.post(base, { itens })).data;
  },
  async atualizar(id, itens) {
    return (await api.patch(`${base}/${id}`, { itens })).data;
  },
  async confirmar(id, total) {
    return (await api.post(`${base}/${id}/confirmar`, { total })).data;
  },
  async cancelar(id) {
    return (await api.post(`${base}/${id}/cancelar`)).data;
  },
  async excluir(id) {
    await api.delete(`${base}/${id}`);
  },
  async livros() {
    return (await api.get('/livros')).data;
  },
};
