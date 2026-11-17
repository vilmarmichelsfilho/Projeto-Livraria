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
O pedido guarda seus itens no campo `itens`. O carrinho da loja é temporário,
em memória, e é perdido ao recarregar a página. Favoritos usam `localStorage`.
O carrinho ainda não cria pedidos na API; o checkout está planejado e seu
botão permanece indisponível. Pedidos são gerenciados em `/admin/pedidos`.

A página de cada livro mostra as avaliações publicadas. Um cliente com
sessão ativa pode criar, editar e excluir a própria avaliação de um livro
ativo. A área `/admin/avaliacoes` permite consultar e excluir avaliações
de leitores. As regras de acesso são demonstradas no Vue com dados fictícios.
O JSON Server fornece as operações REST e não implementa essas regras no servidor.

Os quatro CRUDs usam GET da coleção, GET por ID, POST, PATCH e DELETE:

| Coleção    | Responsável           | Administração                              |
| ---------- | --------------------- | ------------------------------------------ |
| livros     | Igor Gabriel Decker   | `/admin/livros`                            |
| usuarios   | Vilmar Michels Filho  | `/admin/usuarios`                          |
| pedidos    | Davi Augusto Ramos    | `/admin/pedidos`                           |
| avaliacoes | Vitor Avanzi Lipinski | `/admin/avaliacoes` (consulta e moderação) |

Clientes criam e editam avaliações em `/livro/:endereco/avaliar`.
Os campos `id_usuario` e `id_livro` apontam para o campo `id` das coleções.
Os itens fazem parte de Pedidos e não formam uma quinta entidade.

A entrega usa apenas Vue e JSON Server, sem arquivo de servidor próprio.
Senhas são fictícias em texto; não há autenticação no servidor, banco SQL ou
transações. As alterações de estoque são requisições separadas com tentativa
de restauração se houver falha. Checkout do cliente, página de histórico
detalhado e painel de indicadores permanecem planejados.

Documentação técnica: [API e CRUDs](https://docs.google.com/document/d/1oVKP_sXycYOjsPQ1udo6uIYEdW3_ha6ldeap08c74gg/edit).
Os requisitos e as entidades foram alinhados à demonstração com JSON Server.

Consulte `README.txt` para o CRUD de livros e `README-conta.md` para as
contas de demonstração. Execute `npm run build` para gerar a versão de
produção e `node --test` para executar os testes do projeto.
