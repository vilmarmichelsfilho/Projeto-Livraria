// Somente dados e pequenas funções de texto compartilhadas pelas telas.
export const generos = [
  'Romance',
  'Terror',
  'Suspense',
  'Fantasia',
  'Distopia',
  'Poesia',
];

export function normalizarTexto(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function criarEndereco(titulo) {
  return normalizarTexto(titulo)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
