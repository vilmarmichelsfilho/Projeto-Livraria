import { criarServico } from './crudService.js'
import api from './api.js'
const servico = criarServico('livros')
export const { listar, buscarPorId, cadastrar, atualizar } = servico
export async function excluir(id) {
  const { data } = await api.get('/itens_pedido', { params: { id_livro: id } })
  if (data.length) throw new Error('Livro vinculado a pedidos. Desative o livro para preservar o historico.')
  await servico.excluir(id)
}
export default { listar, buscarPorId, cadastrar, atualizar, excluir }
