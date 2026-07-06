require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── ARQUIVOS ESTÁTICOS DO FRONTEND ──────────────────────────────────────────
// backend/ e frontend/ são irmãs, então subimos um nível com ../
const frontendPath = path.join(__dirname, '..', 'front-end');

app.use(express.static(frontendPath));          // serve css/, js/, img/
app.use(express.static(path.join(frontendPath, 'html'))); // serve os .html diretamente

// ── ROTA RAIZ → index2.html ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'html', 'index2.html'));
});

// ── BODY PARSERS ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── SESSÃO ───────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'hygeia_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                 // true em HTTPS
    maxAge: 1000 * 60 * 60 * 2,   // 2 horas
  },
}));

// ── ROTAS DA API ─────────────────────────────────────────────────────────────
app.use('/api', authRoutes);

// ── INICIA SERVIDOR ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`   Acesse: http://localhost:${PORT}/`);
});