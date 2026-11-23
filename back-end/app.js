require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const membroRoutes = require('./src/routes/membroRoutes');
const consultaRoutes = require('./src/routes/consultaRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hygeia_secret_2026',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use('/api', authRoutes);
app.use('/api/membros', membroRoutes);
app.use('/api/consultas', consultaRoutes);

const frontendPath = path.join(__dirname, '..', 'front-end');

app.use(express.static(frontendPath));
app.use(express.static(path.join(frontendPath, 'html')));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'html', 'index2.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
