<!--
ROTEIRO DE IMPLEMENTAÇÃO — somente comentários; tela ainda não implementada.
Rota planejada: /admin/pedidos/:id/editar
Finalidade: Edição administrativa de pedidos.
1. Consultar GET /pedidos/:id e preencher o formulário.
2. Validar e enviar PATCH /pedidos/:id por pedidosService.
3. Tratar carregamento, 404, erro e sucesso; preservar campos preenchidos se a gravação falhar.
4. Integrar o CRUD completo de itens usando ItensPedidoForm e ItemPedidoDetalhes: listar, consultar item por ID, adicionar, alterar quantidade e excluir.
5. Conferir status RASCUNHO antes de alterar itens; recalcular total e combinar estoque ao confirmar ou cancelar.
Criar os blocos Vue necessários antes de importar este arquivo no router.
-->
