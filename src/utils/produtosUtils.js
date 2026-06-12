import { moedaPais, idioma } from "./globalUtils";
function formataPreco(preco) {
    return preco.toLocaleString(idioma, {
        style: 'currency',
        currency: moedaPais,
    })
}
function favoritar(lista, iddoproduto,){
 const id = lista.findIndex(p => p.id == iddoproduto);
 if(id !== -1) {
  if(lista[id].favorito == false){
  lista[id].favorito = true
 }
 else{
  lista[id].favorito = false
 }
 return lista
}}
export { formataPreco, favoritar}
  