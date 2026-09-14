require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes   = require('./src/routes/authRoutes');
const membroRoutes = require('./src/routes/membroRoutes');
const consultaRoutes = require('./src/routes/consultaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── BODY PARSERS — sempre primeiro ───────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── SESSÃO ───────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'hygeia_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 2,
  },
}));

// ── ROTAS DA API ─────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/membros', membroRoutes);
app.use('/api/consultas', consultaRoutes);

// ── ARQUIVOS ESTÁTICOS ────────────────────────────────
const frontendPath = path.join(__dirname, '..', 'front-end');
app.use(express.static(frontendPath));
app.use(express.static(path.join(frontendPath, 'html')));

// ── ROTA RAIZ ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'html', 'index2.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});