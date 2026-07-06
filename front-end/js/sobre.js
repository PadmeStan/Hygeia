function toggleEquipe() {
    const secao = document.getElementById("secao-equipe");
    const botao = document.getElementById("btn-saiba-mais");
    const textoPara = document.getElementById("texto-instrucao");
    const elementoParaMover = document.getElementById("conteudo-interativo");
    
    const destino = document.getElementById("destino-botao");
    const origem = document.querySelector(".about_caixa");

    if (secao.style.display === "none") {
        // 1. Abre a caixa
        secao.style.display = "flex";
        
        // 2. Muda os textos
        botao.innerHTML = "VER MENOS";
        textoPara.innerHTML = "Para menos informações sobre o nosso site clique em";
        
        // 3. Move APENAS o texto e botão para dentro da caixa azul
        destino.appendChild(elementoParaMover);
        
        // Move o bloco para o destino (final da caixa azul)
        destino.appendChild(elementoParaMover);

        // Ativa a classe de margem reduzida
        textoPara.classList.add("margem-reduzida");

        // Move o bloco para o destino (final da caixa azul)
        destino.appendChild(elementoParaMover);

        secao.scrollIntoView({ behavior: 'smooth' });
    } else {
        // 1. Fecha a caixa
        secao.style.display = "none";
        
        // 2. Volta os textos ao normal
        botao.innerHTML = "SAIBA MAIS";
        textoPara.innerHTML = "Para mais informações sobre o nosso site clique em";
        
        // Remove a classe de margem reduzida
        textoPara.classList.remove("margem-reduzida");
        // 3. Devolve o texto e botão para o lugar original (fora da caixa azul)
        origem.appendChild(elementoParaMover);
    }
}
