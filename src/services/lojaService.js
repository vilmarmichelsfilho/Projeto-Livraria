import { reactive, ref } from 'vue'
import api, { mensagemErroApi } from './api.js'

// Cliente de demonstração; não representa uma sessão autenticada.
export const usuarioId = 2
export const produtos = reactive([])
export const erroLoja = ref('')
export const carregandoLoja = ref(true)
export const operandoLoja = ref(false)
let fila = Promise.resolve()

export async function carregarCatalogo() {
  const [{ data: livros }, { data: favoritos }] = await Promise.all([
    api.get('/livros', { params: { ativo: true } }),
    api.get('/favoritos', { params: { id_usuario: usuarioId } }),
  ])
  produtos.splice(0, produtos.length, ...livros.map(livro => ({
    ...livro, favorito: favoritos.some(item => item.id_livro === livro.id),
  })))
}

// Serializa cliques para evitar atualizações concorrentes na mesma interface.
export function executarOperacao(acao) {
  const resultado = fila.then(async () => {
    operandoLoja.value = true
    erroLoja.value = ''
    try { await acao(); return true }
    catch (erro) {
      erroLoja.value = erro.isAxiosError ? mensagemErroApi(erro, 'atualizar os dados') : erro.message
      return false
    } finally { operandoLoja.value = false }
  })
  fila = resultado
  return resultado
}

export function alternarFavorito(idLivro) {
  return executarOperacao(async () => {
    const { data: livro } = await api.get(`/livros/${idLivro}`)
    if (!livro.ativo) throw new Error('Este livro está indisponível.')
    const { data: favoritos } = await api.get('/favoritos', { params: { id_usuario: usuarioId, id_livro: idLivro } })
    if (favoritos.length) {
      for (const item of favoritos) await api.delete(`/favoritos/${item.id}`)
    } else {
      await api.post('/favoritos', { id_usuario: usuarioId, id_livro: idLivro })
    }
    await carregarCatalogo()
  })
}
