import { produtos } from '@/data/produtos'
import { reactive, computed } from 'vue'
const carrinho = reactive([])
function adicionaraoarrinho(idLivro, quantidade){
  const livro = produtos.find((p) => p.id === idLivro)
  if (livro) {
    const itemExistente = carrinho.find((item) => item.id === idLivro)
    if (itemExistente) {
      itemExistente.quantidade += quantidade
      itemExistente.precoTotal = itemExistente.quantidade * livro.preco
    } else {
      carrinho.push({
        ...livro,
        quantidade,
        precoTotal: quantidade * livro.preco,
      })
    }
  }
}
const total = computed(() =>
  carrinho.reduce((soma, item) => soma + item.precoTotal, 0)
)

function removerItem(id) {
  const index = carrinho.findIndex(item => item.id === id)
  if (index !== -1) carrinho.splice(index, 1)
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find(item => item.id === id)
  if (!item) return
  const novaQtd = item.quantidade + delta
  if (novaQtd <= 0) {
    removerItem(id)
  } else {
    adicionaraoarrinho(id, delta)
  }
}

export{adicionaraoarrinho, carrinho, total, removerItem, alterarQuantidade }
