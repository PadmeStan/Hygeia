const db = require('../config/db');

class ConsultaModel {

  // Lista UBS que atendem uma especialidade
  static async ubsPorEspecialidade(especialidadeId) {
    const [rows] = await db.execute(
      `SELECT u.id, u.nome, u.endereco, u.funcionamento, u.latitude, u.longitude
       FROM ubs u
       INNER JOIN ubs_especialidades ue ON ue.ubs_id = u.id
       WHERE ue.especialidade_id = ?
       ORDER BY u.nome`,
      [especialidadeId]
    );
    return rows;
  }

  // Horários disponíveis de uma UBS/especialidade em uma data
  static async horariosDisponiveis(ubsId, especialidadeId, data) {
    // Horários fixos por UBS — em produção viriam do banco
    const horariosPadrao = ['07:00','08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'];

    // Busca horários já ocupados nessa data
    const [ocupados] = await db.execute(
      `SELECT hora FROM consultas
       WHERE ubs_id = ? AND especialidade_id = ? AND data = ? AND status != 'cancelada'`,
      [ubsId, especialidadeId, data]
    );

    const horasOcupadas = ocupados.map(r => r.hora.substring(0, 5));
    return horariosPadrao.filter(h => !horasOcupadas.includes(h));
  }

  // Cria um agendamento
  static async criar({ usuarioId, membroId, ubsId, especialidadeId, data, hora }) {
    // Verifica se horário ainda está disponível
    const [conflito] = await db.execute(
      `SELECT id FROM consultas
       WHERE ubs_id = ? AND especialidade_id = ? AND data = ? AND hora = ? AND status != 'cancelada'`,
      [ubsId, especialidadeId, data, hora]
    );

    if (conflito.length > 0) {
      throw new Error('HORARIO_INDISPONIVEL');
    }

    const [result] = await db.execute(
      `INSERT INTO consultas (usuario_id, membro_id, ubs_id, especialidade_id, data, hora)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuarioId, membroId || null, ubsId, especialidadeId, data, hora]
    );

    return result.insertId;
  }

  // Lista consultas do usuário
  static async porUsuario(usuarioId) {
    const [rows] = await db.execute(
      `SELECT c.id, c.data, c.hora, c.status,
              u.nome AS ubs_nome,
              e.nome AS especialidade_nome,
              m.nome AS membro_nome
       FROM consultas c
       INNER JOIN ubs u           ON u.id = c.ubs_id
       INNER JOIN especialidades e ON e.id = c.especialidade_id
       LEFT  JOIN membros_familia m ON m.id = c.membro_id
       WHERE c.usuario_id = ?
       ORDER BY c.data DESC, c.hora DESC`,
      [usuarioId]
    );
    return rows;
  }

  // Cancela uma consulta
  static async cancelar(id, usuarioId) {
    const [result] = await db.execute(
      `UPDATE consultas SET status = 'cancelada'
       WHERE id = ? AND usuario_id = ? AND status = 'agendada'`,
      [id, usuarioId]
    );
    return result.affectedRows;
  }
}

module.exports = ConsultaModel;