const ConsultaModel = require('../models/consultaModel');
const MembroModel   = require('../models/membroModel');

class ConsultaController {

  // GET /api/consultas/membros
  // Retorna membros da família para o modal
  static async listarMembros(req, res) {
  try {
    const usuarioId = req.session.usuario.id;

    // Busca dados do próprio usuário
    const db = require('../config/db');
    const [rows] = await db.execute(
      'SELECT id, nome FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    const titular = rows[0]
      ? [{ id: `u_${rows[0].id}`, nome: rows[0].nome, tipo: 'Titular' }]
      : [];

    // Busca membros da família
    const membros = await MembroModel.findByUsuario(usuarioId);
    const familia = membros.map(m => ({ ...m, tipo: m.tipo || 'Membro' }));

    return res.status(200).json([...titular, ...familia]);

  } catch (err) {
    console.error('[consultas/membros]', err);
    return res.status(500).json({ erro: 'Erro ao buscar membros.' });
  }
}

  // GET /api/consultas/ubs?especialidade_id=1
  static async listarUbs(req, res) {
    try {
      const { especialidade_id } = req.query;
      if (!especialidade_id) {
        return res.status(400).json({ erro: 'especialidade_id é obrigatório.' });
      }
      const ubs = await ConsultaModel.ubsPorEspecialidade(especialidade_id);
      return res.status(200).json(ubs);
    } catch (err) {
      console.error('[consultas/ubs]', err);
      return res.status(500).json({ erro: 'Erro ao buscar UBS.' });
    }
  }

  // GET /api/consultas/horarios?ubs_id=1&especialidade_id=1&data=2026-08-25
  static async listarHorarios(req, res) {
    try {
      const { ubs_id, especialidade_id, data } = req.query;
      if (!ubs_id || !especialidade_id || !data) {
        return res.status(400).json({ erro: 'ubs_id, especialidade_id e data são obrigatórios.' });
      }
      const horarios = await ConsultaModel.horariosDisponiveis(ubs_id, especialidade_id, data);
      return res.status(200).json(horarios);
    } catch (err) {
      console.error('[consultas/horarios]', err);
      return res.status(500).json({ erro: 'Erro ao buscar horários.' });
    }
  }

  // POST /api/consultas
  static async agendar(req, res) {
  try {
    const usuarioId = req.session.usuario.id;
    const { membro_id, ubs_id, especialidade_id, data, hora } = req.body;

    if (!ubs_id || !especialidade_id || !data || !hora) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    }

    // Se membro_id começa com 'u_' é o titular — salva como null
    const membroIdFinal = (!membro_id || String(membro_id).startsWith('u_'))
      ? null
      : membro_id;

    const id = await ConsultaModel.criar({
      usuarioId,
      membroId: membroIdFinal,
      ubsId: ubs_id,
      especialidadeId: especialidade_id,
      data,
      hora,
    });

    return res.status(201).json({ sucesso: true, id });

  } catch (err) {
    if (err.message === 'HORARIO_INDISPONIVEL') {
      return res.status(409).json({ erro: 'Este horário não está mais disponível. Escolha outro.' });
    }
    console.error('[consultas/agendar]', err);
    return res.status(500).json({ erro: 'Erro ao realizar agendamento.' });
  }
}

  // GET /api/consultas
  static async listar(req, res) {
    try {
      const usuarioId = req.session.usuario.id;
      const consultas = await ConsultaModel.porUsuario(usuarioId);
      return res.status(200).json(consultas);
    } catch (err) {
      console.error('[consultas/listar]', err);
      return res.status(500).json({ erro: 'Erro ao buscar consultas.' });
    }
  }

  // DELETE /api/consultas/:id
  static async cancelar(req, res) {
    try {
      const usuarioId = req.session.usuario.id;
      const { id } = req.params;
      const afetados = await ConsultaModel.cancelar(id, usuarioId);
      if (!afetados) {
        return res.status(404).json({ erro: 'Consulta não encontrada ou já cancelada.' });
      }
      return res.status(200).json({ sucesso: true });
    } catch (err) {
      console.error('[consultas/cancelar]', err);
      return res.status(500).json({ erro: 'Erro ao cancelar consulta.' });
    }
  }
}

module.exports = ConsultaController;