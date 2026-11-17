// Favoritos locais não criam uma quinta entidade.
import { ref } from 'vue';
function lerFavoritos() {
  try {
    const ids = JSON.parse(localStorage.getItem('olympus-favoritos') || '[]');
    return Array.isArray(ids)
      ? ids.map(Number).filter(Number.isSafeInteger)
      : [];
  } catch {
    return [];
  }
}
export const favoritos = ref(lerFavoritos());
export function estaFavoritado(id) {
  return favoritos.value.includes(Number(id));
}
export function alternarFavorito(id) {
  favoritos.value = estaFavoritado(id)
    ? favoritos.value.filter((item) => item !== Number(id))
    : [...favoritos.value, Number(id)];
  try {
    localStorage.setItem('olympus-favoritos', JSON.stringify(favoritos.value));
  } catch {
    /* Mantém os favoritos na sessão. */
  }
}
