const cards = document.querySelectorAll(".card:not(.adicionar)");

const modal = document.getElementById("modal");

cards.forEach(card => {

    card.addEventListener("click", () => {

        document.getElementById("nome").innerHTML = card.dataset.nome;

        document.getElementById("nomeInput").value = card.dataset.nome;

        document.getElementById("nascimento").value = card.dataset.data;

        document.getElementById("idade").value = card.dataset.idade;

        document.getElementById("genero").value = card.dataset.genero;

        document.getElementById("cpf").value = card.dataset.cpf;

        document.getElementById("sus").value = card.dataset.sus;

        document.getElementById("seloModal").innerHTML = card.dataset.tipo;

        modal.style.display = "flex";

    });

});

// impede que o clique no menu de três pontos abra o modal do cartão
document.querySelectorAll(".menu-pontos").forEach(botao => {

    botao.addEventListener("click", (e) => {

        e.stopPropagation();

    });

});

document.getElementById("fechar").onclick = function () {

    modal.style.display = "none";

}

window.onclick = function (e) {

    if (e.target == modal) {

        modal.style.display = "none";

    }

}

// clique no cartão "Adicionar membro"
const btnAdicionar = document.getElementById("btnAdicionar");

const modalAdicionar = document.getElementById("modalAdicionar");
const fecharAdicionar = document.getElementById("fecharAdicionar");
const cancelarAdicionar = document.getElementById("cancelarAdicionar");
const formAdicionar = document.getElementById("formAdicionar");

const campoNome = document.getElementById("novoNome");
const campoNascimento = document.getElementById("novoNascimento");
const campoIdade = document.getElementById("novoIdade");
const campoGenero = document.getElementById("novoGenero");
const campoCpf = document.getElementById("novoCpf");
const campoSus = document.getElementById("novoSus");

const membrosContainer = document.querySelector(".membros");

function abrirModalAdicionar() {

    formAdicionar.reset();

    modalAdicionar.style.display = "flex";

}

function fecharModalAdicionar() {

    modalAdicionar.style.display = "none";

    formAdicionar.reset();

}

if (btnAdicionar) {

    btnAdicionar.addEventListener("click", abrirModalAdicionar);

}

if (fecharAdicionar) {

    fecharAdicionar.onclick = fecharModalAdicionar;

}

if (cancelarAdicionar) {

    cancelarAdicionar.onclick = fecharModalAdicionar;

}

// fecha o modal de adicionar ao clicar fora da janela (sem afetar o comportamento do outro modal)
window.addEventListener("click", (e) => {

    if (e.target == modalAdicionar) {

        fecharModalAdicionar();

    }

});

// máscara de CPF
if (campoCpf) {

    campoCpf.addEventListener("input", () => {

        let v = campoCpf.value.replace(/\D/g, "").slice(0, 11);

        v = v.replace(/(\d{3})(\d)/, "$1.$2");

        v = v.replace(/(\d{3})(\d)/, "$1.$2");

        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        campoCpf.value = v;

    });

}

// máscara do cartão do SUS
if (campoSus) {

    campoSus.addEventListener("input", () => {

        let v = campoSus.value.replace(/\D/g, "").slice(0, 15);

        v = v.replace(/(\d{3})(\d)/, "$1 $2");

        v = v.replace(/(\d{4})(\d)/, "$1 $2");

        v = v.replace(/(\d{4})(\d)/, "$1 $2");

        campoSus.value = v;

    });

}

// converte a data do input type=date (aaaa-mm-dd) para o padrão dd/mm/aaaa usado nos cartões
function formatarData(valorISO) {

    const partes = valorISO.split("-");

    if (partes.length !== 3) return valorISO;

    return partes[2] + "/" + partes[1] + "/" + partes[0];

}

// monta um novo cartão de membro igual aos já existentes na página
function criarCardMembro(dados) {

    const card = document.createElement("div");

    card.className = "card";

    card.dataset.foto = "";
    card.dataset.nome = dados.nome;
    card.dataset.data = dados.data;
    card.dataset.idade = dados.idade + " anos";
    card.dataset.genero = dados.genero;
    card.dataset.cpf = dados.cpf;
    card.dataset.sus = dados.sus;
    card.dataset.tipo = "Membro";

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

        <span class="selo">Membro</span>
    `;

    // faz o novo cartão abrir o modal de detalhes, do mesmo jeito que os outros
    card.addEventListener("click", () => {

        document.getElementById("nome").innerHTML = card.dataset.nome;

        document.getElementById("nomeInput").value = card.dataset.nome;

        document.getElementById("nascimento").value = card.dataset.data;

        document.getElementById("idade").value = card.dataset.idade;

        document.getElementById("genero").value = card.dataset.genero;

        document.getElementById("cpf").value = card.dataset.cpf;

        document.getElementById("sus").value = card.dataset.sus;

        document.getElementById("seloModal").innerHTML = card.dataset.tipo;

        modal.style.display = "flex";

    });

    card.querySelector(".menu-pontos").addEventListener("click", (e) => {

        e.stopPropagation();

    });

    return card;

}

if (formAdicionar) {

    formAdicionar.addEventListener("submit", (e) => {

        e.preventDefault();

        if (!formAdicionar.checkValidity()) {

            formAdicionar.reportValidity();

            return;

        }

        const dados = {
            nome: campoNome.value.trim(),
            data: formatarData(campoNascimento.value),
            idade: campoIdade.value.trim(),
            genero: campoGenero.value,
            cpf: campoCpf.value.trim(),
            sus: campoSus.value.trim()
        };

        const novoCard = criarCardMembro(dados);

        membrosContainer.insertBefore(novoCard, btnAdicionar);

        fecharModalAdicionar();

    });

}