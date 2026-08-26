// =====================================================
// consultas.js — conectado ao back-end
// =====================================================

const API = '/api/consultas';

const estado = {
  especialidadeNome: null,
  especialidadeId:   null,
  membroId:          null,
  membroNome:        null,
  ubsSelecionada:    null,
  dataSelecionada:   null,
  horarioSelecionado: null,
};

let calData = new Date();
calData.setDate(1);

// ── UTILITÁRIO ─────────────────────────────────────

function mostrarErro(msg) {
  const el = document.getElementById('msg-erro-agendamento');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

// ── MODAL DE MEMBROS ────────────────────────────────

async function abrirModal(especialidade, idEspecialidade) {
  document.querySelectorAll('.specialty-item').forEach(item => {
  item.addEventListener('click', () => {
    console.log('clicou em:', item.dataset.especialidade, item.dataset.id);
    abrirModal(item.dataset.especialidade, item.dataset.id);
  });
});

  estado.especialidadeNome = especialidade;
  estado.especialidadeId   = idEspecialidade;
  estado.membroId          = null;
  estado.membroNome        = null;

  const grid = document.getElementById('membros-grid');
  grid.innerHTML = '<p style="color:#555;text-align:center">Carregando...</p>';
  document.getElementById('btn-continuar').disabled = true;
  document.getElementById('modal-overlay').style.display = 'flex';
  console.log('modal aberto, fazendo fetch em:', `${API}/membros`);

  try {
    const res = await fetch(`${API}/membros`);
    console.log('status do fetch:', res.status);
    if (res.status === 401) { window.location.href = '/html/index2.html'; return; }
    const membros = await res.json();
    console.log('membros recebidos:', membros);

    grid.innerHTML = '';

    if (membros.length === 0) {
      grid.innerHTML = '<p style="color:#555;text-align:center;grid-column:1/-1">Nenhum membro cadastrado. <a href="/html/membros.html">Adicione membros</a> primeiro.</p>';
      return;
    }

    membros.forEach(m => {
      const item = document.createElement('div');
      item.className = 'membro-item';
      item.dataset.id   = m.id;
      item.dataset.nome = m.nome;
      item.innerHTML = `
        <div class="membro-avatar"><i class="ti ti-user"></i></div>
        <div class="membro-nome">${m.nome.split(' ')[0]}</div>
        <div class="membro-sobrenome">${m.nome.split(' ').slice(1).join(' ')}</div>
      `;
      item.addEventListener('click', () => {
        document.querySelectorAll('.membro-item').forEach(el => el.classList.remove('selecionado'));
        item.classList.add('selecionado');
        estado.membroId   = m.id;
        estado.membroNome = m.nome;
        document.getElementById('btn-continuar').disabled = false;
      });
      grid.appendChild(item);
    });

  } catch (err) {
    grid.innerHTML = '<p style="color:red;text-align:center">Erro ao carregar membros.</p>';
  }
}

function fecharModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

function confirmarMembro() {
  fecharModal();
  mostrarAgendamento();
}

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) fecharModal();
});

// ── TELAS ───────────────────────────────────────────

function mostrarAgendamento() {
  document.getElementById('tela-inicio').style.display      = 'none';
  document.getElementById('tela-agendamento').style.display = 'block';
  irParaEtapa(1);
}

function voltarInicio() {
  document.getElementById('tela-inicio').style.display      = '';
  document.getElementById('tela-agendamento').style.display = 'none';
  estado.ubsSelecionada     = null;
  estado.dataSelecionada    = null;
  estado.horarioSelecionado = null;
}

function irParaEtapa(num) {
  document.querySelectorAll('.step-tab').forEach(t => {
    const n = parseInt(t.dataset.step);
    t.classList.toggle('active', n === num);
    t.classList.toggle('done', n < num);
  });
  document.querySelectorAll('.etapa').forEach(e => e.style.display = 'none');
  document.getElementById(`etapa-${num}`).style.display = '';

  if (num === 1) renderUBS();
  if (num === 2) renderEtapa2();
  if (num === 3) renderConfirmacao();
}

// ── ETAPA 1: UBS ────────────────────────────────────

async function renderUBS() {
  const grid = document.getElementById('ubs-grid');
  grid.innerHTML = '<p style="color:#9bbfd9;text-align:center;grid-column:1/-1;padding:20px">Carregando UBS...</p>';

  try {
    const res = await fetch(`${API}/ubs?especialidade_id=${estado.especialidadeId}`);
    const lista = await res.json();

    grid.innerHTML = '';

    if (lista.length === 0) {
      grid.innerHTML = '<p style="color:#9bbfd9;text-align:center;grid-column:1/-1;padding:20px">Nenhuma UBS encontrada para essa especialidade.</p>';
      return;
    }

    lista.forEach((ubs, idx) => {
      const card = document.createElement('div');
      card.className = 'ubs-card' + (estado.ubsSelecionada?.id === ubs.id ? ' selecionada' : '');
      card.innerHTML = `
        <div class="ubs-card-header">
          <span class="ubs-nome">${ubs.nome}</span>
          ${idx === 0 ? '<span class="badge-proxima">MAIS PRÓXIMA</span>' : ''}
        </div>
        <p class="ubs-endereco">${ubs.endereco || 'Endereço não informado'}</p>
        <div class="ubs-actions">
          <button class="btn-mapa"><i class="fa-solid fa-location-dot"></i> Ver no mapa</button>
          <button class="btn-confirmar-ubs">Confirmar</button>
        </div>
      `;

      card.querySelector('.btn-confirmar-ubs').addEventListener('click', () => {
        estado.ubsSelecionada = ubs;
        estado.dataSelecionada    = null;
        estado.horarioSelecionado = null;
        irParaEtapa(2);
      });

      card.querySelector('.btn-mapa').addEventListener('click', () => {
        const q = encodeURIComponent(ubs.endereco || ubs.nome);
        window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
      });

      grid.appendChild(card);
    });

  } catch (err) {
    grid.innerHTML = '<p style="color:red;text-align:center;grid-column:1/-1;padding:20px">Erro ao carregar UBS.</p>';
  }
}

// ── ETAPA 2: HORÁRIOS ────────────────────────────────

function renderEtapa2() {
  const ubs = estado.ubsSelecionada;

  document.getElementById('ubs-detalhe').innerHTML = `
    <div class="ubs-foto" style="background:#b8cfea;display:flex;align-items:center;justify-content:center;color:#5a7fa8;font-size:32px;">
      <i class="fa-solid fa-hospital"></i>
    </div>
    <div>
      <div class="ubs-info-titulo">${ubs.nome}</div>
      <div class="ubs-info-label">Endereço</div>
      <div class="ubs-info-val">${ubs.endereco || '—'}</div>
      <div class="ubs-info-label">Horário de Funcionamento</div>
      <div class="ubs-info-val">${ubs.funcionamento || '—'}</div>
    </div>
  `;

  renderCalendario();
  carregarHorarios();
}

async function carregarHorarios() {
  if (!estado.dataSelecionada) return;

  const lista = document.getElementById('horarios-lista');
  lista.innerHTML = '<span style="color:#888;font-size:13px">Carregando horários...</span>';

  const dataISO = estado.dataSelecionada.toISOString().split('T')[0];

  try {
    const res = await fetch(
      `${API}/horarios?ubs_id=${estado.ubsSelecionada.id}&especialidade_id=${estado.especialidadeId}&data=${dataISO}`
    );
    const horarios = await res.json();

    lista.innerHTML = '';

    if (horarios.length === 0) {
      lista.innerHTML = '<span style="color:#888;font-size:13px">Nenhum horário disponível nesta data.</span>';
      return;
    }

    horarios.forEach(h => {
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

  } catch (err) {
    lista.innerHTML = '<span style="color:red;font-size:13px">Erro ao carregar horários.</span>';
  }

  atualizarBtnEtapa3();
}

function atualizarBtnEtapa3() {
  const btn = document.getElementById('btn-ir-etapa3');
  btn.disabled = !(estado.dataSelecionada && estado.horarioSelecionado);
}

// ── CALENDÁRIO ───────────────────────────────────────

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

  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement('div');
    vazio.className = 'cal-dia vazio';
    container.appendChild(vazio);
  }

  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(calData.getFullYear(), calData.getMonth(), d);
    const btn  = document.createElement('div');
    btn.className = 'cal-dia';
    btn.textContent = d;

    const diaSemana = data.getDay(); // 0=Dom, 6=Sáb
    const passado   = data < hoje;
    const fimSemana = diaSemana === 0 || diaSemana === 6;

    if (passado || fimSemana) {
      btn.classList.add('passado');
    } else {
      if (data.toDateString() === hoje.toDateString()) btn.classList.add('hoje');
      if (estado.dataSelecionada?.toDateString() === data.toDateString()) btn.classList.add('selecionado');

      btn.addEventListener('click', () => {
        estado.dataSelecionada    = data;
        estado.horarioSelecionado = null;
        atualizarBtnEtapa3();
        renderCalendario();
        carregarHorarios();
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

// ── ETAPA 3: CONFIRMAR ───────────────────────────────

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

  // Botão de confirmar agendamento
  const btnConfirmar = document.getElementById('btn-confirmar-agendamento');
  if (btnConfirmar) {
    btnConfirmar.onclick = confirmarAgendamento;
  }
}

async function confirmarAgendamento() {
  const btn = document.getElementById('btn-confirmar-agendamento');
  btn.disabled = true;
  btn.textContent = 'Aguarde...';

  const dataISO = estado.dataSelecionada.toISOString().split('T')[0];

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membro_id:        estado.membroId,
        ubs_id:           estado.ubsSelecionada.id,
        especialidade_id: estado.especialidadeId,
        data:             dataISO,
        hora:             estado.horarioSelecionado,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Mostra tela de sucesso
      document.getElementById('etapa-3').innerHTML = `
        <div class="confirmacao-box">
          <div class="confirmacao-sucesso">
            <h2>Confirmação recebida! <i class="fa-solid fa-circle-check"></i></h2>
            <p>Estamos felizes em atendê-lo(a) e aguardamos você na data e horário agendados.
               Caso precise de alguma informação adicional ou queira reagendar, entre em contato com nossa equipe.</p>
          </div>
          <div class="confirmacao-bottom">
            <div class="confirmacao-detalhes">
              <h3><i class="fa-regular fa-calendar-check"></i> Detalhes da consulta</h3>
              <div class="detalhe-item"><div class="detalhe-label">Paciente</div><div class="detalhe-valor">${estado.membroNome}</div></div>
              <div class="detalhe-item"><div class="detalhe-label">Unidade</div><div class="detalhe-valor">${estado.ubsSelecionada.nome}</div></div>
              <div class="detalhe-item"><div class="detalhe-label">Especialidade</div><div class="detalhe-valor">${estado.especialidadeNome}</div></div>
              <div class="detalhe-item"><div class="detalhe-label">Data</div><div class="detalhe-valor">${estado.dataSelecionada.toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})}</div></div>
              <div class="detalhe-item"><div class="detalhe-label">Horário</div><div class="detalhe-valor">${estado.horarioSelecionado}</div></div>
            </div>
            <div class="proximos-passos">
              <h4><i class="ti ti-bell"></i> Próximos passos</h4>
              <ul>
                <li><i class="fa-solid fa-circle-check"></i> Chegue com 15 minutos de antecedência.</li>
                <li><i class="fa-solid fa-circle-check"></i> Leve seu RG ou documento com foto.</li>
                <li><i class="fa-solid fa-circle-check"></i> Leve laudos anteriores, se possuir.</li>
                <li><i class="fa-solid fa-circle-check"></i> Caso não compareça, cancele.</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="step-actions">
          <button class="btn-voltar" onclick="voltarInicio()"><i class="fa-solid fa-arrow-left"></i> Voltar ao início</button>
        </div>
      `;
    } else {
      btn.disabled = false;
      btn.textContent = 'Confirmar agendamento';
      mostrarErro(data.erro || 'Erro ao realizar agendamento.');
    }

  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Confirmar agendamento';
    mostrarErro('Erro de conexão com o servidor.');
  }
}

// ── ESPECIALIDADES ───────────────────────────────────

document.querySelectorAll('.specialty-item').forEach(item => {
  item.addEventListener('click', () => {
    abrirModal(item.dataset.especialidade, item.dataset.id);
  });
});