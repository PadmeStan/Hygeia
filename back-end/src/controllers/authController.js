const UserModel = require('../models/userModel');

class AuthController {

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  static async login(req, res) {
    try {
      const { cpf, senha } = req.body;

      if (!cpf || !senha) {
        return res.status(400).json({ erro: 'CPF e senha são obrigatórios.' });
      }

      const cpfLimpo = cpf.replace(/\D/g, '');
      const usuario = await UserModel.findByCpf(cpfLimpo);

      if (!usuario) {
        return res.status(401).json({ erro: 'CPF ou senha incorretos.' });
      }

      const senhaOk = await UserModel.verifyPassword(senha, usuario.senha);
      if (!senhaOk) {
        return res.status(401).json({ erro: 'CPF ou senha incorretos.' });
      }

      req.session.usuario = { id: usuario.id, nome: usuario.nome, cpf: usuario.cpf };

      return res.status(200).json({ sucesso: true, nome: usuario.nome });

    } catch (err) {
      console.error('[login]', err);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // ── CADASTRO ETAPA 1 — valida CPF + e-mail ───────────────────────────────
  // Não grava no banco ainda. Retorna OK para o JS redirecionar ao cadastro2.
  // Os dados (cpf + email) já ficam no sessionStorage do browser (gravado pelo JS).
  static async registerStep1(req, res) {
    try {
      const { cpf, email } = req.body;

      if (!cpf || !email) {
        return res.status(400).json({ erro: 'CPF e e-mail são obrigatórios.' });
      }

      const cpfLimpo = cpf.replace(/\D/g, '');

      const existente = await UserModel.findByCpfOrEmail(cpfLimpo, email);
      if (existente) {
        return res.status(409).json({ erro: 'CPF ou e-mail já cadastrado.' });
      }

      // Sinaliza sucesso — o JS do front redireciona para cadastro2.html
      return res.status(200).json({ sucesso: true });

    } catch (err) {
      console.error('[registerStep1]', err);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // ── CADASTRO ETAPA 2 — grava no banco ────────────────────────────────────
  // Recebe os dados completos (incluindo cpf + email vindos do front via body)
  static async register(req, res) {
    try {
      const {
        cpf, email,
        nome, data_nascimento, genero,
        sus, telefone,
        cep, cidade, bairro, rua, numero,
        senha, confirmar_senha,
      } = req.body;

      if (!cpf || !email || !nome || !senha || !confirmar_senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
      }

      if (senha !== confirmar_senha) {
        return res.status(400).json({ erro: 'As senhas não coincidem.' });
      }

      if (senha.length < 8) {
        return res.status(400).json({ erro: 'A senha deve ter pelo menos 8 caracteres.' });
      }

      // Converte data DD/MM/AAAA → AAAA-MM-DD para o MySQL
      const [dia, mes, ano] = data_nascimento.split('/');
      const dataNascimentoSQL = `${ano}-${mes}-${dia}`;

      const cpfLimpo = cpf.replace(/\D/g, '');

      // Dupla verificação de duplicidade (segurança)
      const existente = await UserModel.findByCpfOrEmail(cpfLimpo, email);
      if (existente) {
        return res.status(409).json({ erro: 'CPF ou e-mail já cadastrado.' });
      }

      await UserModel.create({
        cpf: cpfLimpo,
        email,
        nome,
        data_nascimento: dataNascimentoSQL,
        genero,
        sus: sus?.replace(/\D/g, '') || null,
        telefone: telefone?.replace(/\D/g, '') || null,
        cep: cep?.replace(/\D/g, '') || null,
        cidade,
        bairro,
        rua,
        numero,
        senha,
      });

      return res.status(201).json({ sucesso: true });

    } catch (err) {
      console.error('[register]', err);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  static logout(req, res) {
    req.session.destroy(() => {
      res.status(200).json({ sucesso: true });
    });
  }
}

module.exports = AuthController;