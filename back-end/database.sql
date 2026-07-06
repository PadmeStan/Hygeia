-- Execute no MySQL Workbench antes de rodar o servidor

CREATE DATABASE IF NOT EXISTS hygeia_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hygeia_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  cpf             VARCHAR(11)  NOT NULL UNIQUE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  nome            VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  genero          ENUM('male','female','other'),
  sus             VARCHAR(15),
  telefone        VARCHAR(15),
  cep             VARCHAR(8),
  cidade          VARCHAR(100),
  bairro          VARCHAR(100),
  rua             VARCHAR(255),
  numero          VARCHAR(20),
  senha           VARCHAR(255) NOT NULL,
  criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ubs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL
);

INSERT INTO ubs (nome) VALUES
('Unidade básica de são José dos índios'),
('Unidade básica de saúde do parque Aracagy'),
('Unidade básica Dr. Raimundo Balbino'),
('Unidade básica de saúde do turiúba'),
('Unidade básica da vila cafeteira'),
('Unidade básica de saúde nova aurora'),
('Unidade básica de saúde do nova terra'),
('Unidade básica de saúde do recanto verde'),
('Unidade básica de saúde da Sarney filho II'),
('Unidade básica de saúde do pitangueiras'),
('Unidade básica de saúde do são Raimundo'),
('Unidade básica de saúde do parque vitoria'),
('Unidade básica de saúde do pindaí'),
('Unidade básica de saúde do jardim tropical II'),
('Unidade básica da matinha'),
('Unidade básica de saúde do cohatrac V'),
('Unidade básica de saúde do parque jair'),
('Unidade básica alonso costa'),
('Unidade básica de saúde da vila operaria'),
('Unidade básica de saúde do jussatuba'),
('Unidade básica de saúde da mata (D. José F. Machado)'),
('Unidade básica de saúde da quinta'),
('Unidade básica de saúde trizidela da maioba'),
('Unidade básica de saúde da maiobinha'),
('Unidade básica de saúde Guarapiranga'),
('Unidade básica de saúde vila flamengo'),
('Unidade básica de saúde da vila são luis'),
('Unidade básica de saúde do bom jardim'),
('Unidade básica de saúde do panaquatira'),
('Unidade básica de saúde vila sarney filho'),
('Unidade básica de saúde do olho dagua'),
('Unidade básica de saúde do jardim tropical'),
('Unidade básica de saúde do sitio do apicum'),
('Unidade básica de saúde j lima'),
('Unidade básica de saúde do j camara'),
('Unidade básica de saúde dr Honório Ferreira Gomes'),
('Unidade básica de saúde vila kiola');
