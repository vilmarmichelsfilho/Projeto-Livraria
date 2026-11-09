# Plano da API da IFLibrary

Esta pasta adapta as dez seções do IFC Template Documentação API Médicos às quatro entidades da livraria. Os tipos referem-se aos valores usados no JSON, não a um esquema SQL.

## Escopo desta preparação

O JSON Server e os dados de teste ficarão funcionais. Os novos arquivos da aplicação contêm apenas comentários de orientação. As telas atuais continuam com sua implementação existente; o consumo da API, as validações e as mensagens ainda serão desenvolvidos pela equipe.

## Documentos

- [Usuários](usuarios.md)
- [Livros](livros.md)
- [Pedidos](pedidos.md)
- [Itens do pedido](itens_pedido.md)
- [Divisão dos CRUDs](responsabilidades.md)
- [Mapa dos arquivos e rotas](mapa-dos-arquivos.md)
- [Registro dos testes da API](testes-api.md)

## Relacionamentos

Usuários 1:N Pedidos, por pedidos.id_usuario → usuarios.id.

Pedidos 1:N Itens do pedido, por itens_pedido.id_pedido → pedidos.id.

Livros 1:N Itens do pedido, por itens_pedido.id_livro → livros.id.

Cada coleção usa id como PK para que os endpoints por ID funcionem no JSON Server. Autor e gênero continuam como atributos de livros. Favoritos permanecem como comportamento local da interface.

## Decisões do planejamento

- Livros preserva os campos endereco, resenha e capa já utilizados pelo catálogo. Isso evita exigir mudanças de nomes durante a primeira integração.
- Os marcadores de senha_hash são dados fictícios. A API de estudo não oferece autenticação, hash de senha, permissões ou transações.
- O carrinho será um pedido RASCUNHO. Os itens formam a coleção associativa itens_pedido.
- Somente rascunhos poderão ter itens alterados ou sofrer exclusão física na aplicação planejada. Confirmados serão preservados; cancelamentos seguirão as regras documentadas.
- Confirmação e cancelamento com alterações em várias coleções exigem tratamento pela aplicação. O JSON Server não torna essas requisições atômicas; transações reais dependem de um backend futuro.
- Os campos de data são preenchidos pela aplicação; o JSON Server não cria timestamps automaticamente.
- JSON puro não aceita comentários. A explicação de db.json fica neste documento e no mapa dos arquivos, sem adicionar uma quinta coleção de metadados.

## Atualização durante o desenvolvimento

Registrar nomes dos responsáveis, alterações de campos, método de atualização escolhido, validações implementadas, códigos observados e referências dos commits. Não marcar integração das telas como concluída somente porque os endpoints respondem.
