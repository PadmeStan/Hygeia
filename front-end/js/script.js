
/*aqui o codigo trabalha com a visibilidade 
da tela de cadastro e login*/

let card = document.querySelector(".card");
let loginButton = document.querySelector(".loginButton");
let cadastroButton = document.querySelector(".cadastroButton");

loginButton.onclick = () => {
    card.classList.remove("cadastroActive")
    card.classList.add("loginActive")
}

cadastroButton.onclick = () => {
    card.classList.remove("loginActive")
    card.classList.add("cadastroActive")
}

document.getElementById('formLogin').addEventListener('submit', function(e) {
    e.preventDefault(); // impede o envio real pro back-end por enquanto
    window.location.href = 'dashboard.html'; // redireciona provisoriamente
  });

