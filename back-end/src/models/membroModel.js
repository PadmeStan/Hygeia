const db = require('../config/db');

class MembroModel {

  // Lista todos os membros do usuário logado
  static async findByUsuario(usuarioId) {
    const [rows] = await db.execute(
      'SELECT * FROM membros_familia WHERE usuario_id = ? ORDER BY tipo DESC, criado_em ASC',
      [usuarioId]
    );
    return rows;
  }

  // Cria um novo membro
  static async create({ usuarioId, nome, data_nascimento, genero, cpf, sus, tipo }) {
    // Converte data DD/MM/AAAA -> AAAA-MM-DD se necessário
    let dataNasc = data_nascimento || null;
    if (dataNasc && dataNasc.includes('/')) {
      const [d, m, y] = dataNasc.split('/');
      dataNasc = `${y}-${m}-${d}`;
    }

    const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : null;
    const susLimpo = sus ? sus.replace(/\D/g, '') : null;

    const [result] = await db.execute(
      `INSERT INTO membros_familia (usuario_id, nome, data_nascimento, genero, cpf, sus, tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, nome, dataNasc, genero || null, cpfLimpo, susLimpo, tipo || 'Membro']
    );
    return result.insertId;
  }

  // Atualiza um membro (verificando que pertence ao usuário)
  static async update(id, usuarioId, { nome, data_nascimento, genero, cpf, sus }) {
    let dataNasc = data_nascimento || null;
    if (dataNasc && dataNasc.includes('/')) {
      const [d, m, y] = dataNasc.split('/');
      dataNasc = `${y}-${m}-${d}`;
    }

    const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : null;
    const susLimpo = sus ? sus.replace(/\D/g, '') : null;

    const [result] = await db.execute(
      `UPDATE membros_familia
       SET nome=?, data_nascimento=?, genero=?, cpf=?, sus=?
       WHERE id=? AND usuario_id=?`,
      [nome, dataNasc, genero || null, cpfLimpo, susLimpo, id, usuarioId]
    );
    return result.affectedRows;
  }

  // Exclui um membro (verificando que pertence ao usuário)
  static async delete(id, usuarioId) {
    const [result] = await db.execute(
      'DELETE FROM membros_familia WHERE id=? AND usuario_id=?',
      [id, usuarioId]
    );
    return result.affectedRows;
  }
}

module.exports = MembroModel;