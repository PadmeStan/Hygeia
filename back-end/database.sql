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
