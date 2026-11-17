// Favoritos locais não criam uma quinta entidade.
import { ref } from 'vue';
function lerFavoritos() {
  try {
    const ids = JSON.parse(localStorage.getItem('olympus-favoritos') || '[]');
    if (!Array.isArray(ids)) {
      return [];
    }
    return ids.map(Number).filter(Number.isSafeInteger);
  } catch {
    return [];
  }
}
export const favoritos = ref(lerFavoritos());
export function estaFavoritado(id) {
  return favoritos.value.includes(Number(id));
}
export function alternarFavorito(id) {
  const idLivro = Number(id);
  if (estaFavoritado(idLivro)) {
    favoritos.value = favoritos.value.filter((item) => item !== idLivro);
  } else {
    favoritos.value.push(idLivro);
  }
  try {
    localStorage.setItem('olympus-favoritos', JSON.stringify(favoritos.value));
  } catch {
    /* Mantém os favoritos na sessão. */
  }
}
