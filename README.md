O que foi feito na versão 2.0 do Hygeia(na parte de programação):

- Criação da página de sobre nós
- redesign de cadastro/login
- integração com api de ceps
- integração com banco de dados de cadastro
- página de listagem de UBS

A entrega das tarefas de design estão na pasta de documentação, onde todos os arquivos estão inseridos.

* A home após login sofreu um atraso no design do canva, o que impossibilitou a codificação. Portanto, o processo após login do usuário será apresentado na próxima versão, e esta contará
  com apenas cadastro funcional.
* O projeto está organizado em back-end e front-end. O arquivo de banco de dados(database.sql) contém todas as informações sobre o sql. Na parte de "back-end > src > config > db.js" deve ser trocada a senha do banco de dados pela da própria máquina. A organização foi pensada a partir do modelo mvc.
* Para rodar o projeto, basta instalar o node e executar o comando "npm run dev". Assim poderá ser acessado tanto as páginas estáticas, quanto o cadastro com banco de dados.
