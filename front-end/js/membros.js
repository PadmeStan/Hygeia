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

if (btnAdicionar) {

    btnAdicionar.addEventListener("click", () => {

        alert("Funcionalidade de adicionar membro ainda não implementada.");

    });

}