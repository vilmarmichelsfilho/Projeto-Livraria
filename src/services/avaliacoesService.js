import { ref } from 'vue'
import api, { mensagemErroApi } from './api.js'

export const avaliacoes = ref([])
export const erroAvaliacoes = ref('')
export const carregandoAvaliacoes = ref(false)
let carregamento

function validar(item) {
  return item && typeof item.livroId === 'number' && Number.isInteger(item.nota)
    && item.nota >= 1 && item.nota <= 5 && typeof item.comentario === 'string'
    && item.comentario.length <= 2000 && typeof item.criadaEm === 'string'
    && !Number.isNaN(Date.parse(item.criadaEm))
}

export function carregarAvaliacoes({ silencioso = false } = {}) {
  if (carregamento) return carregamento
  if (!silencioso) carregandoAvaliacoes.value = true
  carregamento = (async () => {
    try {
      const { data } = await api.get('/avaliacoes')
      if (!Array.isArray(data) || !data.every(item => validar(item) && item.id != null)) {
        erroAvaliacoes.value = 'O servidor retornou avaliações inválidas.'
        return false
      }
      avaliacoes.value = data
      erroAvaliacoes.value = ''
      return true
    } catch (erro) {
      erroAvaliacoes.value = mensagemErroApi(erro, 'carregar as avaliações')
      return false
    } finally {
      carregandoAvaliacoes.value = false
      carregamento = undefined
    }
  })()
  return carregamento
}

// A interface demonstrativa mantém uma avaliação por livro, sem autenticação.
export async function salvarAvaliacao(livroId, nota, comentario) {
  const agora = new Date().toISOString()
  const item = { livroId, nota, comentario: comentario.trim(), criadaEm: agora, atualizadaEm: agora }
  if (!validar(item)) throw new Error('Selecione uma nota de 1 a 5 e use até 2.000 caracteres.')
  if (!await carregarAvaliacoes({ silencioso: true })) throw new Error(erroAvaliacoes.value)
  const anterior = avaliacoes.value.find(avaliacao => avaliacao.livroId === livroId)
  item.criadaEm = anterior?.criadaEm ?? agora
  try {
    const { data } = anterior
      ? await api.patch(`/avaliacoes/${encodeURIComponent(anterior.id)}`, item)
      : await api.post('/avaliacoes', item)
    avaliacoes.value = [...avaliacoes.value.filter(avaliacao => avaliacao.id !== data.id), data]
    return data
  } catch (erro) {
    throw new Error(mensagemErroApi(erro, 'salvar a avaliação'), { cause: erro })
  }
}

export async function excluirAvaliacao(livroId) {
  if (!await carregarAvaliacoes({ silencioso: true })) throw new Error(erroAvaliacoes.value)
  const item = avaliacoes.value.find(avaliacao => avaliacao.livroId === livroId)
  if (!item) return
  try {
    await api.delete(`/avaliacoes/${encodeURIComponent(item.id)}`)
    avaliacoes.value = avaliacoes.value.filter(avaliacao => avaliacao.id !== item.id)
  } catch (erro) {
    throw new Error(mensagemErroApi(erro, 'excluir a avaliação'), { cause: erro })
  }
}
