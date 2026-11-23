document.addEventListener('DOMContentLoaded', () => {

  const bancoDeDados = {
    encaminhamentos: [
      {
        id: 101,
        titulo: "Encaminhamento Cardiologia",
        data: "12/10/2026",
        medico: "Dr. Carlos Eduardo (CRM 45678)",
        especialidade: "Cardiologia",
        motivo: "Avaliação de sopro sistólico e rotina de pré-operatório.",
        prioridade: "Média"
      },
      {
        id: 102,
        titulo: "Encaminhamento Oftalmológico",
        data: "05/09/2026",
        medico: "Dra. Fernanda Lima (CRM 89123)",
        especialidade: "Oftalmologia",
        motivo: "Miopia e queixa de cefaleia pós-leitura.",
        prioridade: "Baixa"
      }
    ],
    receitas: [
      {
        id: 201,
        titulo: "Receita Medicamentos Contínuos",
        data: "15/10/2026",
        medico: "Dr. Roberto Silva (CRM 12345)",
        medicamentos: ["Losartana 50mg - 1x ao dia", "Omeprazol 20mg - Em jejum"],
        validade: "180 dias"
      }
    ],
    exames: [
      {
        id: 301,
        titulo: "Hemograma completo",
        data: "01/10/2026",
        laboratorio: "Lab Saúde Central",
        status: "Concluído",
        detalhes: "Hemoglobina: 14.2 g/dL | Leucócitos: 6.500/mm³"
      },
      {
        id: 302,
        titulo: "Exame de glicemia",
        data: "04/10/2026",
        laboratorio: "Lab Saúde Central",
        status: "Concluído",
        detalhes: "Glicemia em Jejum: 88 mg/dL (Normal)"
      }
    ],
    atestados: []
  };

  let categoriaAtual = null;

  const pastaBtns = document.querySelectorAll('.pasta-item');
  const painel = document.querySelector('.documentos-painel');
  const dadosTitulo = document.getElementById('dados-titulo');
  const dadosContador = document.getElementById('dados-contador');
  const listaDocs = document.getElementById('lista-documentos');
  const inputFiltro = document.getElementById('input-filtro-doc');

  const modal = document.getElementById('modal-dados');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalCorpo = document.getElementById('modal-corpo');
  const btnCloseModal = document.getElementById('btn-close-modal');

  // Clique em uma pasta
  pastaBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Ativa barra sob legenda e estilos do card
      pastaBtns.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      categoriaAtual = btn.dataset.categoria;

      // Exibe e Anima o painel oculto
      painel.classList.remove('ativo');
      void painel.offsetWidth; // Força re-flow para reiniciar a animação CSS
      painel.classList.add('ativo');

      renderizarDocumentos();
    });
  });

  // Renderização condicional dos documentos
  function renderizarDocumentos(filtro = '') {
    if (!categoriaAtual) return;

    const docs = bancoDeDados[categoriaAtual] || [];
    const docsFiltrados = docs.filter(d => 
      d.titulo.toLowerCase().includes(filtro.toLowerCase())
    );

    const titulosFormatados = {
      encaminhamentos: 'Encaminhamentos',
      receitas: 'Receitas Médicas',
      exames: 'Exames',
      atestados: 'Atestados'
    };

    dadosTitulo.textContent = titulosFormatados[categoriaAtual] || categoriaAtual;
    dadosContador.textContent = `${docsFiltrados.length} documento(s) encontrado(s)`;

    listaDocs.innerHTML = '';

    if (docsFiltrados.length === 0) {
      listaDocs.innerHTML = `
        <div class="lista-vazia">
          <h1>Sem documentos aqui!</h1>
          <p>Nenhum arquivo ou documento registrado na pasta de ${titulosFormatados[categoriaAtual] || 'categoria'}.</p>
        </div>
      `;
      return;
    }

    docsFiltrados.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'doc-card';
      card.innerHTML = `
        <div class="doc-info">
          <h4>${doc.titulo}</h4>
          <p>Solicitação / Data: ${doc.data}</p>
        </div>
        <div class="doc-acoes">
          <button class="btn-doc btn-ver-dados" data-id="${doc.id}">Ver dados</button>
          <button class="btn-doc primary btn-ver-pdf" data-id="${doc.id}">Ver PDF</button>
          <button class="btn-doc btn-baixar-pdf" data-id="${doc.id}">Baixar PDF</button>
        </div>
      `;

      listaDocs.appendChild(card);
    });

    atribuirEventosBotoes();
  }

  if (inputFiltro) {
    inputFiltro.addEventListener('input', (e) => {
      renderizarDocumentos(e.target.value);
    });
  }

  function atribuirEventosBotoes() {
    document.querySelectorAll('.btn-ver-dados').forEach(btn => {
      btn.addEventListener('click', (e) => abrirModalDados(e.target.dataset.id));
    });

    document.querySelectorAll('.btn-ver-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => manipularPDF(e.target.dataset.id, 'abrir'));
    });

    document.querySelectorAll('.btn-baixar-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => manipularPDF(e.target.dataset.id, 'baixar'));
    });
  }

  function encontrarDocPorId(id) {
    for (let cat in bancoDeDados) {
      const achado = bancoDeDados[cat].find(d => d.id == id);
      if (achado) return achado;
    }
    return null;
  }

  function abrirModalDados(id) {
    const doc = encontrarDocPorId(id);
    if (!doc) return;

    modalTitulo.textContent = doc.titulo;
    let htmlContent = `<p><strong>Data de Emissão:</strong> ${doc.data}</p>`;

    for (let chave in doc) {
      if (!['id', 'titulo', 'data'].includes(chave)) {
        const rotulo = chave.charAt(0).toUpperCase() + chave.slice(1);
        const valor = Array.isArray(doc[chave]) ? doc[chave].join(', ') : doc[chave];
        htmlContent += `<p><strong>${rotulo}:</strong> ${valor}</p>`;
      }
    }

    modalCorpo.innerHTML = htmlContent;
    modal.classList.add('open');
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => modal.classList.remove('open'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  function manipularPDF(id, acao) {
    const doc = encontrarDocPorId(id);
    if (!doc) return;

    const conteudoSimulado = `
      =======================================================
      PLATAFORMA HYGÉIA - DOCUMENTO MÉDICO DIGITAL
      =======================================================

      TÍTULO: ${doc.titulo.toUpperCase()}
      DATA DA EMISSÃO: ${doc.data}

      INFORMAÇÕES REGISTRADAS:
      ${JSON.stringify(doc, null, 4)}

      =======================================================
      Código de Autenticidade: HYG-${Math.random().toString(36).substring(2, 9).toUpperCase()}
      =======================================================
    `;

    const blob = new Blob([conteudoSimulado], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    if (acao === 'abrir') {
      window.open(url, '_blank');
    } else if (acao === 'baixar') {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.titulo.toLowerCase().replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
});