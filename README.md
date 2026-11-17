# Livraria

```sh
npm install
npm run dev:all
```

Frontend: http://localhost:5173. JSON Server: http://localhost:3000.
Para alterar a URL da API, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

O catálogo, os favoritos, as avaliações e o carrinho são carregados do JSON Server.
Os dados persistentes ficam em `db.json`; o estado reativo do Vue apenas exibe as respostas da API.
Não há persistência em localStorage, sessionStorage, IndexedDB ou cookies.

O carrinho usa `pedidos` com status `RASCUNHO` e os registros de `itens_pedido`.
O cliente de demonstração é o usuário 2 (Ana Exemplo), sem autenticação; seus favoritos
e carrinho são compartilhados entre navegadores. As avaliações mantêm uma entrada por livro.
Dados antigos que estavam apenas no navegador não são importados.

Os serviços de livros, usuários, pedidos e itens oferecem operações pela API.
As telas e formulários que ainda contêm roteiros são funcionalidades planejadas;
login e finalização de compra ainda não estão implementados.
JSON Server não oferece autenticação nem transações entre recursos.

Verificação: `npm run build`.
