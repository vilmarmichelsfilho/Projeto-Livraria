import api from "./api";
export default {
  async listar(idPedido) {
    return (await api.get("/itens_pedido", { params: { id_pedido: idPedido } }))
      .data;
  },
  async obter(id) {
    return (await api.get(`/itens_pedido/${id}`)).data;
  },
  async criar(dados) {
    return (await api.post("/itens_pedido", dados)).data;
  },
  async atualizar(id, dados) {
    return (await api.patch(`/itens_pedido/${id}`, dados)).data;
  },
  async excluir(id) {
    await api.delete(`/itens_pedido/${id}`);
  },
};
