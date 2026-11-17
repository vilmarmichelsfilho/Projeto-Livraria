import { computed } from 'vue'
import { avaliacoes } from '@/services/avaliacoesService'
import { produtos } from '@/data/produtos'

export const avaliacoesComLivros = computed(() => avaliacoes.value.map(avaliacao => ({
  ...avaliacao,
  autor: typeof avaliacao.autor === 'string' && avaliacao.autor.trim() ? avaliacao.autor : 'Você',
  livro: produtos.find(livro => livro.id === avaliacao.livroId) ?? {
    id: avaliacao.livroId, titulo: 'Livro indisponível', autor: '', capa: '', preco: null,
  },
})).sort((a, b) => Date.parse(b.criadaEm) - Date.parse(a.criadaEm)))

export const dataAvaliacao = data => new Date(data).toLocaleDateString('pt-BR')
export const normalizarBusca = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
