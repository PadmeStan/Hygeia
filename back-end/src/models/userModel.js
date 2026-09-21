const db = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {

  static async findByCpfOrEmail(cpf, email) {
    const [rows] = await db.execute(
      'SELECT id FROM usuarios WHERE cpf = ? OR email = ?',
      [cpf, email]
    );
    return rows[0] || null;
  }

  static async findByCpf(cpf) {
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE cpf = ?',
      [cpf]
    );
    return rows[0] || null;
  }

  static async create({ cpf, email, nome, data_nascimento, genero, sus, telefone, cep, cidade, bairro, rua, numero, senha }) {
    const hash = await bcrypt.hash(senha, 10);
    const [result] = await db.execute(
      `INSERT INTO usuarios
        (cpf, email, nome, data_nascimento, genero, sus, telefone, cep, cidade, bairro, rua, numero, senha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cpf, email, nome, data_nascimento, genero, sus, telefone, cep, cidade, bairro, rua, numero, hash]
    );
    return result.insertId;
  }

  static async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
}

module.exports = UserModel;
