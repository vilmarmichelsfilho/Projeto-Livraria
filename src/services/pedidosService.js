import { criarServico } from './crudService.js'
import api from './api.js'
const servico = criarServico('pedidos')
export const { listar, buscarPorId } = servico
export async function cadastrar(dados) {
  const { data: usuario } = await api.get(`/usuarios/${dados.id_usuario}`)
  if (!usuario.ativo) throw new Error('Usuario inativo.')
  const agora = new Date().toISOString()
  return servico.cadastrar({ ...dados, status: 'RASCUNHO', total: 0, criado_em: agora, atualizado_em: agora })
}
export async function atualizar(id, dados) {
  const pedido = await buscarPorId(id)
  if (pedido.status !== 'RASCUNHO') throw new Error('Somente pedidos em rascunho podem ser editados.')
  if (dados.status && dados.status !== 'RASCUNHO') throw new Error('Use o fluxo de confirmacao para finalizar o pedido.')
  return servico.atualizar(id, { ...dados, atualizado_em: new Date().toISOString() })
}
export async function recalcularTotal(id) {
  const { data: itens } = await api.get('/itens_pedido', { params: { id_pedido: id } })
  const total = Number(itens.reduce((soma, item) => soma + item.quantidade * item.preco_unitario, 0).toFixed(2))
  return atualizar(id, { total })
}
export async function excluir(id) {
  const pedido = await buscarPorId(id)
  if (pedido.status !== 'RASCUNHO') throw new Error('Nao e permitido excluir pedidos confirmados.')
  const { data: itens } = await api.get('/itens_pedido', { params: { id_pedido: id } })
  for (const item of itens) await api.delete(`/itens_pedido/${item.id}`)
  await servico.excluir(id)
}
export default { listar, buscarPorId, cadastrar, atualizar, excluir, recalcularTotal }
