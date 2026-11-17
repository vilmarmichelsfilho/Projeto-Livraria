import { ref } from 'vue'

const CHAVE = 'iflibrary:avaliacoes:v1'
export const avaliacoes = ref([])
export const erroAvaliacoes = ref('')

function validar(item) {
  return item && typeof item.livroId === 'number' && Number.isInteger(item.nota)
    && item.nota >= 1 && item.nota <= 5 && typeof item.comentario === 'string'
    && item.comentario.length <= 2000 && typeof item.criadaEm === 'string'
    && !Number.isNaN(Date.parse(item.criadaEm))
}

export function carregarAvaliacoes() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? '[]')
    if (!Array.isArray(dados) || !dados.every(validar)) throw new Error('Dados inválidos')
    avaliacoes.value = dados.filter((item, index) => dados.findIndex(a => a.livroId === item.livroId) === index)
    erroAvaliacoes.value = ''
    return true
  } catch {
    erroAvaliacoes.value = 'Não foi possível carregar suas avaliações. Verifique o armazenamento do navegador e tente novamente.'
    return false
  }
}

function persistir(dados) {
  // Persistência demonstrativa: substituir por API e usuário autenticado quando disponíveis.
  localStorage.setItem(CHAVE, JSON.stringify(dados))
  avaliacoes.value = dados
}

export function salvarAvaliacao(livroId, nota, comentario) {
  if (!carregarAvaliacoes()) throw new Error(erroAvaliacoes.value)
  const anterior = avaliacoes.value.find(item => item.livroId === livroId)
  const agora = new Date().toISOString()
  const item = { livroId, nota, comentario: comentario.trim(), criadaEm: anterior?.criadaEm ?? agora, atualizadaEm: agora }
  if (!validar(item)) throw new Error('Selecione uma nota de 1 a 5 e use até 2.000 caracteres.')
  persistir([...avaliacoes.value.filter(a => a.livroId !== livroId), item])
}

export function excluirAvaliacao(livroId) {
  if (!carregarAvaliacoes()) throw new Error(erroAvaliacoes.value)
  persistir(avaliacoes.value.filter(item => item.livroId !== livroId))
}

if (typeof window !== 'undefined') {
  carregarAvaliacoes()
  window.addEventListener('storage', event => {
    if (event.key === CHAVE || event.key === null) carregarAvaliacoes()
  })
}
