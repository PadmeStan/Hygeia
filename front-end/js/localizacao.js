
/* =========================================
   HYGÉIA — SISTEMA DE LOCALIZAÇÃO DE UBS
========================================= */


/* =========================================
   1. DADOS DAS UNIDADES
========================================= */

const locUnidades = [

  {
    id: 1,
    nome: "UBS DO PINDAÍ-PAÇO",
    municipio: "Paço do Lumiar",
    endereco: "CVXF+JQ Pindaí, Paço do Lumiar - MA",
    horario: "Segunda a sexta, 8h às 17h",
    latitude: -2.5509374,
    longitude: -44.1255626,
    servicos: [
      "Clínica Geral",
      "Dentista",
      "Enfermagem",
      "Vacinação",
      "Curativos"
    ]
  },

  {
    id: 2,
    nome: "UBS de demonstração — Cohab",
    municipio: "São Luís",
    endereco: "Endereço demonstrativo, Cohab",
    horario: "Segunda a sexta, 7h às 17h",
    latitude: -2.5320,
    longitude: -44.2200,
    servicos: [
      "Clínica Geral",
      "Enfermagem",
      "Exames laboratoriais",
      "Vacinação",
      "Curativos"
    ]
  },

  {
    id: 3,
    nome: "UBS de demonstração — Ribamar",
    municipio: "São José de Ribamar",
    endereco: "Endereço demonstrativo, São José de Ribamar",
    horario: "Segunda a sexta, 7h às 18h",
    latitude: -2.5610,
    longitude: -44.0540,
    servicos: [
      "Clínica Geral",
      "Pediatria",
      "Odontologia",
      "Pré-natal",
      "Ginecologia",
      "Vacinação"
    ]
  },

  {
    id: 4,
    nome: "UBS de demonstração — Paço",
    municipio: "Paço do Lumiar",
    endereco: "Endereço demonstrativo, Paço do Lumiar",
    horario: "Segunda a sexta, 7h às 17h",
    latitude: -2.5160,
    longitude: -44.1010,
    servicos: [
      "Clínica Geral",
      "Pediatria",
      "Nutrição",
      "Enfermagem",
      "Curativos"
    ]
  },

  {
    id: 5,
    nome: "UBS de demonstração — Raposa",
    municipio: "Raposa",
    endereco: "Endereço demonstrativo, Raposa",
    horario: "Segunda a sexta, 7h às 16h",
    latitude: -2.4280,
    longitude: -44.0970,
    servicos: [
      "Clínica Geral",
      "Enfermagem",
      "Vacinação",
      "Exames laboratoriais",
      "Curativos"
    ]
  }

];


/* =========================================
   2. ELEMENTOS HTML
========================================= */

const locServico = document.getElementById("locServico");
const locMunicipio = document.getElementById("locMunicipio");

const locBuscar = document.getElementById("locBuscar");
const locMinhaPosicao = document.getElementById("locMinhaPosicao");
const locDefinirMapa = document.getElementById("locDefinirMapa");
const locVerMapa = document.getElementById("locVerMapa");

const locLimpar = document.getElementById("locLimpar");
const locNovaBusca = document.getElementById("locNovaBusca");

const locCards = document.getElementById("locCards");
const locContagem = document.getElementById("locContagem");
const locResumo = document.getElementById("locResumo");

const locFeedback = document.getElementById("locFeedback");
const locVazio = document.getElementById("locVazio");

const locMapaDescricao = document.getElementById("locMapaDescricao");


/* =========================================
   3. VARIÁVEIS DO SISTEMA
========================================= */

let locUsuario = null;

let locUnidadeSelecionada = null;

let locBuscaRealizada = false;

let locModoSelecao = false;

let locMarcadores = new Map();

let locMarcadorUsuario = null;


/* =========================================
   4. CONFIGURAÇÃO DO MAPA
========================================= */

const locMapa = L.map("locMapa", {
  zoomControl: true,
  scrollWheelZoom: false
}).setView([-2.53, -44.20], 10);


L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',

    maxZoom: 19
  }
).addTo(locMapa);


/* =========================================
   5. ÍCONES DOS MARCADORES
========================================= */

const locIconeUBS = L.divIcon({

  className: "",

  html: `
    <div class="loc-marker">
      <span>+</span>
    </div>
  `,

  iconSize: [36, 36],

  iconAnchor: [18, 36],

  popupAnchor: [0, -34]

});


const locIconeUsuario = L.divIcon({

  className: "",

  html: `
    <div class="loc-marker loc-marker-user">
      <span>●</span>
    </div>
  `,

  iconSize: [36, 36],

  iconAnchor: [18, 36]

});


/* =========================================
   6. CÁLCULO DE DISTÂNCIA
========================================= */

function locDistancia(lat1, lon1, lat2, lon2) {

  const raio = 6371;

  const rad = valor => valor * Math.PI / 180;

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +

    Math.cos(rad(lat1)) *
    Math.cos(rad(lat2)) *

    Math.sin(dLon / 2) ** 2;

  return 2 * raio * Math.asin(
    Math.sqrt(Math.min(1, a))
  );

}


function locFormatarDistancia(distancia) {

  if (distancia == null) {
    return "Distância não calculada";
  }

  if (distancia < 1) {

    return `${Math.round(distancia * 1000)} m em linha reta`;

  }

  return `${distancia.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })} km em linha reta`;

}


/* =========================================
   7. NORMALIZAÇÃO DE TEXTOS
========================================= */

function locNormalizar(texto) {

  return String(texto ?? "")

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "")

    .toLocaleLowerCase("pt-BR")

    .trim();

}


/* =========================================
   8. FILTROS DE PESQUISA
========================================= */

function locObterResultados() {

  const servico = locNormalizar(locServico.value);

  const municipio = locNormalizar(locMunicipio.value);

  return locUnidades

    .filter(unidade => {

      const municipioCorresponde =
        !municipio ||
        locNormalizar(unidade.municipio) === municipio;


      const servicoCorresponde =
        !servico ||

        unidade.servicos.some(item => {

          const nomeServico = locNormalizar(item);

          if (
            servico === "odontologia" &&
            nomeServico === "dentista"
          ) {
            return true;
          }

          return nomeServico === servico;

        });


      return municipioCorresponde && servicoCorresponde;

    })

    .map(unidade => ({

      ...unidade,

      distancia: locUsuario

        ? locDistancia(
            locUsuario.lat,
            locUsuario.lng,
            unidade.latitude,
            unidade.longitude
          )

        : null

    }))

    .sort((a, b) => {

      if (a.distancia == null) return 0;

      if (b.distancia == null) return 0;

      return a.distancia - b.distancia;

    });

}


/* =========================================
   9. CRIAÇÃO DE ELEMENTOS
========================================= */

function locCriarElemento(tag, classe, texto) {

  const elemento = document.createElement(tag);

  if (classe) {
    elemento.className = classe;
  }

  if (texto != null) {
    elemento.textContent = texto;
  }

  return elemento;

}


function locCriarBotao(texto, classe, acao) {

  const botao = locCriarElemento(
    "button",
    classe,
    texto
  );

  botao.type = "button";

  botao.addEventListener("click", acao);

  return botao;

}


/* =========================================
   10. RENDERIZAÇÃO DOS CARDS
========================================= */

function locRenderizarCards(unidades) {

  locCards.replaceChildren();

  locVazio.hidden = unidades.length !== 0;


  locContagem.textContent =
    `${unidades.length} ${
      unidades.length === 1 ? "unidade" : "unidades"
    }`;


  unidades.forEach(unidade => {

    const card = locCriarElemento(

      "article",

      "loc-card" +

      (
        unidade.id === locUnidadeSelecionada
          ? " loc-card-active"
          : ""
      )

    );


    /* TOPO DO CARD */

    const topo = locCriarElemento(
      "div",
      "loc-card-top"
    );


    const icone = locCriarElemento(
      "div",
      "loc-card-pin",
      "+"
    );


    const titulo = locCriarElemento(
      "div",
      "loc-card-title"
    );


    titulo.append(

      locCriarElemento(
        "h5",
        "",
        unidade.nome
      ),

      locCriarElemento(
        "p",
        "",
        `${unidade.municipio} · ${unidade.endereco}`
      ),

      locCriarElemento(

        "span",

        "loc-distance",

        locUsuario

          ? locFormatarDistancia(unidade.distancia)

          : "Defina sua localização para calcular a distância"

      )

    );


    topo.append(icone, titulo);

    card.append(topo);


    /* SERVIÇOS */

    const tags = locCriarElemento(
      "div",
      "loc-card-tags"
    );


    unidade.servicos.forEach(servico => {

      tags.append(

        locCriarElemento(
          "span",
          "",
          servico
        )

      );

    });


    card.append(tags);


    /* HORÁRIOS */

    card.append(

      locCriarElemento(

        "p",

        "loc-card-hours",

        `Horário informado: ${unidade.horario}`

      )

    );


    /* AÇÕES */

    const acoes = locCriarElemento(
      "div",
      "loc-card-actions"
    );


    const botaoMapa = locCriarBotao(

      "Ver no mapa",

      "",

      () => {
        locSelecionarUnidade(unidade);
      }

    );


    acoes.append(botaoMapa);


    /* ROTA */

    const rota = locCriarElemento(
      "a",
      "loc-route",
      "Como chegar"
    );


    const destino =
      `${unidade.latitude},${unidade.longitude}`;


    rota.href = locUsuario

      ? `https://www.google.com/maps/dir/?api=1&origin=${locUsuario.lat},${locUsuario.lng}&destination=${destino}&travelmode=driving`

      : `https://www.google.com/maps/dir/?api=1&destination=${destino}`;


    rota.target = "_blank";

    rota.rel = "noopener noreferrer";


    acoes.append(rota);

    card.append(acoes);


    /* SELEÇÃO DO CARD */

    card.addEventListener("click", evento => {

      if (evento.target.closest("button, a")) {
        return;
      }

      locSelecionarUnidade(unidade);

    });


    locCards.append(card);

  });


  /* RESUMO */

  if (unidades.length) {

    locResumo.textContent = locUsuario

      ? "Unidades ordenadas pela distância em linha reta."

      : "Selecione uma unidade ou defina sua localização no mapa.";

  } else {

    locResumo.textContent =
      "Nenhuma unidade corresponde aos filtros selecionados.";

  }

}


/* =========================================
   11. ATUALIZAÇÃO DOS MARCADORES
========================================= */

function locAtualizarMarcadores(unidades) {


  /* REMOVER MARCADORES ANTIGOS */

  locMarcadores.forEach(marcador => {

    locMapa.removeLayer(marcador);

  });

  locMarcadores.clear();


  /* MARCADORES DAS UBS */

  unidades.forEach((unidade, indice) => {

    const marcador = L.marker(

      [
        unidade.latitude,
        unidade.longitude
      ],

      {
        icon: locIconeUBS
      }

    );


    marcador.bindPopup(

      `<strong>${indice + 1}. ${locEscaparHTML(unidade.nome)}</strong><br>` +

      `${locEscaparHTML(unidade.municipio)}<br>` +

      `${locEscaparHTML(unidade.endereco)}`

    );


    marcador.on("click", () => {

      locUnidadeSelecionada = unidade.id;

      locRenderizarCards(locObterResultados());

      locFeedback.textContent =
        `Unidade selecionada: ${unidade.nome}.`;

    });


    marcador.addTo(locMapa);

    locMarcadores.set(unidade.id, marcador);

  });


  /* REMOVER LOCALIZAÇÃO ANTERIOR */

  if (locMarcadorUsuario) {

    locMapa.removeLayer(locMarcadorUsuario);

    locMarcadorUsuario = null;

  }


  /* MARCADOR DO USUÁRIO */

  if (locUsuario) {

    locMarcadorUsuario = L.marker(

      [
        locUsuario.lat,
        locUsuario.lng
      ],

      {
        icon: locIconeUsuario
      }

    ).bindPopup("Sua localização");


    locMarcadorUsuario.addTo(locMapa);

  }


  /* AJUSTAR VISUALIZAÇÃO */

  if (unidades.length) {

    const pontos = unidades.map(unidade => [

      unidade.latitude,
      unidade.longitude

    ]);


    if (locUsuario) {

      pontos.push([
        locUsuario.lat,
        locUsuario.lng
      ]);

    }


    if (pontos.length === 1) {

      locMapa.setView(pontos[0], 14);

    } else {

      locMapa.fitBounds(pontos, {

        padding: [35, 35],

        maxZoom: 13

      });

    }

  } else if (locUsuario) {

    locMapa.setView(
      [locUsuario.lat, locUsuario.lng],
      13
    );

  }

}


/* =========================================
   12. PROTEÇÃO DE HTML
========================================= */

function locEscaparHTML(texto) {

  return String(texto).replace(/[&<>"']/g, caractere => ({

    "&": "&amp;",

    "<": "&lt;",

    ">": "&gt;",

    '"': "&quot;",

    "'": "&#39;"

  })[caractere]);

}


/* =========================================
   13. SELECIONAR UMA UBS
========================================= */

function locSelecionarUnidade(unidade) {

  locUnidadeSelecionada = unidade.id;


  locMapa.setView(

    [
      unidade.latitude,
      unidade.longitude
    ],

    15,

    {
      animate: true
    }

  );


  const marcador = locMarcadores.get(unidade.id);

  if (marcador) {

    marcador.openPopup();

  }


  locRenderizarCards(
    locObterResultados()
  );


  locFeedback.textContent =
    `Unidade selecionada: ${unidade.nome}.`;

}


/* =========================================
   14. EXECUTAR PESQUISA
========================================= */

function locPesquisar(mensagem = true) {

  locBuscaRealizada = true;

  const resultados = locObterResultados();


  locRenderizarCards(resultados);

  locAtualizarMarcadores(resultados);


  if (mensagem) {

    locFeedback.textContent = resultados.length

      ? `${resultados.length} unidade(s) encontrada(s).`

      : "Nenhuma unidade encontrada para os filtros selecionados.";

  }

}


/* =========================================
   15. LOCALIZAÇÃO MANUAL
========================================= */

function locDefinirPosicaoManual(lat, lng) {

  locUsuario = {

    lat: lat,

    lng: lng

  };


  locModoSelecao = false;


  /* RESTAURAR MAPA */

  locMapa.getContainer().style.cursor = "";


  /* ATUALIZAR BOTÃO */

  locDefinirMapa.classList.remove("loc-selecting");


  /* ATUALIZAR DESCRIÇÃO */

  locMapaDescricao.textContent =
    "Localização definida manualmente. Clique novamente para alterar.";


  /* ATUALIZAR RESULTADOS */

  locPesquisar(false);


  locFeedback.textContent =
    "Localização definida! As UBS foram organizadas por proximidade.";


}


/* =========================================
   16. ATIVAR SELEÇÃO NO MAPA
========================================= */

locDefinirMapa.addEventListener("click", () => {


  if (locModoSelecao) {

    locModoSelecao = false;

    locMapa.getContainer().style.cursor = "";

    locDefinirMapa.classList.remove("loc-selecting");

    locMapaDescricao.textContent =
      "Seleção cancelada. Você pode selecionar uma unidade.";

    locFeedback.textContent =
      "Seleção de localização cancelada.";

    return;

  }


  locModoSelecao = true;


  locMapa.getContainer().style.cursor = "crosshair";


  locDefinirMapa.classList.add("loc-selecting");


  locMapaDescricao.textContent =
    "Clique no ponto do mapa que representa sua localização.";


  locFeedback.textContent =
    "Modo de seleção ativado. Clique no mapa para definir sua localização.";


  locMapa.invalidateSize();


});


/* =========================================
   17. CLIQUE NO MAPA
========================================= */

locMapa.on("click", evento => {


  if (!locModoSelecao) {
    return;
  }


  const lat = evento.latlng.lat;

  const lng = evento.latlng.lng;


  locDefinirPosicaoManual(lat, lng);

});


/* =========================================
   18. LOCALIZAÇÃO AUTOMÁTICA
========================================= */

locMinhaPosicao.addEventListener("click", () => {


  if (!("geolocation" in navigator)) {

    locFeedback.textContent =
      "Seu navegador não oferece suporte à localização.";

    return;

  }


  locMinhaPosicao.disabled = true;

  locMinhaPosicao.textContent =
    "Obtendo localização...";


  locFeedback.textContent =
    "Aguardando autorização para acessar sua localização.";


  navigator.geolocation.getCurrentPosition(

    posicao => {


      locUsuario = {

        lat: posicao.coords.latitude,

        lng: posicao.coords.longitude

      };


      locMinhaPosicao.disabled = false;

      locMinhaPosicao.textContent =
        "Atualizar minha localização";


      locModoSelecao = false;

      locMapa.getContainer().style.cursor = "";

      locDefinirMapa.classList.remove("loc-selecting");


      locMapaDescricao.textContent =
        "Localização obtida automaticamente.";


      locPesquisar(false);


      locFeedback.textContent =
        "Localização obtida! As unidades foram organizadas por proximidade aproximada.";

    },


    erro => {


      locMinhaPosicao.disabled = false;

      locMinhaPosicao.textContent =
        "Tentar novamente";


      const mensagens = {

        1: "Permissão negada. Você pode definir sua localização manualmente no mapa.",

        2: "Não foi possível determinar sua posição. Tente novamente.",

        3: "A solicitação demorou demais. Verifique sua conexão e tente novamente."

      };


      locFeedback.textContent =
        mensagens[erro.code] ||
        "Não foi possível obter sua localização.";


    },


    {

      enableHighAccuracy: true,

      timeout: 15000,

      maximumAge: 60000

    }

  );

});


/* =========================================
   19. BOTÃO VER NO MAPA
========================================= */

locVerMapa.addEventListener("click", () => {


  const mapaCard = document.querySelector(".loc-map-card");


  mapaCard.scrollIntoView({

    behavior: "smooth",

    block: "center"

  });


  setTimeout(() => {

    locMapa.invalidateSize();

  }, 400);


});


/* =========================================
   20. LIMPAR FILTROS
========================================= */

function locLimparPesquisa() {


  locServico.value = "";

  locMunicipio.value = "";


  locUnidadeSelecionada = null;

  locBuscaRealizada = true;

  locModoSelecao = false;


  locMapa.getContainer().style.cursor = "";

  locDefinirMapa.classList.remove("loc-selecting");


  locMapaDescricao.textContent =
    "Selecione um marcador para ver a unidade.";


  locPesquisar(false);


  locFeedback.textContent =
    "Filtros limpos. Todas as unidades estão sendo exibidas.";

}


/* =========================================
   21. EVENTOS DOS FILTROS
========================================= */

locBuscar.addEventListener("click", () => {

  locPesquisar();

});


locServico.addEventListener("change", () => {

  if (locBuscaRealizada) {

    locPesquisar(false);

  }

});


locMunicipio.addEventListener("change", () => {

  if (locBuscaRealizada) {

    locPesquisar(false);

  }

});


/* =========================================
   22. EVENTOS DE LIMPEZA
========================================= */

locLimpar.addEventListener(
  "click",
  locLimparPesquisa
);


locNovaBusca.addEventListener(
  "click",
  locLimparPesquisa
);


/* =========================================
   23. INICIALIZAÇÃO
========================================= */

locPesquisar(false);


requestAnimationFrame(() => {

  locMapa.invalidateSize();

});
