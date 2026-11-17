import { criarServico } from './crudService.js'
import api from './api.js'
const servico = criarServico('usuarios')
export const { listar, buscarPorId, cadastrar, atualizar } = servico
export async function excluir(id) {
  const { data } = await api.get('/pedidos', { params: { id_usuario: id } })
  if (data.length) throw new Error('Usuario vinculado a pedidos. Desative o usuario para preservar o historico.')
  await servico.excluir(id)
}
export default { listar, buscarPorId, cadastrar, atualizar, excluir }
