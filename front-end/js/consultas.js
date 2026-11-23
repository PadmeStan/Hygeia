 const tabs = document.querySelectorAll(".tab");
const track = document.querySelector(".tabs-track");
const indicator = document.querySelector(".tabs-indicator");

function updateIndicator(tab) {
  indicator.style.width = `${tab.offsetWidth}px`;
  indicator.style.transform =
    `translateX(${tab.offsetLeft}px)`;
}

tabs.forEach((tab, index) => {

  tab.addEventListener("click", () => {

    tabs.forEach(item => {
      item.classList.remove("active");
    });

    tab.classList.add("active");

    track.classList.toggle(
      "show-exames",
      index === 1
    );

    updateIndicator(tab);

  });

});

// Posição inicial
updateIndicator(document.querySelector(".tab.active"));

window.addEventListener("resize", () => {
  updateIndicator(document.querySelector(".tab.active"));
});


// =====================================================
// CONSULTAS.JS — SISTEMA DE AGENDAMENTO HYGÉIA
// =====================================================

const API = '/api/consultas';

const estado = {
  especialidadeNome: null,
  especialidadeId: null,
  membroId: null,
  membroNome: null,
  ubsSelecionada: null,
  dataSelecionada: null,
  horarioSelecionado: null
};

let calData = new Date();
calData.setDate(1);

// =====================================================
// UTILITÁRIOS
// =====================================================

function mostrarErro(msg) {
  const el = document.getElementById('msg-erro-agendamento');

  if (!el) return;

  el.textContent = msg;
  el.style.display = 'block';

  setTimeout(() => {
    el.style.display = 'none';
  }, 5000);
}

function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

// =====================================================
// MODAL DE MEMBROS
// =====================================================

async function abrirModal(especialidade, idEspecialidade) {
  estado.especialidadeNome = especialidade;
  estado.especialidadeId = idEspecialidade;

  estado.membroId = null;
  estado.membroNome = null;

  const grid = document.getElementById('membros-grid');
  const btnContinuar = document.getElementById('btn-continuar');

  if (!grid || !btnContinuar) return;

  grid.innerHTML = `
    <p style="color:#8299ae;text-align:center">
      Carregando membros...
    </p>
  `;

  btnContinuar.disabled = true;

  document.getElementById('modal-overlay')?.classList.add('aberto');

  try {
    const res = await fetch(`${API}/membros`);

    if (res.status === 401) {
      window.location.href = '/html/index2.html';
      return;
    }

    if (!res.ok) {
      throw new Error('Erro ao carregar membros.');
    }

    const membros = await res.json();

    grid.innerHTML = '';

    if (!membros.length) {
      grid.innerHTML = `
        <p>
          Nenhum membro cadastrado.
          <a href="/html/membros.html">Adicionar membros</a>
        </p>
      `;
      return;
    }

    membros.forEach(m => {
      const partesNome = m.nome.trim().split(' ');

      const item = document.createElement('div');

      item.className = 'membro-item';
      item.dataset.id = m.id;
      item.dataset.nome = m.nome;

      item.innerHTML = `
        <div class="membro-avatar">
          <i>
            <svg xmlns="http://www.w3.org/2000/svg"
              height="60px"
              viewBox="0 -960 960 960"
              width="60px"
              fill="currentColor">
              <path d="M383.48-531.32q-38.61-38.6-38.61-96.65 0-58.05 38.61-96.53 38.6-38.47 96.52-38.47 57.92 0 96.52 38.47 38.61 38.48 38.61 96.53 0 58.05-38.61 96.65-38.6 38.6-96.52 38.6-57.92 0-96.52-38.6ZM180-238.72v-29.23q0-31.28 16.71-55.58 16.7-24.29 43.8-37.34 61.88-28.41 121.07-42.74 59.19-14.34 118.42-14.34 59.23 0 118.22 14.54 58.98 14.54 120.86 42.54 27.51 13.05 44.21 37.34Q780-299.23 780-267.95v29.23q0 21.26-14.89 36.14-14.88 14.89-36.14 14.89H231.03q-21.26 0-36.14-14.89Q180-217.46 180-238.72Z"/>
            </svg>
          </i>
        </div>

        <div class="membro-nome">
          ${partesNome[0]}
        </div>

        <div class="membro-sobrenome">
          ${partesNome.slice(1).join(' ')}
        </div>
      `;

      item.addEventListener('click', () => {
        document.querySelectorAll('.membro-item').forEach(el => {
          el.classList.remove('selecionado');
        });

        item.classList.add('selecionado');

        estado.membroId = m.id;
        estado.membroNome = m.nome;

        btnContinuar.disabled = false;
      });

      grid.appendChild(item);
    });

  } catch (err) {
    grid.innerHTML = `
      <p>
        Erro ao carregar membros.
      </p>
    `;
  }
}

function fecharModal() {
  document.getElementById('modal-overlay')?.classList.remove('aberto');
}

function confirmarMembro() {
  if (!estado.membroId) return;

  fecharModal();
  mostrarAgendamento();
}

// =====================================================
// TELAS E NAVEGAÇÃO
// =====================================================

function mostrarAgendamento() {
  document.getElementById('tela-inicio').style.display = 'none';
  document.getElementById('tela-agendamento').style.display = 'block';

  irParaEtapa(1);
}

function voltarInicio() {
  document.getElementById('tela-inicio').style.display = '';
  document.getElementById('tela-agendamento').style.display = 'none';

  estado.ubsSelecionada = null;
  estado.dataSelecionada = null;
  estado.horarioSelecionado = null;

  const header = document.getElementById('steps-header');

  if (header) {
    header.dataset.progress = '1';
  }

  document.querySelectorAll('.step-tab').forEach(tab => {
    const n = Number(tab.dataset.step);

    tab.classList.toggle('done', n === 0);
    tab.classList.remove('active');
  });

  const btnContinuarUBS = document.getElementById('btn-continuar-ubs');

  if (btnContinuarUBS) {
    btnContinuarUBS.disabled = true;
  }

  const btnContinuarEtapa2 = document.querySelector(
    '#etapa-2 #btn-ir-etapa3'
  );

  if (btnContinuarEtapa2) {
    btnContinuarEtapa2.disabled = true;
  }
}

function irParaEtapa(num) {
  const etapa = document.getElementById(`etapa-${num}`);

  if (!etapa) return;

  if (num === 2 && !estado.ubsSelecionada) {
    mostrarErro('Selecione e confirme uma UBS para continuar.');
    return;
  }

  if (num === 3) {
    if (!estado.ubsSelecionada) {
      mostrarErro('Selecione uma UBS.');
      return;
    }

    if (!estado.dataSelecionada || !estado.horarioSelecionado) {
      mostrarErro('Selecione uma data e um horário.');
      return;
    }
  }

  const header = document.getElementById('steps-header');

  if (header) {
    header.dataset.progress = String(num + 1);
  }

  document.querySelectorAll('.step-tab').forEach(tab => {
    const n = Number(tab.dataset.step);

    tab.classList.toggle('active', n === num);
    tab.classList.toggle('done', n < num);
  });

  document.querySelectorAll('.etapa').forEach(e => {
    e.style.display = 'none';
  });

  etapa.style.display = '';

  if (num === 1) {
    renderUBS();
  }

  if (num === 2) {
    renderEtapa2();
  }

  if (num === 3) {
    renderConfirmacao();
  }
}

function marcarAgendamentoConcluido() {
  const header = document.getElementById('steps-header');

  if (header) {
    header.dataset.progress = '4';
  }

  document.querySelectorAll('.step-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.classList.add('done');
  });
}

// =====================================================
// ETAPA 1 — SELECIONAR UBS
// =====================================================

async function renderUBS() {
  const grid = document.getElementById('ubs-grid');
  const btnContinuar = document.getElementById('btn-continuar-ubs');

  if (!grid) return;

  // O botão só fica habilitado se já existir uma UBS selecionada.
  if (btnContinuar) {
    btnContinuar.disabled = !estado.ubsSelecionada;
  }

  grid.innerHTML = `
    <p>
      Carregando UBS...
    </p>
  `;

  try {
    const res = await fetch(
      `${API}/ubs?especialidade_id=${estado.especialidadeId}`
    );

    if (!res.ok) {
      throw new Error('Erro ao carregar UBS.');
    }

    const lista = await res.json();

    grid.innerHTML = '';

    if (!lista.length) {
      grid.innerHTML = `
        <p>
          Nenhuma UBS encontrada para essa especialidade.
        </p>
      `;
      return;
    }

    lista.forEach((ubs, idx) => {
      const card = document.createElement('div');

      card.className = 'ubs-card';

      if (estado.ubsSelecionada?.id === ubs.id) {
        card.classList.add('selecionada');
      }

      card.innerHTML = `
        <div class="ubs-card-header">
          <span class="ubs-nome">${ubs.nome}</span>

          ${idx === 0
            ? '<span class="badge-proxima">MAIS PRÓXIMA</span>'
            : ''
          }
        </div>

        <p class="ubs-endereco">
          ${ubs.endereco || 'Endereço não informado'}
        </p>

        <div class="ubs-actions">
          <button class="btn-mapa">
            <i class="fa-solid fa-location-dot"></i>
            Ver no mapa
          </button>

          <button class="btn-confirmar-ubs">
            Confirmar
          </button>
        </div>
      `;

      // CONFIRMAR: seleciona a UBS, mas não muda de etapa.
      card.querySelector('.btn-confirmar-ubs').addEventListener('click', () => {
        estado.ubsSelecionada = ubs;
        estado.dataSelecionada = null;
        estado.horarioSelecionado = null;

        // Remove a seleção dos outros cards.
        document.querySelectorAll('.ubs-card').forEach(c => {
          c.classList.remove('selecionada');
        });

        // Destaca o card selecionado.
        card.classList.add('selecionada');

        // Habilita o botão Continuar.
        if (btnContinuar) {
          btnContinuar.disabled = false;
        }
      });

      card.querySelector('.btn-mapa').addEventListener('click', () => {
        const q = encodeURIComponent(ubs.endereco || ubs.nome);

        window.open(
          `https://www.google.com/maps/search/?api=1&query=${q}`,
          '_blank'
        );
      });

      grid.appendChild(card);
    });

  } catch (err) {
    grid.innerHTML = `
      <p>
        Erro ao carregar UBS.
      </p>
    `;
  }
}

// =====================================================
// ETAPA 2 — DATA E HORÁRIO
// =====================================================

function renderEtapa2() {
  const ubs = estado.ubsSelecionada;

  if (!ubs) {
    irParaEtapa(1);
    return;
  }

  document.getElementById('ubs-detalhe').innerHTML = `
    <div class="ubs-foto">
      <i class="fa-solid fa-hospital"></i>
    </div>

    <div>
      <div class="ubs-info-titulo">
        ${ubs.nome}
      </div>

      <div class="ubs-info-label">
        Endereço
      </div>

      <div class="ubs-info-val">
        ${ubs.endereco || '—'}
      </div>

      <div class="ubs-info-label">
        Horário de Funcionamento
      </div>

      <div class="ubs-info-val">
        ${ubs.funcionamento || '—'}
      </div>
    </div>
  `;

  renderCalendario();
  carregarHorarios();
}

async function carregarHorarios() {
  const lista = document.getElementById('horarios-lista');

  if (!lista) return;

  if (!estado.dataSelecionada) {
    lista.innerHTML = `
      <span>
        Selecione uma data para visualizar os horários.
      </span>
    `;

    atualizarBtnEtapa3();
    return;
  }

  lista.innerHTML = `
    <span>
      Carregando horários...
    </span>
  `;

  const dataISO = formatarDataISO(estado.dataSelecionada);

  try {
    const res = await fetch(
      `${API}/horarios?ubs_id=${estado.ubsSelecionada.id}&especialidade_id=${estado.especialidadeId}&data=${dataISO}`
    );

    if (!res.ok) {
      throw new Error('Erro ao carregar horários.');
    }

    const horarios = await res.json();

    lista.innerHTML = '';

    if (!horarios.length) {
      lista.innerHTML = `
        <span>
          Nenhum horário disponível nesta data.
        </span>
      `;

      estado.horarioSelecionado = null;
      atualizarBtnEtapa3();
      return;
    }

    if (!horarios.includes(estado.horarioSelecionado)) {
      estado.horarioSelecionado = null;
    }

    horarios.forEach(h => {
      const btn = document.createElement('button');

      btn.className = 'btn-horario';
      btn.textContent = h;

      if (estado.horarioSelecionado === h) {
        btn.classList.add('selecionado');
      }

      btn.addEventListener('click', () => {
        estado.horarioSelecionado = h;

        document.querySelectorAll('.btn-horario').forEach(b => {
          b.classList.remove('selecionado');
        });

        btn.classList.add('selecionado');

        atualizarBtnEtapa3();
      });

      lista.appendChild(btn);
    });

  } catch (err) {
    lista.innerHTML = `
      <span>
        Erro ao carregar horários.
      </span>
    `;

    estado.horarioSelecionado = null;
  }

  atualizarBtnEtapa3();
}

// =====================================================
// BOTÃO DE AVANÇAR PARA CONFIRMAÇÃO
// =====================================================

function atualizarBtnEtapa3() {
  const btn = document.querySelector(
    '#etapa-2 #btn-ir-etapa3'
  );

  if (!btn) return;

  btn.disabled = !(
    estado.ubsSelecionada &&
    estado.dataSelecionada &&
    estado.horarioSelecionado
  );
}

// =====================================================
// CALENDÁRIO
// =====================================================

function renderCalendario() {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março',
    'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro',
    'Outubro', 'Novembro', 'Dezembro'
  ];

  const titulo = document.getElementById('cal-mes-ano');
  const container = document.getElementById('cal-dias');

  if (!titulo || !container) return;

  titulo.textContent =
    `${meses[calData.getMonth()]} ${calData.getFullYear()}`;

  container.innerHTML = '';

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const primeiroDia = new Date(
    calData.getFullYear(),
    calData.getMonth(),
    1
  ).getDay();

  const totalDias = new Date(
    calData.getFullYear(),
    calData.getMonth() + 1,
    0
  ).getDate();

  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement('div');

    vazio.className = 'cal-dia vazio';

    container.appendChild(vazio);
  }

  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(
      calData.getFullYear(),
      calData.getMonth(),
      d
    );

    const btn = document.createElement('div');

    btn.className = 'cal-dia';
    btn.textContent = d;

    const diaSemana = data.getDay();

    const passado = data < hoje;
    const fimSemana = diaSemana === 0 || diaSemana === 6;

    if (passado || fimSemana) {
      btn.classList.add('passado');
    } else {
      if (data.toDateString() === hoje.toDateString()) {
        btn.classList.add('hoje');
      }

      if (
        estado.dataSelecionada?.toDateString() === data.toDateString()
      ) {
        btn.classList.add('selecionado');
      }

      btn.addEventListener('click', () => {
        estado.dataSelecionada = data;
        estado.horarioSelecionado = null;

        atualizarBtnEtapa3();

        renderCalendario();
        carregarHorarios();
      });
    }

    container.appendChild(btn);
  }
}

// Navegação do calendário

document.getElementById('cal-prev')?.addEventListener('click', () => {
  calData.setMonth(calData.getMonth() - 1);
  renderCalendario();
});

document.getElementById('cal-next')?.addEventListener('click', () => {
  calData.setMonth(calData.getMonth() + 1);
  renderCalendario();
});

// =====================================================
// ETAPA 3 — REVISÃO DO AGENDAMENTO
// =====================================================

function renderConfirmacao() {
  const d = estado.dataSelecionada;

  const dataFormatada = d
    ? d.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '—';

  document.getElementById('confirmacao-detalhes').innerHTML = `
    <h3>
      <i class="fa-regular fa-calendar-check"></i>
      Detalhes da consulta
    </h3>

    <div class="detalhe-item">
      <div class="detalhe-label">Paciente</div>
      <div class="detalhe-valor">
        ${estado.membroNome || '—'}
      </div>
    </div>

    <div class="detalhe-item">
      <div class="detalhe-label">Unidade</div>
      <div class="detalhe-valor">
        ${estado.ubsSelecionada?.nome || '—'}
      </div>
    </div>

    <div class="detalhe-item">
      <div class="detalhe-label">Especialidade</div>
      <div class="detalhe-valor">
        ${estado.especialidadeNome || '—'}
      </div>
    </div>

    <div class="detalhe-item">
      <div class="detalhe-label">Data</div>
      <div class="detalhe-valor">
        ${dataFormatada}
      </div>
    </div>

    <div class="detalhe-item">
      <div class="detalhe-label">Horário</div>
      <div class="detalhe-valor">
        ${estado.horarioSelecionado || '—'}
      </div>
    </div>
  `;

  const btnConfirmar = document.getElementById(
    'btn-confirmar-agendamento'
  );

  if (btnConfirmar) {
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = 'Confirmar agendamento';
    btnConfirmar.onclick = confirmarAgendamento;
  }
}

// =====================================================
// FINALIZAR AGENDAMENTO
// =====================================================

async function confirmarAgendamento() {
  const btn = document.getElementById('btn-confirmar-agendamento');

  if (
    !estado.membroId ||
    !estado.ubsSelecionada ||
    !estado.dataSelecionada ||
    !estado.horarioSelecionado
  ) {
    mostrarErro('Confira os dados antes de confirmar o agendamento.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Aguarde...';

  const dataISO = formatarDataISO(estado.dataSelecionada);

  try {
    const res = await fetch(API, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        membro_id: estado.membroId,
        ubs_id: estado.ubsSelecionada.id,
        especialidade_id: estado.especialidadeId,
        data: dataISO,
        hora: estado.horarioSelecionado
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao realizar agendamento.');
    }

    marcarAgendamentoConcluido();

    const dataFormatada = estado.dataSelecionada.toLocaleDateString(
      'pt-BR',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );

    document.getElementById('etapa-3').innerHTML = `
      <div class="confirmacao-box">

        <div class="confirmacao-sucesso">
          <h2>
            Confirmação recebida!
            <i class="fa-solid fa-circle-check"></i>
          </h2>

          <p>
            Estamos felizes em atendê-lo(a) e aguardamos você
            na data e horário agendados. Caso precise de alguma
            informação adicional ou queira reagendar, entre em
            contato com nossa equipe.
          </p>
        </div>

        <div class="confirmacao-bottom">

          <div class="confirmacao-detalhes">
            <h3>
              <i class="fa-regular fa-calendar-check"></i>
              Detalhes da consulta
            </h3>

            <div class="detalhe-item">
              <div class="detalhe-label">Paciente</div>
              <div class="detalhe-valor">
                ${estado.membroNome}
              </div>
            </div>

            <div class="detalhe-item">
              <div class="detalhe-label">Unidade</div>
              <div class="detalhe-valor">
                ${estado.ubsSelecionada.nome}
              </div>
            </div>

            <div class="detalhe-item">
              <div class="detalhe-label">Especialidade</div>
              <div class="detalhe-valor">
                ${estado.especialidadeNome}
              </div>
            </div>

            <div class="detalhe-item">
              <div class="detalhe-label">Data</div>
              <div class="detalhe-valor">
                ${dataFormatada}
              </div>
            </div>

            <div class="detalhe-item">
              <div class="detalhe-label">Horário</div>
              <div class="detalhe-valor">
                ${estado.horarioSelecionado}
              </div>
            </div>
          </div>

          <div class="proximos-passos">
            <h4>
              <i class="ti ti-bell"></i>
              Próximos passos
            </h4>

            <ul>
              <li>
                <i class="fa-solid fa-circle-check"></i>
                Chegue com 15 minutos de antecedência.
              </li>

              <li>
                <i class="fa-solid fa-circle-check"></i>
                Leve seu RG ou documento com foto.
              </li>

              <li>
                <i class="fa-solid fa-circle-check"></i>
                Leve laudos anteriores, se possuir.
              </li>

              <li>
                <i class="fa-solid fa-circle-check"></i>
                Caso não possa comparecer, entre em contato
                para cancelar.
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div class="step-actions">
        <button class="btn-voltar" onclick="voltarInicio()">
          <i class="fa-solid fa-arrow-left"></i>
          Voltar ao início
        </button>
      </div>
    `;

  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Confirmar agendamento';

    mostrarErro(
      err.message || 'Erro de conexão com o servidor.'
    );
  }
}

// =====================================================
// EVENTOS INICIAIS
// =====================================================

document.getElementById('modal-overlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) {
    fecharModal();
  }
});

document.querySelectorAll('.specialty-item').forEach(item => {
  item.addEventListener('click', () => {
    abrirModal(
      item.dataset.especialidade,
      item.dataset.id
    );
  });
});