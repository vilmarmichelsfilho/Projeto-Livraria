# IFLibrary

Livraria do Hackathon desenvolvida com Vue, Vue Router e Vite. Esta etapa prepara o consumo de uma API REST simulada com JSON Server, conforme o trabalho de Desenvolvimento Web 2.

## O que está pronto nesta preparação

- Quatro coleções no db.json, com IDs, relacionamentos e dados fictícios para teste.
- JSON Server 0.17.4 instalado como dependência de desenvolvimento e fixado nessa versão.
- Axios instalado para o futuro consumo da API.
- Comandos para iniciar a aplicação, a API ou os dois juntos.
- Arquivos das telas, serviços, formulários e mensagens, contendo apenas comentários explicativos.
- Documentação técnica por entidade, seguindo as dez seções do modelo fornecido pelo professor.

O CRUD das telas ainda não foi implementado. A navegação e as funcionalidades existentes continuam usando os dados locais de antes. Os arquivos novos são roteiros para a equipe desenvolver e não estão ligados ao router.

## Organização das pastas

- src/views: todas as telas; o prefixo Admin identifica as telas administrativas.
- src/components: componentes e formulários; os novos arquivos ficam diretamente nesta pasta.
- src/services: conexão com a API e operações das quatro entidades.
- src/utils: funções auxiliares e orientações para estados das requisições.
- src/router: rotas da aplicação.
- src/data e src/assets: dados locais e recursos visuais já existentes.
- docs: documentação técnica, responsabilidades, mapa dos arquivos e testes.
- db.json e package.json: dados da API e comandos, na raiz do projeto.

## Instalar e executar

Usar uma versão do Node compatível com package.json: Node 20.19 ou superior da linha 20, ou Node 22.12 ou superior. Node 24 também atende ao requisito.

1. Abrir um terminal na raiz do repositório e executar `npm install`.
2. Executar `npm run api` para iniciar a API em http://localhost:3000.
3. Em outro terminal, executar `npm run dev` para iniciar o frontend em http://localhost:5173.
4. Como alternativa, executar `npm run dev:all` para iniciar os dois processos juntos.
5. Usar Ctrl+C para encerrar o processo no terminal.

O comando `npm run build` verifica e gera a versão de produção da aplicação atual. `npm run preview` permite visualizar essa versão localmente. Os arquivos Vue que contêm apenas comentários devem ganhar seus blocos de implementação antes de serem importados e registrados como rotas.

O GitHub Pages hospeda os arquivos estáticos do frontend; ele não executa o JSON Server. Para demonstrar esta etapa localmente, manter a API em execução no terminal.

## Entidades e endpoints

URL base da API: http://localhost:3000.

| Entidade | Finalidade | Listagem e cadastro | Consulta, edição e exclusão |
| --- | --- | --- | --- |
| usuarios | Clientes e administradores | /usuarios | /usuarios/:id |
| livros | Catálogo, preço e estoque | /livros | /livros/:id |
| pedidos | Carrinho em rascunho e compras simuladas | /pedidos | /pedidos/:id |
| itens_pedido | Livros e quantidades de cada pedido | /itens_pedido | /itens_pedido/:id |

GET na coleção lista registros; GET com ID consulta um registro; POST cadastra; PATCH atualiza campos enviados; PUT substitui os campos editáveis; DELETE exclui. A versão fixada evita misturar os comandos e convenções da versão beta 1.x com os exemplos desta etapa. Documentação da versão: https://github.com/typicode/json-server/blob/v0.17.4/README.md.

Em POST, PUT e PATCH, enviar Content-Type: application/json. Não copiar um ID fixo para cadastrar um novo registro. As alterações feitas pela API persistem em db.json; use registros fictícios e confira os dados antes da apresentação.

## Identificadores e relacionamentos

Cada coleção usa o campo id como chave primária (PK), reconhecida pelo JSON Server. Os dados iniciais usam números inteiros. Nos novos cadastros, deixar a API gerar o ID.

| Relacionamento | Chave estrangeira (FK) |
| --- | --- |
| Usuários 1:N Pedidos | pedidos.id_usuario → usuarios.id |
| Pedidos 1:N Itens do pedido | itens_pedido.id_pedido → pedidos.id |
| Livros 1:N Itens do pedido | itens_pedido.id_livro → livros.id |

Para consultar vínculos, usar filtros como /pedidos?id_usuario=2, /itens_pedido?id_pedido=1 e /itens_pedido?id_livro=1. As FKs usam nomes explícitos; a equipe não deve presumir que _embed ou _expand reconhecerá esses nomes automaticamente.

Autor e gênero são campos de livros. Favoritos continuam locais. O carrinho é modelado por um pedido com status RASCUNHO e pelos respectivos itens. O estoque no seed é o saldo de exemplo atual; iniciar a API não deve provocar nova baixa.

## Validações e comportamento a implementar

- Campos obrigatórios, e-mail único, IDs válidos, preço positivo e estoque não negativo.
- Verificação de usuário, pedido e livro existentes antes de salvar relacionamentos.
- Itens com quantidade positiva e sem duplicar o livro dentro do mesmo pedido.
- Edição e exclusão de itens somente em RASCUNHO; total recalculado após cada alteração.
- Confirmação antes de excluir. Cancelar a confirmação não envia DELETE.
- Carregamento, lista vazia, sucesso após a resposta, erro e tratamento de ID inexistente.
- Preservação do histórico: pedidos confirmados não devem ser apagados pela interface planejada; usuários e livros com histórico devem ser inativados.

Essas regras não são executadas automaticamente pelo JSON Server. O mock também não oferece autenticação, autorização ou transações entre coleções. Os valores de senha_hash são marcadores fictícios, não credenciais de acesso. Uma autenticação demonstrativa e as regras de estoque ainda precisam ser planejadas e implementadas pela equipe.

## Responsáveis pelos CRUDs completos

| Integrante | Nome a preencher | CRUD completo |
| --- | --- | --- |
| 1 | [Nome completo] | Usuários |
| 2 | [Nome completo] | Livros |
| 3 | [Nome completo] | Pedidos |
| 4 | [Nome completo] | Itens do pedido |
| 5 e 6, se houver | [Nomes completos] | Recurso a combinar com o professor |

Cada responsável deve listar, consultar por ID, cadastrar, atualizar e excluir, integrando o fluxo completo às telas. Como existem quatro entidades e o enunciado menciona equipes de cinco a seis integrantes, a divisão adicional permanece pendente de orientação do professor. Não dividir o trabalho deixando cada pessoa com apenas um método HTTP.

Todos devem fazer seus próprios commits e demonstrar o caminho entre formulário, requisição, API e atualização da tela. Não há commits atribuídos automaticamente aos integrantes nesta preparação.

## Documentação e próximos passos

- [Plano da API e decisões](docs/api.md).
- [Documento de usuários](docs/usuarios.md).
- [Documento de livros](docs/livros.md).
- [Documento de pedidos](docs/pedidos.md).
- [Documento de itens do pedido](docs/itens_pedido.md).
- [Divisão das responsabilidades](docs/responsabilidades.md).
- [Mapa das telas, rotas e arquivos](docs/mapa-dos-arquivos.md).
- [Códigos de resposta realmente observados](docs/testes-api.md).

Preencher os nomes, implementar cada roteiro comentado, registrar as rotas somente quando as telas estiverem prontas e atualizar os documentos com os testes e alterações do planejamento. Os testes de infraestrutura da API não substituem a demonstração individual do CRUD nas telas.
