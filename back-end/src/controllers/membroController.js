const MembroModel = require('../models/membroModel');

class MembroController {

  static async listar(req, res) {
    try {
      const usuarioId = req.session.usuario.id;
      const membros = await MembroModel.findByUsuario(usuarioId);
      const formatados = membros.map(m => ({
        ...m,
        data_nascimento: m.data_nascimento
          ? new Date(m.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
          : null,
        cpf: m.cpf ? m.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : null,
        sus: m.sus ? m.sus.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4') : null,
      }));
      return res.status(200).json(formatados);
    } catch (err) {
      console.error('[membros/listar]', err);
      return res.status(500).json({ erro: 'Erro ao buscar membros.' });
    }
  }

  static async criar(req, res) {
    try {
      const usuarioId = req.session.usuario.id;
      const { nome, data_nascimento, genero, cpf, sus, tipo } = req.body;
      if (!nome) return res.status(400).json({ erro: 'O nome e obrigatorio.' });
      const id = await MembroModel.create({ usuarioId, nome, data_nascimento, genero, cpf, sus, tipo });
      return res.status(201).json({ sucesso: true, id });
    } catch (err) {
      console.error('[membros/criar]', err);
      return res.status(500).json({ erro: 'Erro ao adicionar membro.' });
    }
  }

  static async atualizar(req, res) {
    try {
      const usuarioId = req.session.usuario.id;
      const { id } = req.params;
      const { nome, data_nascimento, genero, cpf, sus } = req.body;
      if (!nome) return res.status(400).json({ erro: 'O nome e obrigatorio.' });
      const afetados = await MembroModel.update(id, usuarioId, { nome, data_nascimento, genero, cpf, sus });
      if (!afetados) return res.status(404).json({ erro: 'Membro nao encontrado.' });
      return res.status(200).json({ sucesso: true });
    } catch (err) {
      console.error('[membros/atualizar]', err);
      return res.status(500).json({ erro: 'Erro ao atualizar membro.' });
    }
  }

  static async excluir(req, res) {
    try {
      const usuarioId = req.session.usuario.id;
      const { id } = req.params;
      const afetados = await MembroModel.delete(id, usuarioId);
      if (!afetados) return res.status(404).json({ erro: 'Membro nao encontrado.' });
      return res.status(200).json({ sucesso: true });
    } catch (err) {
      console.error('[membros/excluir]', err);
      return res.status(500).json({ erro: 'Erro ao excluir membro.' });
    }
  }
}

module.exports = MembroController;
