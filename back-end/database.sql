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

-- MEMBROS--

CREATE TABLE IF NOT EXISTS membros_familia (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  nome            VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  genero          ENUM('Feminino','Masculino','Outro'),
  cpf             VARCHAR(11),
  sus             VARCHAR(15),
  tipo            ENUM('Titular','Membro') DEFAULT 'Membro',
  criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- AGENDAMENTO DE CONSULTAS --

-- Especialidades médicas
CREATE TABLE IF NOT EXISTS especialidades (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL,
  icone VARCHAR(50)
);

INSERT INTO especialidades (nome, icone) VALUES
('Clínico Geral',    'fa-plus'),
('Dentista',         'fa-tooth'),
('Nutricionista',    'fa-apple-whole'),
('Ortopedista',      'fa-bone'),
('Ginecologista',    'fa-spa'),
('Obstetra',         'fa-user-nurse'),
('Dermatologista',   'fa-hand-dots'),
('Pediatra',         'fa-baby'),
('Geriatra',         'fa-person-cane'),
('Urologista',       'fa-mars'),
('Pneumologista',    'fa-lungs'),
('Otorrino',         'fa-ear-listen'),
('Psicólogo',        'fa-brain'),
('Psiquiatra',       'fa-comment-medical');

-- Adiciona colunas na tabela ubs para endereço e funcionamento
ALTER TABLE ubs
  ADD COLUMN endereco      VARCHAR(255) DEFAULT NULL,
  ADD COLUMN funcionamento VARCHAR(100) DEFAULT 'Seg a Sex, 08h-17h',
  ADD COLUMN latitude      DECIMAL(10,7) DEFAULT NULL,
  ADD COLUMN longitude     DECIMAL(10,7) DEFAULT NULL;

-- UBS fictícia para testes (id 1 = São José dos Índios, já existe)
UPDATE ubs SET
  endereco     = 'Vila São José, São José de Ribamar - MA, 65110-000',
  funcionamento = 'Seg a Sex, 07h–16h',
  latitude     = -2.5501,
  longitude    = -44.0581
WHERE id = 1;

UPDATE ubs SET
  endereco     = 'Parque Aracagy, São José de Ribamar - MA, 65110-000',
  funcionamento = 'Seg a Sex, 08h–17h'
WHERE id = 2;

UPDATE ubs SET
  endereco     = 'R. J.k - Mata, São José de Ribamar - MA, 65110-000',
  funcionamento = 'Seg a Sex, 08h–17h'
WHERE id = 13; -- pindaí

UPDATE ubs SET
  endereco     = 'Res. Turiúba, São José de Ribamar - MA, 65110-000',
  funcionamento = 'Seg a Sáb, 07h–15h'
WHERE id = 4;

-- Quais especialidades cada UBS atende
CREATE TABLE IF NOT EXISTS ubs_especialidades (
  ubs_id          INT NOT NULL,
  especialidade_id INT NOT NULL,
  PRIMARY KEY (ubs_id, especialidade_id),
  FOREIGN KEY (ubs_id)          REFERENCES ubs(id)           ON DELETE CASCADE,
  FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE CASCADE
);

-- Para teste: todas as especialidades nas 4 primeiras UBS
INSERT IGNORE INTO ubs_especialidades (ubs_id, especialidade_id)
SELECT u.id, e.id FROM ubs u, especialidades e WHERE u.id IN (1,2,4,13);

-- Horários disponíveis (gerados automaticamente para teste)
CREATE TABLE IF NOT EXISTS horarios (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  ubs_id           INT NOT NULL,
  especialidade_id INT NOT NULL,
  data             DATE NOT NULL,
  hora             TIME NOT NULL,
  disponivel       BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (ubs_id)          REFERENCES ubs(id)           ON DELETE CASCADE,
  FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE CASCADE
);

-- Consultas agendadas
CREATE TABLE IF NOT EXISTS consultas (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT NOT NULL,
  membro_id        INT,
  ubs_id           INT NOT NULL,
  especialidade_id INT NOT NULL,
  data             DATE NOT NULL,
  hora             TIME NOT NULL,
  status           ENUM('agendada','cancelada','concluida') DEFAULT 'agendada',
  criado_em        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id)       REFERENCES usuarios(id)          ON DELETE CASCADE,
  FOREIGN KEY (membro_id)        REFERENCES membros_familia(id)   ON DELETE SET NULL,
  FOREIGN KEY (ubs_id)           REFERENCES ubs(id),
  FOREIGN KEY (especialidade_id) REFERENCES especialidades(id)
);
