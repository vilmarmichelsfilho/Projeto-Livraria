import { reactive, computed } from 'vue'
import { produtos, usuarioId, executarOperacao } from '../services/lojaService.js'
import pedidos from '../services/pedidosService.js'
import itens from '../services/itensPedidoService.js'

export const carrinho = reactive([])
export const total = computed(() => Number(carrinho.reduce((soma, item) => soma + item.precoTotal, 0).toFixed(2)))
async function obterPedido(criar = false) {
  const lista = await pedidos.listar({ id_usuario: usuarioId, status: 'RASCUNHO' })
  return lista[0] ?? (criar ? await pedidos.cadastrar({ id_usuario: usuarioId }) : null)
}
export async function carregarCarrinho() {
  const pedido = await obterPedido()
  const registros = pedido ? await itens.listar({ id_pedido: pedido.id }) : []
  carrinho.splice(0, carrinho.length, ...registros.map(item => {
    const livro = produtos.find(produto => produto.id === item.id_livro)
    return {
      ...livro, id: item.id_livro, itemId: item.id,
      titulo: livro?.titulo ?? item.titulo_livro,
      preco: item.preco_unitario, quantidade: item.quantidade,
      precoTotal: Number((item.quantidade * item.preco_unitario).toFixed(2)),
    }
  }))
}
function modificar(acao) {
  return executarOperacao(async () => {
    try { await acao() }
    finally { await carregarCarrinho() }
  })
}
export function adicionaraoarrinho(idLivro, quantidade) {
  return modificar(async () => {
    if (!Number.isInteger(quantidade) || quantidade < 1) throw new Error('Quantidade invalida.')
    const pedido = await obterPedido(true)
    const existentes = await itens.listar({ id_pedido: pedido.id, id_livro: idLivro })
    if (existentes.length) {
      await itens.atualizar(existentes[0].id, { quantidade: existentes[0].quantidade + quantidade })
    } else {
      await itens.cadastrar({ id_pedido: pedido.id, id_livro: idLivro, quantidade })
    }
  })
}
export function removerItem(idLivro) {
  return modificar(async () => {
    const pedido = await obterPedido()
    if (!pedido) return
    const registros = await itens.listar({ id_pedido: pedido.id, id_livro: idLivro })
    for (const item of registros) await itens.excluir(item.id)
  })
}
export function alterarQuantidade(idLivro, delta) {
  return modificar(async () => {
    if (!Number.isInteger(delta)) throw new Error('Quantidade invalida.')
    const pedido = await obterPedido()
    if (!pedido) return
    const [item] = await itens.listar({ id_pedido: pedido.id, id_livro: idLivro })
    if (!item) return
    const quantidade = item.quantidade + delta
    if (quantidade <= 0) await itens.excluir(item.id)
    else await itens.atualizar(item.id, { quantidade })
  })
}
