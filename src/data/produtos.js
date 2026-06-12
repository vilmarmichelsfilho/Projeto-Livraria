import { reactive } from 'vue'
const produtos = reactive([
  {
    id: 1,
    titulo: 'Clean Code',
    autor: 'Robert C. Martin',
    resenha:
      'Um livro sobre boas práticas de programação, escrita de código limpo e melhoria da qualidade de software.',
    preco: 129.9,
    capa: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    favorito: false,
  },
  {
    id: 2,
    titulo: 'The Pragmatic Programmer',
    autor: 'Andrew Hunt e David Thomas',
    resenha:
      'Uma obra clássica sobre postura profissional, organização e boas práticas no desenvolvimento de software.',
    preco: 149.9,
    capa: 'https://covers.openlibrary.org/b/isbn/9780201616224-L.jpg',
    favorito: false,
  },
  {
    id: 3,
    titulo: 'Eloquent JavaScript',
    autor: 'Marijn Haverbeke',
    resenha:
      'Uma introdução prática à linguagem JavaScript, com exemplos e conceitos fundamentais para desenvolvimento web.',
    preco: 89.9,
    capa: 'https://covers.openlibrary.org/b/isbn/9781593279509-L.jpg',
    favorito: false,
  },
  {
    id: 4,
    titulo: "You Don't Know JS Yet",
    autor: 'Kyle Simpson',
    resenha: 'Livro voltado ao aprofundamento dos principais conceitos da linguagem JavaScript.',
    preco: 79.9,
    capa: 'https://m.media-amazon.com/images/I/71GsZGf3opL._SL1500_.jpg',
    favorito: false,
  },
  {
    id: 5,
    titulo: 'Design Patterns',
    autor: 'Erich Gamma, Richard Helm, Ralph Johnson e John Vlissides',
    resenha:
      'Livro clássico sobre padrões de projeto e soluções reutilizáveis para problemas comuns de software.',
    preco: 159.9,
    capa: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg',
    favorito: false,
  },
  {
    id: 6,
    titulo: 'Introduction to Algorithms',
    autor: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest e Clifford Stein',
    resenha: 'Referência ampla sobre algoritmos, estruturas de dados e análise de complexidade.',
    preco: 199.9,
    capa: 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg',
    favorito: false,
  },
  {
    id: 7,
    titulo: 'Refactoring',
    autor: 'Martin Fowler',
    resenha:
      'Apresenta técnicas para melhorar a estrutura interna do código sem alterar seu comportamento externo.',
    preco: 139.9,
    capa: 'https://covers.openlibrary.org/b/isbn/9780134757599-L.jpg',
    favorito: false,
  },
  {
    id: 8,
    titulo: 'HTML and CSS',
    autor: 'Jon Duckett',
    resenha: 'Livro introdutório e visual sobre construção de páginas web com HTML e CSS.',
    preco: 99.9,
    capa: 'https://covers.openlibrary.org/b/isbn/9781118008188-L.jpg',
    favorito: false,
  },
])
export {produtos}
