// =====================================================
// membros.js — v3 (conectado ao back-end)
// Funciona com ou sem "defer", no <head> ou no fim do <body>.
// Todos os cliques usam delegação: não dependem de os
// elementos existirem na hora em que o script carrega.
// =====================================================
(() => {
'use strict';

const API = '/api/membros';
const GENERO_MAP = { male: 'Masculino', female: 'Feminino', other: 'Outro' };

const SVG_USER = `<svg xmlns="http://www.w3.org/2000/svg" height="120px" viewBox="0 -960 960 960" width="120px" fill="currentColor"><path d="M383.48-531.32q-38.61-38.6-38.61-96.65 0-58.05 38.61-96.53 38.6-38.47 96.52-38.47 57.92 0 96.52 38.47 38.61 38.48 38.61 96.53 0 58.05-38.61 96.65-38.6 38.6-96.52 38.6-57.92 0-96.52-38.6ZM180-238.72v-29.23q0-31.28 16.71-55.58 16.7-24.29 43.8-37.34 61.88-28.41 121.07-42.74 59.19-14.34 118.42-14.34 59.23 0 118.22 14.54 58.98 14.54 120.86 42.54 27.51 13.05 44.21 37.34Q780-299.23 780-267.95v29.23q0 21.26-14.89 36.14-14.88 14.89-36.14 14.89H231.03q-21.26 0-36.14-14.89Q180-217.46 180-238.72Z"/></svg>`;
const SVG_CAMERA = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M480-275.39q68.85 0 116.73-47.88 47.88-47.88 47.88-116.73t-47.88-116.73Q548.85-604.61 480-604.61t-116.73 47.88Q315.39-508.85 315.39-440t47.88 116.73q47.88 47.88 116.73 47.88Zm0-59.99q-44.31 0-74.46-30.16-30.16-30.15-30.16-74.46 0-44.31 30.16-74.46 30.15-30.16 74.46-30.16 44.31 0 74.46 30.16 30.16 30.15 30.16 74.46 0 44.31-30.16 74.46-30.15 30.16-74.46 30.16ZM172.31-140Q142-140 121-161q-21-21-21-51.31v-455.38Q100-698 121-719q21-21 51.31-21h122.15l74-80h223.08l74 80h122.15Q818-740 839-719q21 21 21 51.31v455.38Q860-182 839-161q-21 21-51.31 21H172.31Zm0-60h615.38q5.39 0 8.85-3.46t3.46-8.85v-455.38q0-5.39-3.46-8.85t-8.85-3.46H638.77l-73.39-80H394.62l-73.39 80H172.31q-5.39 0-8.85 3.46t-3.46 8.85v455.38q0 5.39 3.46 8.85t8.85 3.46ZM480-440Z"/></svg>`;

const $ = (id) => document.getElementById(id);

let membroAtual = null;              // membro aberto no modal de detalhes
const membrosPorId = new Map();      // membros exibidos na tela

// ── FORMATADORES / VALIDAÇÃO ────────────────────────

function formatarCPF(v) {
  return String(v || '').replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Cartão SUS tem 15 dígitos: 000 0000 0000 0000
function formatarSUS(v) {
  return String(v || '').replace(/\D/g, '').slice(0, 15)
    .replace(/(\d{3})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2');
}

function maskData(v) {
  return String(v || '').replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

function formatarDataBR(valor) {
  if (!valor) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return valor;
  const d = new Date(valor);
  return isNaN(d) ? '' : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function dataBRvalida(v) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v || '');
  if (!m) return false;
  const [, d, mes, a] = m.map(Number);
  const dt = new Date(a, mes - 1, d);
  return dt.getFullYear() === a && dt.getMonth() === mes - 1 && dt.getDate() === d && dt <= new Date();
}

function idadeNumero(dataBR) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataBR || '');
  if (!m) return null;
  const [, d, mes, a] = m.map(Number);
  const hoje = new Date();
  let idade = hoje.getFullYear() - a;
  const fez = hoje.getMonth() + 1 > mes || (hoje.getMonth() + 1 === mes && hoje.getDate() >= d);
  if (!fez) idade--;
  return idade >= 0 ? idade : null;
}

// O banco só aceita Feminino / Masculino / Outro (ou vazio)
function normalizarGenero(v) {
  const t = String(v || '').trim().toLowerCase();
  if (!t) return '';
  if (['feminino', 'f', 'mulher'].includes(t)) return 'Feminino';
  if (['masculino', 'm', 'homem'].includes(t)) return 'Masculino';
  if (['outro', 'outra', 'o'].includes(t)) return 'Outro';
  return null; // inválido
}

// ── MODAIS ──────────────────────────────────────────

function abrir(id) {
  const el = $(id);
  if (!el) { console.error(`[membros] Não achei #${id} no HTML. Cole o bloco membros_modais.html antes do </body>.`); return false; }
  el.style.display = 'flex';
  return true;
}
function fecharModal(id) { const el = $(id); if (el) el.style.display = 'none'; }

// ── CARREGAR DO BACK-END ────────────────────────────

async function carregarMembros() {
  try {
    const [resPerfil, resMembros] = await Promise.all([
      fetch('/api/perfil', { credentials: 'include' }),
      fetch(API,           { credentials: 'include' }),
    ]);

    if (resPerfil.status === 401 || resMembros.status === 401) {
      window.location.href = '/html/index2.html';
      return;
    }

    const lista = [];

    // Titular (o próprio usuário) sempre primeiro
    if (resPerfil.ok) {
      const u = await resPerfil.json();
      lista.push({
        id: `u_${u.id}`,
        nome: u.nome,
        tipo: 'Titular',
        data_nascimento: formatarDataBR(u.data_nascimento),
        genero: GENERO_MAP[u.genero] || '',
        cpf: formatarCPF(u.cpf),
        sus: formatarSUS(u.sus),
      });
    } else {
      console.warn('[membros] /api/perfil retornou', resPerfil.status,
        '— titular não exibido. Confirme se a rota /api/perfil existe no back-end.');
    }

    if (!resMembros.ok) {
      console.error('[membros] GET /api/membros retornou', resMembros.status);
      return;
    }

    (await resMembros.json()).forEach((m) => lista.push({
      id: m.id,
      nome: m.nome,
      tipo: m.tipo || 'Membro',
      data_nascimento: formatarDataBR(m.data_nascimento),
      genero: m.genero || '',
      cpf: formatarCPF(m.cpf),
      sus: formatarSUS(m.sus),
    }));

    renderizar(lista);

  } catch (err) {
    console.error('[membros] Erro ao carregar membros:', err);
  }
}

// ── CARDS ───────────────────────────────────────────

function renderizar(lista) {
  const container = document.querySelector('.membros');
  const btnAdicionar = $('btnAdicionar');
  if (!container || !btnAdicionar) {
    console.error('[membros] Faltou o container .membros ou o card #btnAdicionar no HTML.');
    return;
  }

  // Remove cards antigos (inclusive os de teste que ainda estiverem no HTML)
  container.querySelectorAll('.card:not(.adicionar)').forEach((c) => c.remove());
  membrosPorId.clear();

  lista.forEach((m) => {
    membrosPorId.set(String(m.id), m);
    container.insertBefore(criarCard(m), btnAdicionar);
  });
}

function criarCard(m) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = m.id;

  card.innerHTML = `
    <button type="button" class="menu-pontos" data-tooltip="Ver dados" aria-label="Ver dados">
      <div></div><div></div><div></div>
    </button>
    <div class="avatar">
      <div class="avatar-padrao"><i>${SVG_USER}</i></div>
      <span class="camera-back"><div class="camera">${SVG_CAMERA}</div></span>
    </div>
    <h3></h3>
    <span class="selo"></span>
  `;

  card.querySelector('h3').textContent = m.nome; // textContent evita injetar HTML
  const selo = card.querySelector('.selo');
  selo.textContent = m.tipo;
  if (m.tipo === 'Titular') selo.classList.add('selo-titular');
  return card;
}

// ── DETALHES ────────────────────────────────────────

function setEdicao(editando) {
  ['nomeInput', 'nascimento', 'genero', 'cpf', 'sus'].forEach((id) => {
    const el = $(id); if (el) el.readOnly = !editando;
  });
  const btn = $('btnEditar'); if (btn) btn.textContent = editando ? 'Salvar' : 'Editar';
}

function abrirDetalhes(m) {
  if (!$('modal')) { abrir('modal'); return; } // mostra o erro explicativo

  membroAtual = m;
  const titular = m.tipo === 'Titular';

  $('nome').textContent      = m.nome;
  $('seloModal').textContent = m.tipo;
  $('nomeInput').value       = m.nome;
  $('nascimento').value      = m.data_nascimento || '';
  const idade = idadeNumero(m.data_nascimento);
  $('idade').value           = idade !== null ? `${idade} anos` : '';
  $('genero').value          = m.genero || '';
  $('cpf').value             = m.cpf || '';
  $('sus').value             = m.sus || '';

  // Titular = o próprio usuário: alterar/excluir é pela página de perfil
  $('btnEditar').style.display  = titular ? 'none' : '';
  $('btnExcluir').style.display = titular ? 'none' : '';

  setEdicao(false);
  abrir('modal');
}

async function aoClicarEditar() {
  if (!membroAtual) return;

  // 1º clique: libera os campos
  if ($('nomeInput').readOnly) { setEdicao(true); return; }

  // 2º clique: valida e salva
  const nome = $('nomeInput').value.trim();
  const nasc = $('nascimento').value.trim();
  const genero = normalizarGenero($('genero').value);

  if (!nome) { alert('O nome é obrigatório.'); return; }
  if (nasc && !dataBRvalida(nasc)) { alert('Data de nascimento inválida. Use DD/MM/AAAA.'); return; }
  if (genero === null) { alert('Gênero inválido. Use Feminino, Masculino ou Outro.'); return; }

  try {
    const res = await fetch(`${API}/${membroAtual.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        data_nascimento: nasc,           // DD/MM/AAAA (o model converte)
        genero,
        cpf: $('cpf').value,
        sus: $('sus').value,
      }),
    });

    if (res.ok) {
      fecharModal('modal');
      await carregarMembros();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.erro || `Erro ao salvar (status ${res.status}).`);
    }
  } catch (err) {
    console.error('[membros] PUT falhou:', err);
    alert('Erro de conexão com o servidor.');
  }
}

async function aoClicarExcluir() {
  if (!membroAtual) return;
  if (!confirm(`Tem certeza que deseja excluir ${membroAtual.nome}?`)) return;

  try {
    const res = await fetch(`${API}/${membroAtual.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      fecharModal('modal');
      await carregarMembros();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.erro || `Erro ao excluir (status ${res.status}).`);
    }
  } catch (err) {
    console.error('[membros] DELETE falhou:', err);
    alert('Erro de conexão com o servidor.');
  }
}

// ── ADICIONAR ───────────────────────────────────────

function abrirAdicionar() {
  const form = $('formAdicionar');
  if (form) form.reset();
  if (abrir('modalAdicionar')) { const c = $('novoNome'); if (c) c.focus(); }
}

async function aoEnviarAdicionar() {
  const body = {
    nome: $('novoNome').value.trim(),
    data_nascimento: $('novoNascimento').value, // AAAA-MM-DD
    genero: $('novoGenero').value,
    cpf: $('novoCpf').value,
    sus: $('novoSus').value,
    tipo: 'Membro',
  };

  try {
    const res = await fetch(API, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      fecharModal('modalAdicionar');
      await carregarMembros();
    } else {
      const data = await res.json().catch(() => ({}));
      console.error('[membros] POST /api/membros retornou', res.status, data);
      alert(data.erro || `Erro ao adicionar membro (status ${res.status}).`);
    }
  } catch (err) {
    console.error('[membros] POST falhou:', err);
    alert('Erro de conexão com o servidor.');
  }
}

// ── EVENTOS (delegação no document) ─────────────────

document.addEventListener('click', (e) => {
  const t = e.target;
  if (!(t instanceof Element)) return;

  if (t.closest('#fechar'))            return fecharModal('modal');
  if (t.closest('#fecharAdicionar'))   return fecharModal('modalAdicionar');
  if (t.closest('#cancelarAdicionar')) return fecharModal('modalAdicionar');
  if (t.closest('#btnEditar'))         return void aoClicarEditar();
  if (t.closest('#btnExcluir'))        return void aoClicarExcluir();
  if (t.closest('#btnAdicionar'))      return abrirAdicionar();

  // Clique no fundo escuro fecha o modal
  if (t.id === 'modal')          return fecharModal('modal');
  if (t.id === 'modalAdicionar') return fecharModal('modalAdicionar');

  // Clique num card de membro abre os detalhes
  const card = t.closest('.membros .card');
  if (card && !card.classList.contains('adicionar')) {
    const m = membrosPorId.get(String(card.dataset.id));
    if (m) abrirDetalhes(m);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { fecharModal('modal'); fecharModal('modalAdicionar'); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element && e.target.closest('#btnAdicionar')) {
    e.preventDefault();
    abrirAdicionar();
  }
});

document.addEventListener('input', (e) => {
  const el = e.target;
  switch (el && el.id) {
    case 'cpf': case 'novoCpf': el.value = formatarCPF(el.value); break;
    case 'sus': case 'novoSus': el.value = formatarSUS(el.value); break;
    case 'nascimento': {
      el.value = maskData(el.value);
      const idade = idadeNumero(el.value);
      if ($('idade')) $('idade').value = idade !== null ? `${idade} anos` : '';
      break;
    }
  }
});

// <input type="date"> entrega AAAA-MM-DD; preenche a idade sozinha
document.addEventListener('change', (e) => {
  if (!e.target || e.target.id !== 'novoNascimento') return;
  const [a, m, d] = (e.target.value || '').split('-');
  const idade = a ? idadeNumero(`${d}/${m}/${a}`) : null;
  if (idade !== null && $('novoIdade')) $('novoIdade').value = idade;
});

document.addEventListener('submit', (e) => {
  if (!e.target || e.target.id !== 'formAdicionar') return;
  e.preventDefault(); // o navegador já validou os campos "required"
  aoEnviarAdicionar();
});

// ── DIAGNÓSTICO + INÍCIO ────────────────────────────

function diagnosticar() {
  const ids = ['modal', 'fechar', 'seloModal', 'nome', 'nomeInput', 'nascimento', 'idade', 'genero',
    'cpf', 'sus', 'btnEditar', 'btnExcluir', 'modalAdicionar', 'formAdicionar', 'fecharAdicionar',
    'cancelarAdicionar', 'novoNome', 'novoNascimento', 'novoIdade', 'novoGenero', 'novoCpf',
    'novoSus', 'btnAdicionar'];

  const faltando = ids.filter((id) => !$(id));
  const duplicados = ids.filter((id) => document.querySelectorAll(`[id="${id}"]`).length > 1);

  if (faltando.length)   console.error('[membros] IDs que FALTAM no HTML:', faltando.join(', '));
  if (duplicados.length) console.error('[membros] IDs DUPLICADOS (apague o bloco de modal antigo):', duplicados.join(', '));
  if (!document.querySelector('.membros')) console.error('[membros] Container .membros não encontrado.');
  if (!faltando.length && !duplicados.length) console.info('[membros.js v3] OK — HTML e modais conferem.');
}

function iniciar() {
  diagnosticar();
  carregarMembros();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}

})();