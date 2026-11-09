# Mapa dos arquivos

Os arquivos novos de telas, componentes, serviços e utilitários são roteiros escritos apenas em comentários. Não estão importados no router nem implementam requisições ou CRUD. Antes de importá-los, a equipe deve criar os blocos Vue e as funções necessárias.

## Organização simples

As telas ficam diretamente em src/views. Os arquivos com prefixo Admin pertencem à administração. Os componentes novos ficam diretamente em src/components; as pastas dos componentes já existentes foram mantidas. Serviços ficam em src/services, funções auxiliares em src/utils e documentos em docs. Não é necessário criar subpastas por tela ou por entidade.

## Configuração e documentação

| Arquivo | Finalidade |
| --- | --- |
| db.json | Quatro coleções com registros de teste, IDs e FKs; sem comentários porque o formato JSON não aceita. |
| package.json | Dependências e comandos dev, api e dev:all. |
| package-lock.json | Versões resolvidas das dependências. |
| README.md | Instalação, execução, endpoints e situação do trabalho. |
| docs/api.md | Planejamento e relacionamentos. |
| docs/usuarios.md | Documento técnico de usuários, seguindo as dez seções do modelo. |
| docs/livros.md | Documento técnico de livros. |
| docs/pedidos.md | Documento técnico de pedidos. |
| docs/itens_pedido.md | Documento técnico da entidade associativa. |
| docs/responsabilidades.md | Responsáveis e pendência da divisão para cinco ou seis integrantes. |
| docs/testes-api.md | Códigos observados nos testes da API e limites do que foi verificado. |

## Telas planejadas

| Arquivo | Rota futura | Finalidade |
| --- | --- | --- |
| src/views/LoginView.vue | /entrar | Entrada demonstrativa do cliente ou administrador. |
| src/views/CadastroView.vue | /cadastro | Cadastro público de cliente. |
| src/views/MinhaContaView.vue | /minha-conta | Consulta dos próprios dados. |
| src/views/EditarDadosView.vue | /minha-conta/editar | Edição dos dados e endereço. |
| src/views/AlterarSenhaView.vue | /minha-conta/senha | Planejamento da alteração de senha. |
| src/views/MeusPedidosView.vue | /meus-pedidos | Histórico do cliente. |
| src/views/DetalhesPedidoView.vue | /meus-pedidos/:id | Consulta detalhada de um pedido do cliente. |
| src/views/RevisarPedidoView.vue | /checkout/revisao | Revisão antes da compra simulada. |
| src/views/PedidoConfirmadoView.vue | /checkout/confirmado/:id | Confirmação da compra simulada. |
| src/views/AdminDashboardView.vue | /admin | Resumo administrativo. |
| src/views/AdminListarLivrosView.vue | /admin/livros | Listagem administrativa de livros. |
| src/views/AdminCadastrarLivroView.vue | /admin/livros/novo | Cadastro administrativo de livros. |
| src/views/AdminEditarLivroView.vue | /admin/livros/:id/editar | Edição administrativa de livros. |
| src/views/AdminDetalhesLivroView.vue | /admin/livros/:id | Consulta administrativa por ID de livros. |
| src/views/AdminListarUsuariosView.vue | /admin/usuarios | Listagem administrativa de usuarios. |
| src/views/AdminCadastrarUsuarioView.vue | /admin/usuarios/novo | Cadastro administrativo de usuarios. |
| src/views/AdminEditarUsuarioView.vue | /admin/usuarios/:id/editar | Edição administrativa de usuarios. |
| src/views/AdminDetalhesUsuarioView.vue | /admin/usuarios/:id | Consulta administrativa por ID de usuarios. |
| src/views/AdminListarPedidosView.vue | /admin/pedidos | Listagem administrativa de pedidos. |
| src/views/AdminCriarPedidoView.vue | /admin/pedidos/novo | Cadastro administrativo de pedidos. |
| src/views/AdminEditarPedidoView.vue | /admin/pedidos/:id/editar | Edição administrativa de pedidos. |
| src/views/AdminDetalhesPedidoView.vue | /admin/pedidos/:id | Consulta administrativa por ID de pedidos. |

As cinco telas atuais continuam em src/views: HomeView, LivrosPorGenero, DetalhesLivros, CarrinhoView e FavoritosView. Seus comentários indicam a migração para a API. A consulta individual de itens ocorrerá no componente de detalhes do item dentro do pedido, sem criar uma nova página.

## Serviços e comportamento compartilhado

- src/services/api.js: cliente HTTP com Axios e URL base.
- src/services/usuariosService.js: cinco operações do CRUD de usuários.
- src/services/livrosService.js: cinco operações do CRUD de livros.
- src/services/pedidosService.js: cinco operações do CRUD de pedidos e regras de andamento.
- src/services/itensPedidoService.js: cinco operações do CRUD da entidade associativa.
- src/utils/useCrud.js: estados de requisição e atualização da lista.
- src/utils/validacoes.js: validações comuns.
- src/components/UsuariosForm.vue, LivrosForm.vue, PedidosForm.vue e ItensPedidoForm.vue: formulários das quatro entidades.
- src/components/ItemPedidoDetalhes.vue: consulta por ID de um item.
- src/components/EstadoRequisicao.vue e ConfirmacaoExclusao.vue: mensagens e confirmação de exclusão.

## Ordem sugerida para a equipe

1. Preencher os responsáveis e combinar a divisão adicional com o professor.
2. Conferir os campos e iniciar a API.
3. Implementar api.js e os cinco métodos de cada serviço.
4. Implementar os formulários e telas da entidade, com todos os estados e confirmações.
5. Registrar as rotas somente depois de implementar os arquivos Vue.
6. Integrar catálogo, carrinho e checkout, preservando os relacionamentos.
7. Executar os testes individuais, atualizar a documentação e fazer commits próprios.
