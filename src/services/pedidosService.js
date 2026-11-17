import api from "./api";

export const situacoesPedido = {
  RASCUNHO: "Rascunho",
  RECEBIDO: "Recebido",
  EM_SEPARACAO: "Em separação",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};
export const etapasPedido = ["RECEBIDO", "EM_SEPARACAO", "ENVIADO", "ENTREGUE"];
export const moeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
export const totalItens = (itens) =>
  Math.round(
    itens.reduce(
      (total, item) => total + item.quantidade * item.preco_unitario,
      0,
    ) * 100,
  ) / 100;
export const erroPedido = (erro) =>
  erro.response?.status === 404
    ? "Pedido não encontrado."
    : erro.response?.data?.message ||
      (erro.response || !erro.request
        ? erro.message
        : "Não foi possível conectar à API. Inicie a API com npm run api e tente novamente.");
async function obter(id) {
  return (await api.get(`/pedidos/${id}`)).data;
}
async function rascunho(id) {
  const pedido = await obter(id);
  if (pedido.status !== "RASCUNHO")
    throw new Error(
      "Somente pedidos em rascunho podem ser alterados ou excluídos.",
    );
  return pedido;
}
export default {
  obter,
  async listar() {
    return (await api.get("/pedidos")).data;
  },
  async clientes() {
    return (await api.get("/usuarios")).data.filter(
      (usuario) => usuario.perfil === "CLIENTE",
    );
  },
  async livros() {
    return (await api.get("/livros")).data.filter((livro) => livro.ativo);
  },
  async salvar(id, dados, itens) {
    if (!dados.id_usuario) throw new Error("Selecione um cliente.");
    const cliente = (await api.get(`/usuarios/${dados.id_usuario}`)).data;
    if (!cliente.ativo || cliente.perfil !== "CLIENTE")
      throw new Error("Selecione um cliente ativo.");
    const agora = new Date().toISOString();
    const campos = {
      ...dados,
      itens: itens.map((item) => ({
        id_livro: item.id_livro,
        titulo_livro: item.titulo_livro,
        quantidade: item.quantidade,
        preco_unitario: Number(item.preco_unitario).toFixed(2),
      })),
      total: totalItens(itens),
      atualizado_em: agora,
    };
    if (id) {
      await rascunho(id);
      return (await api.patch(`/pedidos/${id}`, campos)).data;
    }
    return (
      await api.post("/pedidos", {
        ...campos,
        status: "RASCUNHO",
        criado_em: agora,
        confirmado_em: null,
        cancelado_em: null,
        motivo_cancelamento: null,
      })
    ).data;
  },
  async excluir(id) {
    await rascunho(id);
    await api.delete(`/pedidos/${id}`);
  },
  async mudarSituacao(id, status) {
    const pedido = await obter(id);
    const itens = pedido.itens ?? [];
    const confirmar = pedido.status === "RASCUNHO" && status === "RECEBIDO";
    const cancelar =
      ["RECEBIDO", "EM_SEPARACAO"].includes(pedido.status) &&
      status === "CANCELADO";
    if (
      !confirmar &&
      !cancelar &&
      !(
        etapasPedido.includes(pedido.status) &&
        status === etapasPedido[etapasPedido.indexOf(pedido.status) + 1]
      )
    )
      throw new Error("Esta mudança de situação não é permitida.");
    if (
      confirmar &&
      (!itens.length ||
        !pedido.destinatario?.trim() ||
        !pedido.endereco_entrega?.trim())
    )
      throw new Error(
        "Preencha o destinatário, o endereço e adicione pelo menos um livro antes de confirmar.",
      );
    if (confirmar) {
      const cliente = (await api.get("/usuarios/" + pedido.id_usuario)).data;
      if (!cliente.ativo || cliente.perfil !== "CLIENTE")
        throw new Error(
          "Selecione um cliente ativo antes de confirmar o pedido.",
        );
    }
    const alterados = [];
    try {
      if (confirmar || cancelar) {
        const livros = await Promise.all(
          itens.map(async (item) => {
            const livro = (await api.get(`/livros/${item.id_livro}`)).data;
            if (confirmar && (!livro.ativo || livro.estoque < item.quantidade))
              throw new Error(
                `Estoque insuficiente para ${item.titulo_livro}.`,
              );
            return { livro, item };
          }),
        );
        for (const { livro, item } of livros) {
          await api.patch(`/livros/${livro.id}`, {
            estoque:
              livro.estoque + (cancelar ? item.quantidade : -item.quantidade),
          });
          alterados.push(livro);
        }
      }
      const agora = new Date().toISOString();
      return (
        await api.patch(`/pedidos/${id}`, {
          status,
          atualizado_em: agora,
          ...(confirmar
            ? { confirmado_em: agora, total: totalItens(itens) }
            : {}),
          ...(cancelar
            ? {
                cancelado_em: agora,
                motivo_cancelamento: "Cancelado pela administração.",
              }
            : {}),
        })
      ).data;
    } catch (erro) {
      const resultados = await Promise.allSettled(
        alterados.map((livro) =>
          api.patch(`/livros/${livro.id}`, { estoque: livro.estoque }),
        ),
      );
      if (resultados.some((resultado) => resultado.status === "rejected"))
        throw new Error(
          "A operação falhou. Confira o estoque dos livros antes de tentar novamente.",
          { cause: erro },
        );
      throw erro;
    }
  },
};
