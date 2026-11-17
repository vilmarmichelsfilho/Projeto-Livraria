import api from "./api";
import itensService from "./itensPedidoService";

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
  async salvar(id, dados, itens, aoCriar) {
    if (!dados.id_usuario) throw new Error("Selecione um cliente.");
    const cliente = (await api.get(`/usuarios/${dados.id_usuario}`)).data;
    if (!cliente.ativo) throw new Error("Selecione um cliente ativo.");
    const agora = new Date().toISOString();
    const pedido = id
      ? await rascunho(id)
      : (
          await api.post("/pedidos", {
            ...dados,
            status: "RASCUNHO",
            total: 0,
            criado_em: agora,
            atualizado_em: agora,
            confirmado_em: null,
            cancelado_em: null,
            motivo_cancelamento: null,
          })
        ).data;
    if (!id) aoCriar?.(pedido.id);
    const anteriores = await itensService.listar(pedido.id);
    for (const item of anteriores) {
      if (
        !itens.some((novo) => String(novo.id_livro) === String(item.id_livro))
      )
        await itensService.excluir(item.id);
    }
    for (const item of itens) {
      const anterior = anteriores.find(
        (existente) => String(existente.id_livro) === String(item.id_livro),
      );
      const campos = {
        id_pedido: pedido.id,
        id_livro: item.id_livro,
        titulo_livro: item.titulo_livro,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        atualizado_em: agora,
      };
      if (anterior) await itensService.atualizar(anterior.id, campos);
      else await itensService.criar({ ...campos, criado_em: agora });
    }
    return (
      await api.patch(`/pedidos/${pedido.id}`, {
        ...dados,
        total: totalItens(itens),
        atualizado_em: agora,
      })
    ).data;
  },
  async excluir(id) {
    await rascunho(id);
    for (const item of await itensService.listar(id))
      await itensService.excluir(item.id);
    await api.delete(`/pedidos/${id}`);
  },
  async mudarSituacao(id, status) {
    const pedido = await obter(id);
    const itens = await itensService.listar(id);
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
        );
      throw erro;
    }
  },
};
