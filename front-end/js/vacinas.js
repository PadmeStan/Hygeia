    
/* ================================
   HYGÉIA — INTERAÇÕES DE VACINAS
================================ */

const carteiraModal = document.querySelector("#carteiraModal");
const modalMemberName = document.querySelector("#modalMemberName");

document.querySelectorAll(".carteira-button").forEach((button) => {
  button.addEventListener("click", () => {
    const member = button.dataset.member;

    modalMemberName.textContent = `Carteira de ${member}`;

    if (!carteiraModal.open) {
      carteiraModal.showModal();
    }
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    carteiraModal.close();
  });
});

carteiraModal.addEventListener("click", (event) => {
  if (event.target === carteiraModal) {
    carteiraModal.close();
  }
});

/* CAMPANHAS */

const campanhaModal = document.querySelector("#campanhaModal");
const campanhaModalTag = document.querySelector("#campanhaModalTag");
const campanhaModalTitle = document.querySelector("#campanhaModalTitle");
const campanhaModalText = document.querySelector("#campanhaModalText");
const campanhaModalInfo = document.querySelector("#campanhaModalInfo");

const campanhasInfo = {
  rosa: {
    tag: "OUTUBRO ROSA",
    titulo: "Cuidado com a saúde da mulher",
    texto:
      "O Outubro Rosa promove a conscientização sobre o câncer de mama, " +
      "a importância do diagnóstico precoce e o acesso às informações de saúde.",
    info:
      "Converse com um profissional de saúde sobre sinais de alerta, " +
      "histórico familiar e exames indicados para o seu caso. " +
      "As recomendações de rastreamento variam conforme a idade e o risco."
  },

  azul: {
    tag: "NOVEMBRO AZUL",
    titulo: "Saúde masculina também importa",
    texto:
      "A campanha incentiva o cuidado integral com a saúde do homem, " +
      "a prevenção de doenças e a busca por atendimento quando necessário.",
    info:
      "Procure a equipe de saúde para conversar sobre prevenção, " +
      "histórico familiar, sintomas e exames adequados à sua situação."
  },

  amarelo: {
    tag: "SETEMBRO AMARELO",
    titulo: "Acolhimento e valorização da vida",
    texto:
      "A campanha amplia o diálogo sobre saúde mental e incentiva " +
      "a procura por apoio sem julgamentos.",
    info:
      "Escutar com atenção, acolher e buscar ajuda profissional são atitudes " +
      "importantes. Em situações de risco imediato, procure um serviço " +
      "de emergência. No Brasil, o CVV atende pelo número 188."
  },

  cancer: {
    tag: "PREVENÇÃO AO CÂNCER",
    titulo: "Informação para cuidar da saúde",
    texto:
      "A prevenção e o diagnóstico precoce podem contribuir para melhores " +
      "resultados no cuidado de diferentes tipos de câncer.",
    info:
      "Evite o tabagismo, mantenha hábitos saudáveis e converse com " +
      "a equipe de saúde sobre vacinação, histórico familiar, sintomas " +
      "e exames recomendados para a sua situação."
  },

  vacina: {
    tag: "IMUNIZAÇÃO",
    titulo: "Vacinas em dia, proteção contínua",
    texto:
      "As vacinas ajudam a prevenir doenças e são importantes em diferentes " +
      "etapas da vida.",
    info:
      "Confira o histórico de vacinação de cada pessoa e consulte o " +
      "Calendário Nacional de Vacinação para confirmar as doses indicadas."
  },

  prevencao: {
    tag: "CONSCIENTIZAÇÃO",
    titulo: "Conhecimento também é prevenção",
    texto:
      "As campanhas de saúde ajudam a divulgar informações confiáveis, " +
      "incentivar o autocuidado e aproximar a população dos serviços de saúde.",
    info:
      "Busque informações em fontes oficiais e converse com os profissionais " +
      "da UBS sobre dúvidas, prevenção e acompanhamento."
  }
};

document.querySelectorAll(".campanha-button").forEach((button) => {
  button.addEventListener("click", () => {
    const campanha = campanhasInfo[button.dataset.campaign];

    if (!campanha) return;

    campanhaModalTag.textContent = campanha.tag;
    campanhaModalTitle.textContent = campanha.titulo;
    campanhaModalText.textContent = campanha.texto;
    campanhaModalInfo.textContent = campanha.info;

    if (!campanhaModal.open) {
      campanhaModal.showModal();
    }
  });
});

document.querySelectorAll("[data-close-campaign]").forEach((button) => {
  button.addEventListener("click", () => {
    campanhaModal.close();
  });
});

campanhaModal.addEventListener("click", (event) => {
  if (event.target === campanhaModal) {
    campanhaModal.close();
  }
});

/* GUIA DE VACINAÇÃO */

const guiaSearch = document.querySelector("#guiaSearch");
const guiaFaixa = document.querySelector("#guiaFaixa");
const guiaResultados = document.querySelector("#guiaResultados");
const guiaItems = [
  ...document.querySelectorAll("#guiaLista .guia-item")
];

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function filtrarGuia() {
  const pesquisa = normalizarTexto(guiaSearch.value);
  const faixa = guiaFaixa.value;

  let encontrados = 0;

  guiaItems.forEach((item) => {
    const texto = normalizarTexto(
      item.textContent + " " + (item.dataset.search || "")
    );

    const faixaItem = item.dataset.faixa;

    const correspondeTexto = texto.includes(pesquisa);
    const correspondeFaixa =
      faixa === "todas" ||
      faixaItem === faixa ||
      faixaItem === "todas";

    const mostrar = correspondeTexto && correspondeFaixa;

    item.hidden = !mostrar;

    if (!mostrar) {
      item.open = false;
    }

    if (mostrar) {
      encontrados++;
    }
  });

  if (encontrados === 0) {
    guiaResultados.textContent =
      "Nenhum tópico encontrado. Experimente outra pesquisa ou faixa etária.";
  } else {
    guiaResultados.textContent =
      encontrados === 1
        ? "1 tópico encontrado."
        : `${encontrados} tópicos encontrados.`;
  }
}

guiaSearch.addEventListener("input", filtrarGuia);
guiaFaixa.addEventListener("change", filtrarGuia);

guiaItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    guiaItems.forEach((outroItem) => {
      if (outroItem !== item) {
        outroItem.open = false;
      }
    });
  });
});

filtrarGuia();