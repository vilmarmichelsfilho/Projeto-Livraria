import { produtos } from '@/data/produtos'
import { reactive } from 'vue'
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
export{adicionaraoarrinho, carrinho}
