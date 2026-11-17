<!--
ROTEIRO DE IMPLEMENTAÇÃO — somente comentários; tela ainda não implementada.
Rota planejada: /admin/pedidos/:id/editar
Finalidade: Edição administrativa de pedidos.
1. Consultar GET /pedidos/:id e preencher o formulário.
2. Validar e enviar PATCH /pedidos/:id com fetch na própria tela.
3. Tratar carregamento, 404, erro e sucesso; preservar campos preenchidos se a gravação falhar.
4. Usar ItensPedidoForm e ItemPedidoDetalhes para gerenciar a lista pedido.itens por id_livro e persistir com PATCH /pedidos/:id, sem endpoint separado de itens.
5. Conferir status RASCUNHO antes de alterar itens; recalcular total e combinar estoque ao confirmar ou cancelar.
Criar os blocos Vue necessários antes de importar este arquivo no router.
-->
