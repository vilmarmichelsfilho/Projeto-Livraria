# IFLibrary

Projeto de livraria da equipe de Igor Gabriel Decker, Vitor Avanzi Lipinski,
Vilmar Michels Filho e Davi Augusto Ramos.

```sh
npm install
npm run dev:all
```

Abra http://localhost:5173. O JSON Server usa o arquivo `db.json` e roda em
http://localhost:3000. Para mudar a URL da API, copie `.env.example` para
`.env` e ajuste `VITE_API_URL`.

As coleções do projeto são `livros`, `usuarios`, `pedidos` e `avaliacoes`.
O pedido guarda seus itens no campo `itens`. O carrinho e os favoritos da
loja usam armazenamento local.

A página de cada livro mostra as avaliações publicadas. Um cliente com
sessão ativa pode criar, editar e excluir a própria avaliação de um livro
ativo. A área `/admin/avaliacoes` permite consultar e excluir avaliações
de leitores. As regras de acesso são demonstradas no Vue com dados fictícios.
O JSON Server fornece as operações REST e não implementa essas regras no servidor.

Consulte `README.txt` para o CRUD de livros e `README-conta.md` para as
contas de demonstração. Execute `npm run build` para gerar a versão de
produção e `node --test` para executar os testes do projeto.
