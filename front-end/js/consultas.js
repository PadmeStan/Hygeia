// =====================================================
// consultas.js — Fluxo de agendamento Hygeia
// =====================================================

// ── DADOS MOCKADOS (substituir por fetch à API futuramente) ──

const MEMBROS = [
  { id: 1, nome: 'Stella',  sobrenome: 'Johnson', icone: '👩' },
  { id: 2, nome: 'Alex',    sobrenome: 'Johnson', icone: '👨' },
  { id: 3, nome: 'Sophia',  sobrenome: 'Johnson', icone: '👱‍♀️' },
  { id: 4, nome: 'Joseph',  sobrenome: 'Johnson', icone: '🧑' },
  { id: 5, nome: 'Daniel',  sobrenome: 'Turner',  icone: '👦' },
  { id: 6, nome: 'Karol',   sobrenome: 'Johnson', icone: '👩‍⚕️' },
];

const UBS_MOCK = [
  {
    id: 1, nome: 'UBS Pindaí',
    endereco: 'R. J.k - Mata, São José de Ribamar - MA, 65110-000',
    distancia: '1,6KM', proxima: true,
    horarios: ['07:00','08:30','10:00','11:30','13:30'],
    funcionamento: 'De segunda a sexta, das 08h até 17h.',
    foto: null,
  },
  {
    id: 2, nome: 'UBS São José dos Índios',
    endereco: 'Vila São Jose, São José de Ribamar - MA, 65110-000',
    distancia: '2KM', proxima: false,
    horarios: ['07:30','09:00','10:30','14:00'],
    funcionamento: 'De segunda a sexta, das 07h até 16h.',
    foto: null,
  },
  {
    id: 3, nome: 'UBS J. Câmara',
    endereco: 'R. João Alves Carneiro - Moropia, São José de Ribamar - MA, 65110-000',
    distancia: '5,5KM', proxima: false,
    horarios: ['08:00','09:30','11:00','13:00'],
    funcionamento: 'De segunda a sexta, das 08h até 17h.',
    foto: null,
  },
  {
    id: 4, nome: 'UBS Turiúba',
    endereco: 'Res. Turiúba, São José de Ribamar - MA, 65110-000',
    distancia: '3,7KM', proxima: false,
    horarios: ['07:00','08:00','10:00','11:00','15:00'],
    funcionamento: 'De segunda a sábado, das 07h até 15h.',
    foto: null,
  },
];

// ── ESTADO GLOBAL ──────────────────────────────────

const estado = {
  especialidadeNome: null,
  especialidadeId: null,
  membroId: null,
  membroNome: null,
  ubsSelecionada: null,
  dataSelecionada: null,
  horarioSelecionado: null,
};

// ── CALENDÁRIO ──────────────────────────────────────

let calData = new Date();
calData.setDate(1);

function renderCalendario() {
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  document.getElementById('cal-mes-ano').textContent =
    `${meses[calData.getMonth()]}, ${calData.getFullYear()}`;

  const container = document.getElementById('cal-dias');
  container.innerHTML = '';

  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  const primeiroDia = new Date(calData.getFullYear(), calData.getMonth(), 1).getDay();
  const totalDias   = new Date(calData.getFullYear(), calData.getMonth() + 1, 0).getDate();

  // células vazias antes do dia 1
  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement('div');
    vazio.className = 'cal-dia vazio';
    container.appendChild(vazio);
  }

  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(calData.getFullYear(), calData.getMonth(), d);
    const btn = document.createElement('div');
    btn.className = 'cal-dia';
    btn.textContent = d;

    if (data < hoje) {
      btn.classList.add('passado');
    } else {
      if (data.toDateString() === hoje.toDateString()) btn.classList.add('hoje');

      // Marca selecionado
      if (estado.dataSelecionada) {
        const sel = new Date(estado.dataSelecionada);
        if (data.toDateString() === sel.toDateString()) btn.classList.add('selecionado');
      }

      btn.addEventListener('click', () => {
        estado.dataSelecionada = data;
        estado.horarioSelecionado = null;
        document.querySelectorAll('.btn-horario').forEach(b => b.classList.remove('selecionado'));
        atualizarBtnEtapa3();
        renderCalendario();
      });
    }

    container.appendChild(btn);
  }
}

document.getElementById('cal-prev').addEventListener('click', () => {
  calData.setMonth(calData.getMonth() - 1);
  renderCalendario();
});
document.getElementById('cal-next').addEventListener('click', () => {
  calData.setMonth(calData.getMonth() + 1);
  renderCalendario();
});

// ── MODAL DE MEMBROS ────────────────────────────────

function abrirModal(especialidade, idEspecialidade) {
  estado.especialidadeNome = especialidade;
  estado.especialidadeId   = idEspecialidade;
  estado.membroId          = null;
  estado.membroNome        = null;

  const grid = document.getElementById('membros-grid');
  grid.innerHTML = '';

  MEMBROS.forEach(m => {
    const item = document.createElement('div');
    item.className = 'membro-item';
    item.dataset.id = m.id;
    item.innerHTML = `
      <div class="membro-avatar">${m.icone}</div>
      <div class="membro-nome">${m.nome}</div>
      <div class="membro-sobrenome">${m.sobrenome}</div>
    `;
    item.addEventListener('click', () => {
      document.querySelectorAll('.membro-item').forEach(el => el.classList.remove('selecionado'));
      item.classList.add('selecionado');
      estado.membroId   = m.id;
      estado.membroNome = m.nome + ' ' + m.sobrenome;
      document.getElementById('btn-continuar').disabled = false;
    });
    grid.appendChild(item);
  });

  document.getElementById('btn-continuar').disabled = true;
  document.getElementById('modal-overlay').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

function confirmarMembro() {
  fecharModal();
  mostrarAgendamento();
}

// ── TELA DE AGENDAMENTO ─────────────────────────────

function mostrarAgendamento() {
  document.getElementById('tela-inicio').style.display      = 'none';
  document.getElementById('tela-agendamento').style.display = 'block';
  irParaEtapa(1);
}

function voltarInicio() {
  document.getElementById('tela-inicio').style.display      = '';
  document.getElementById('tela-agendamento').style.display = 'none';
  // Reseta estado
  estado.ubsSelecionada    = null;
  estado.dataSelecionada   = null;
  estado.horarioSelecionado = null;
}

function irParaEtapa(num) {
  // Atualiza tabs
  document.querySelectorAll('.step-tab').forEach(t => {
    const n = parseInt(t.dataset.step);
    t.classList.toggle('active', n === num);
    t.classList.toggle('done', n < num);
  });

  // Mostra etapa correta
  document.querySelectorAll('.etapa').forEach(e => e.style.display = 'none');
  document.getElementById(`etapa-${num}`).style.display = '';

  if (num === 1) renderUBS();
  if (num === 2) renderEtapa2();
  if (num === 3) renderConfirmacao();
}

// ── ETAPA 1: UBS ───────────────────────────────────

function renderUBS() {
  const grid = document.getElementById('ubs-grid');
  grid.innerHTML = '';

  UBS_MOCK.forEach(ubs => {
    const card = document.createElement('div');
    card.className = 'ubs-card' + (estado.ubsSelecionada?.id === ubs.id ? ' selecionada' : '');

    card.innerHTML = `
      <div class="ubs-card-header">
        <span class="ubs-nome">${ubs.nome}</span>
        ${ubs.proxima ? '<span class="badge-proxima">MAIS PRÓXIMA</span>' : ''}
      </div>
      <p class="ubs-endereco">${ubs.endereco} / <span class="ubs-distancia">${ubs.distancia}</span></p>
      <div class="ubs-actions">
        <button class="btn-mapa"><i class="fa-solid fa-location-dot"></i> Ver no mapa</button>
        <button class="btn-confirmar-ubs">Confirmar</button>
      </div>
    `;

    card.querySelector('.btn-confirmar-ubs').addEventListener('click', () => {
      estado.ubsSelecionada = ubs;
      irParaEtapa(2);
    });

    card.querySelector('.btn-mapa').addEventListener('click', () => {
      const q = encodeURIComponent(ubs.endereco);
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
    });

    grid.appendChild(card);
  });
}

// ── ETAPA 2: AGENDAR ───────────────────────────────

function renderEtapa2() {
  const ubs = estado.ubsSelecionada;

  // Detalhe da UBS
  document.getElementById('ubs-detalhe').innerHTML = `
    <div class="ubs-foto" style="background:#b8cfea; display:flex; align-items:center; justify-content:center; color:#5a7fa8; font-size:32px;">
      <i class="fa-solid fa-hospital"></i>
    </div>
    <div>
      <div class="ubs-info-titulo">${ubs.nome}</div>
      <div class="ubs-info-label">Endereço</div>
      <div class="ubs-info-val">${ubs.endereco}</div>
      <div class="ubs-info-label">Horário de Funcionamento</div>
      <div class="ubs-info-val">${ubs.funcionamento}</div>
    </div>
  `;

  // Horários
  const lista = document.getElementById('horarios-lista');
  lista.innerHTML = '';
  ubs.horarios.forEach(h => {
    const btn = document.createElement('button');
    btn.className = 'btn-horario' + (estado.horarioSelecionado === h ? ' selecionado' : '');
    btn.textContent = h;
    btn.addEventListener('click', () => {
      estado.horarioSelecionado = h;
      document.querySelectorAll('.btn-horario').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      atualizarBtnEtapa3();
    });
    lista.appendChild(btn);
  });

  renderCalendario();
  atualizarBtnEtapa3();
}

function atualizarBtnEtapa3() {
  const btn = document.getElementById('btn-ir-etapa3');
  btn.disabled = !(estado.dataSelecionada && estado.horarioSelecionado);
}

// ── ETAPA 3: CONFIRMAÇÃO ───────────────────────────

function renderConfirmacao() {
  const d = estado.dataSelecionada;
  const dataFormatada = d ? d.toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric'
  }) : '—';

  document.getElementById('confirmacao-detalhes').innerHTML = `
    <h3><i class="fa-regular fa-calendar-check"></i> Detalhes da consulta</h3>
    <div class="detalhe-item">
      <div class="detalhe-label">Paciente</div>
      <div class="detalhe-valor">${estado.membroNome || '—'}</div>
    </div>
    <div class="detalhe-item">
      <div class="detalhe-label">Unidade</div>
      <div class="detalhe-valor">${estado.ubsSelecionada?.nome || '—'}</div>
    </div>
    <div class="detalhe-item">
      <div class="detalhe-label">Especialidade</div>
      <div class="detalhe-valor">${estado.especialidadeNome || '—'}</div>
    </div>
    <div class="detalhe-item">
      <div class="detalhe-label">Data</div>
      <div class="detalhe-valor">${dataFormatada}</div>
    </div>
    <div class="detalhe-item">
      <div class="detalhe-label">Horário</div>
      <div class="detalhe-valor">${estado.horarioSelecionado || '—'}</div>
    </div>
  `;
}

// ── ESPECIALIDADES: click abre modal ───────────────

document.querySelectorAll('.specialty-item').forEach(item => {
  item.addEventListener('click', () => {
    const especialidade = item.dataset.especialidade;
    const id = item.dataset.id;
    abrirModal(especialidade, id);
  });
});

// Fecha modal clicando fora
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) fecharModal();
});