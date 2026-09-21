// =====================================================
// membros.js — conectado ao back-end
// =====================================================

const API = '/api/membros';

const modal          = document.getElementById('modal');
const modalAdicionar = document.getElementById('modalAdicionar');
const formAdicionar  = document.getElementById('formAdicionar');
const membrosContainer = document.querySelector('.membros');
const btnAdicionar   = document.getElementById('btnAdicionar');

// ID do membro atualmente aberto no modal de detalhes
let membroAbertoId = null;

// ── CARREGAR MEMBROS AO ABRIR A PÁGINA ─────────────

async function carregarMembros() {
  try {
    // Busca o usuário titular
    const resUser = await fetch('/api/perfil');
    if (resUser.status === 401) {
      window.location.href = '/html/index2.html';
      return;
    }

    // Busca membros da família
    const resMembros = await fetch(API);
    const membros = await resMembros.json();

    // Remove cards existentes (exceto o botão Adicionar)
    document.querySelectorAll('.card:not(.adicionar)').forEach(c => c.remove());

    // Adiciona o titular primeiro
    if (resUser.ok) {
      const usuario = await resUser.json();
      const cardTitular = criarCardMembro({
        id:   `u_${usuario.id}`,
        nome:  usuario.nome,
        tipo: 'Titular',
        data_nascimento: usuario.data_nascimento
          ? new Date(usuario.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
          : null,
        genero: usuario.genero,
        cpf:    usuario.cpf
          ? usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
          : null,
        sus:    usuario.sus,
      });
      membrosContainer.insertBefore(cardTitular, btnAdicionar);
    }

    // Adiciona os membros da família
    membros.forEach(m => {
      const card = criarCardMembro(m);
      membrosContainer.insertBefore(card, btnAdicionar);
    });

  } catch (err) {
    console.error('Erro ao carregar membros:', err);
  }
}

// ── CRIAR CARD ──────────────────────────────────────

function criarCardMembro(dados) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id     = dados.id;
  card.dataset.nome   = dados.nome;
  card.dataset.data   = dados.data_nascimento || '';
  card.dataset.genero = dados.genero || '';
  card.dataset.cpf    = dados.cpf || '';
  card.dataset.sus    = dados.sus || '';
  card.dataset.tipo   = dados.tipo || 'Membro';

  // Calcula idade a partir da data
  let idadeTexto = '';
  if (dados.data_nascimento) {
    const partes = dados.data_nascimento.split('/');
    if (partes.length === 3) {
      const nasc = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
      const hoje = new Date();
      const anos = hoje.getFullYear() - nasc.getFullYear();
      idadeTexto = anos + ' anos';
    }
  }
  card.dataset.idade = idadeTexto;

  card.innerHTML = `
    <button class="menu-pontos" title="Mais opções">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
    </button>
    <div class="avatar">
      <div class="avatar-padrao"></div>
      <span class="camera">
        <svg viewBox="0 0 24 24"><path d="M9 3 7.6 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.6L15 3H9Zm3 6a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"/></svg>
      </span>
    </div>
    <h3>${dados.nome}</h3>
    <span class="selo ${dados.tipo === 'Titular' ? 'selo-titular' : ''}">${dados.tipo || 'Membro'}</span>
  `;

  // Abre modal de detalhes ao clicar no card
  card.addEventListener('click', () => abrirModalDetalhes(card));

  // Impede que o menu de 3 pontos abra o modal
  card.querySelector('.menu-pontos').addEventListener('click', e => e.stopPropagation());

  return card;
}

// ── MODAL DETALHES ──────────────────────────────────

function abrirModalDetalhes(card) {
  membroAbertoId = card.dataset.id;

  document.getElementById('nome').innerHTML      = card.dataset.nome;
  document.getElementById('nomeInput').value     = card.dataset.nome;
  document.getElementById('nascimento').value    = card.dataset.data;
  document.getElementById('idade').value         = card.dataset.idade;
  document.getElementById('genero').value        = card.dataset.genero;
  document.getElementById('cpf').value           = card.dataset.cpf;
  document.getElementById('sus').value           = card.dataset.sus;
  document.getElementById('seloModal').innerHTML = card.dataset.tipo;

  // Bloqueia campos por padrão
  setModalReadonly(true);

  modal.style.display = 'flex';
}

function setModalReadonly(readonly) {
  ['nomeInput','nascimento','genero','cpf','sus'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.readOnly = readonly;
  });
}

document.getElementById('fechar').onclick = () => { modal.style.display = 'none'; };

window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
  if (e.target === modalAdicionar) fecharModalAdicionar();
});

// ── BOTÃO EDITAR ────────────────────────────────────

document.querySelector('.editar').addEventListener('click', async function () {
  const isReadonly = document.getElementById('nomeInput').readOnly;

  if (isReadonly) {
    // Entra em modo edição
    setModalReadonly(false);
    this.textContent = 'Salvar';
    return;
  }

  // Salva
  const body = {
    nome:            document.getElementById('nomeInput').value.trim(),
    data_nascimento: document.getElementById('nascimento').value,
    genero:          document.getElementById('genero').value,
    cpf:             document.getElementById('cpf').value,
    sus:             document.getElementById('sus').value,
  };

  try {
    const res = await fetch(`${API}/${membroAbertoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      modal.style.display = 'none';
      await carregarMembros();
    } else {
      const data = await res.json();
      alert(data.erro || 'Erro ao salvar.');
    }
  } catch (err) {
    alert('Erro de conexão.');
  }
});

// ── BOTÃO EXCLUIR ───────────────────────────────────

document.querySelector('.excluir').addEventListener('click', async () => {
  if (!confirm('Tem certeza que deseja excluir este membro?')) return;

  try {
    const res = await fetch(`${API}/${membroAbertoId}`, { method: 'DELETE' });

    if (res.ok) {
      modal.style.display = 'none';
      await carregarMembros();
    } else {
      const data = await res.json();
      alert(data.erro || 'Erro ao excluir.');
    }
  } catch (err) {
    alert('Erro de conexão.');
  }
});

// ── MODAL ADICIONAR ─────────────────────────────────

const campoNome       = document.getElementById('novoNome');
const campoNascimento = document.getElementById('novoNascimento');
const campoIdade      = document.getElementById('novoIdade');
const campoGenero     = document.getElementById('novoGenero');
const campoCpf        = document.getElementById('novoCpf');
const campoSus        = document.getElementById('novoSus');

function abrirModalAdicionar() {
  formAdicionar.reset();
  modalAdicionar.style.display = 'flex';
}

function fecharModalAdicionar() {
  modalAdicionar.style.display = 'none';
  formAdicionar.reset();
}

btnAdicionar?.addEventListener('click', abrirModalAdicionar);
document.getElementById('fecharAdicionar').onclick = fecharModalAdicionar;
document.getElementById('cancelarAdicionar').onclick = fecharModalAdicionar;

// Máscaras
campoCpf?.addEventListener('input', () => {
  let v = campoCpf.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  campoCpf.value = v;
});

campoSus?.addEventListener('input', () => {
  let v = campoSus.value.replace(/\D/g, '').slice(0, 15);
  v = v.replace(/(\d{3})(\d)/, '$1 $2').replace(/(\d{4})(\d)/, '$1 $2').replace(/(\d{4})(\d)/, '$1 $2');
  campoSus.value = v;
});

// Calcula idade automaticamente ao preencher data
campoNascimento?.addEventListener('change', () => {
  if (!campoNascimento.value) return;
  const nasc = new Date(campoNascimento.value);
  const hoje = new Date();
  const anos = hoje.getFullYear() - nasc.getFullYear();
  campoIdade.value = anos;
});

// Submit do form — salva no banco
formAdicionar?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!formAdicionar.checkValidity()) { formAdicionar.reportValidity(); return; }

  const body = {
    nome:            campoNome.value.trim(),
    data_nascimento: campoNascimento.value, // formato AAAA-MM-DD (input type=date)
    genero:          campoGenero.value,
    cpf:             campoCpf.value.trim(),
    sus:             campoSus.value.trim(),
    tipo:            'Membro',
  };

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      fecharModalAdicionar();
      await carregarMembros();
    } else {
      const data = await res.json();
      alert(data.erro || 'Erro ao adicionar membro.');
    }
  } catch (err) {
    alert('Erro de conexão com o servidor.');
  }
});

// ── INICIA ──────────────────────────────────────────
carregarMembros();