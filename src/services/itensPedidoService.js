import { criarServico } from './crudService.js'
import api from './api.js'
import { recalcularTotal } from './pedidosService.js'
const servico = criarServico('itens_pedido')
export const { listar, buscarPorId } = servico
async function validar(dados, id) {
  const { data: pedido } = await api.get(`/pedidos/${dados.id_pedido}`)
  if (pedido.status !== 'RASCUNHO') throw new Error('Somente pedidos em rascunho podem ser editados.')
  const { data: livro } = await api.get(`/livros/${dados.id_livro}`)
  if (!livro.ativo || !Number.isInteger(dados.quantidade) || dados.quantidade < 1 || dados.quantidade > livro.estoque) {
    throw new Error('Quantidade invalida ou estoque insuficiente.')
  }
  const repetidos = await listar({ id_pedido: dados.id_pedido, id_livro: dados.id_livro })
  if (repetidos.some(item => item.id !== id)) throw new Error('O livro ja esta neste pedido.')
  return { ...dados, preco_unitario: livro.preco, titulo_livro: livro.titulo, atualizado_em: new Date().toISOString() }
}
export async function cadastrar(dados) {
  const item = await servico.cadastrar({ ...await validar(dados), criado_em: new Date().toISOString() })
  await recalcularTotal(item.id_pedido)
  return item
}
export async function atualizar(id, dados) {
  const anterior = await buscarPorId(id)
  const item = await servico.atualizar(id, await validar({ ...anterior, quantidade: dados.quantidade ?? anterior.quantidade }, id))
  await recalcularTotal(item.id_pedido)
  return item
}
export async function excluir(id) {
  const item = await buscarPorId(id)
  const { data: pedido } = await api.get(`/pedidos/${item.id_pedido}`)
  if (pedido.status !== 'RASCUNHO') throw new Error('Somente pedidos em rascunho podem ser editados.')
  await servico.excluir(id)
  await recalcularTotal(item.id_pedido)
}
export default { listar, buscarPorId, cadastrar, atualizar, excluir }
