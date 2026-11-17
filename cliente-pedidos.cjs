// Operações do cliente: a sessão define o proprietário e os valores vêm do catálogo.
module.exports = function registrarPedidosCliente(app, db) {
  const base = '/cliente/pedidos';
  const falhar = (res, status, message) => res.status(status).json({ message });
  const obter = (req, res) => {
    const pedido = db
      .get('pedidos')
      .find(
        (p) =>
          String(p.id) === req.params.id &&
          String(p.id_usuario) === String(req.user.id),
      )
      .value();
    if (!pedido) falhar(res, 404, 'Pedido não encontrado.');
    return pedido;
  };
  const endereco = (usuario) =>
    [usuario.endereco, usuario.cidade, usuario.uf, usuario.cep]
      .filter(Boolean)
      .join(' • ');
  const calcular = (itens) =>
    itens.reduce(
      (soma, item) =>
        soma + Math.round(Number(item.preco_unitario) * 100) * item.quantidade,
      0,
    ) / 100;
  function itensAtuais(entrada) {
    if (!Array.isArray(entrada) || !entrada.length)
      throw new Error('Adicione pelo menos um livro ao pedido.');
    const vistos = new Set();
    return entrada.map((item) => {
      const livro = db
        .get('livros')
        .find((l) => String(l.id) === String(item.id_livro))
        .value();
      if (!livro || !livro.ativo)
        throw new Error(
          'Um dos livros não está mais disponível. Revise o carrinho.',
        );
      if (
        !Number.isSafeInteger(item.quantidade) ||
        item.quantidade < 1 ||
        item.quantidade > livro.estoque
      )
        throw new Error(
          `Quantidade indisponível para ${livro.titulo}. Revise o carrinho.`,
        );
      if (vistos.has(String(livro.id)))
        throw new Error('Um livro não pode aparecer duas vezes no pedido.');
      vistos.add(String(livro.id));
      return {
        id_livro: livro.id,
        titulo_livro: livro.titulo,
        autor: livro.autor,
        capa: livro.capa_url || livro.capa,
        quantidade: item.quantidade,
        preco_unitario: Number(livro.preco).toFixed(2),
      };
    });
  }
  app.get(base, (req, res) =>
    res.json(
      db
        .get('pedidos')
        .filter((p) => String(p.id_usuario) === String(req.user.id))
        .value(),
    ),
  );
  app.get(base + '/:id', (req, res) => {
    const pedido = obter(req, res);
    if (pedido) res.json(pedido);
  });
  app.post(base, (req, res) => {
    try {
      const itens = itensAtuais(req.body.itens),
        agora = new Date().toISOString();
      const pedido = {
        id:
          Math.max(
            0,
            ...db
              .get('pedidos')
              .value()
              .map((p) => Number(p.id) || 0),
          ) + 1,
        id_usuario: req.user.id,
        status: 'RASCUNHO',
        itens,
        total: calcular(itens),
        destinatario: req.user.nome,
        endereco_entrega: endereco(req.user),
        criado_em: agora,
        atualizado_em: agora,
        confirmado_em: null,
        cancelado_em: null,
        motivo_cancelamento: null,
      };
      db.get('pedidos').push(pedido).write();
      res.status(201).json(pedido);
    } catch (error) {
      falhar(res, 422, error.message);
    }
  });
  app.patch(base + '/:id', (req, res) => {
    const pedido = obter(req, res);
    if (!pedido) return;
    if (pedido.status !== 'RASCUNHO')
      return falhar(res, 409, 'Somente rascunhos podem ser editados.');
    try {
      const itens = itensAtuais(req.body.itens ?? pedido.itens);
      res.json(
        db
          .get('pedidos')
          .find({ id: pedido.id })
          .assign({
            itens,
            total: calcular(itens),
            destinatario: req.user.nome,
            endereco_entrega: endereco(req.user),
            atualizado_em: new Date().toISOString(),
          })
          .write(),
      );
    } catch (error) {
      falhar(res, 422, error.message);
    }
  });
  app.post(base + '/:id/confirmar', (req, res) => {
    const pedido = obter(req, res);
    if (!pedido) return;
    if (pedido.status !== 'RASCUNHO')
      return falhar(
        res,
        409,
        'Este pedido já foi processado. Consulte seus pedidos.',
      );
    if (
      ![
        req.user.nome,
        req.user.endereco,
        req.user.cidade,
        req.user.uf,
        req.user.cep,
      ].every((valor) => String(valor || '').trim())
    )
      return falhar(
        res,
        422,
        'Complete o endereço da sua conta antes de confirmar.',
      );
    try {
      const itens = itensAtuais(pedido.itens),
        total = calcular(itens);
      if (Math.round(Number(req.body.total) * 100) !== Math.round(total * 100))
        return falhar(
          res,
          409,
          'O preço mudou. Atualize a revisão e confira o novo total antes de confirmar.',
        );
      // Uma gravação contém o pedido e o estoque, evitando confirmação parcial.
      const estado = structuredClone(db.getState());
      for (const item of itens)
        estado.livros.find(
          (l) => String(l.id) === String(item.id_livro),
        ).estoque -= item.quantidade;
      const atualizado = estado.pedidos.find((p) => p.id === pedido.id),
        agora = new Date().toISOString();
      Object.assign(atualizado, {
        itens,
        total,
        destinatario: req.user.nome,
        endereco_entrega: endereco(req.user),
        status: 'RECEBIDO',
        confirmado_em: agora,
        atualizado_em: agora,
      });
      db.setState(estado).write();
      res.json(atualizado);
    } catch (error) {
      falhar(res, 422, error.message);
    }
  });
  app.post(base + '/:id/cancelar', (req, res) => {
    const pedido = obter(req, res);
    if (!pedido) return;
    if (pedido.status !== 'RECEBIDO')
      return falhar(
        res,
        409,
        'O cancelamento só está disponível enquanto o pedido estiver recebido.',
      );
    const estado = structuredClone(db.getState());
    for (const item of pedido.itens || []) {
      const livro = estado.livros.find(
        (l) => String(l.id) === String(item.id_livro),
      );
      if (!livro)
        return falhar(
          res,
          409,
          'Não foi possível devolver um livro ao estoque. Entre em contato com a loja.',
        );
      livro.estoque += item.quantidade;
    }
    const atualizado = estado.pedidos.find((p) => p.id === pedido.id),
      agora = new Date().toISOString();
    Object.assign(atualizado, {
      status: 'CANCELADO',
      cancelado_em: agora,
      atualizado_em: agora,
      motivo_cancelamento: 'Cancelado pelo cliente.',
    });
    db.setState(estado).write();
    res.json(atualizado);
  });
  app.delete(base + '/:id', (req, res) => {
    const pedido = obter(req, res);
    if (!pedido) return;
    if (pedido.status !== 'RASCUNHO')
      return falhar(
        res,
        409,
        'Somente pedidos em rascunho podem ser excluídos.',
      );
    db.get('pedidos').remove({ id: pedido.id }).write();
    res.sendStatus(204);
  });
};
