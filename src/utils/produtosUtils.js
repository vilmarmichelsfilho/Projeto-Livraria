import { moedaPais, idioma } from './globalUtils'
import { alternarFavorito } from '../services/lojaService.js'
function formataPreco(preco) {
  return Number(preco ?? 0).toLocaleString(idioma, { style: 'currency', currency: moedaPais })
}
function favoritar(lista, idDoProduto) {
  return alternarFavorito(idDoProduto)
}
export { formataPreco, favoritar }
