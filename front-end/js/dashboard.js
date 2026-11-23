async function verificarAutenticacao() {
    try {
        const resposta = await fetch('/api/perfil', {
            method: 'GET',
            credentials: 'include'
        });

        const dados = await resposta.json();

        console.log('AUTENTICAÇÃO:', resposta.status, dados);

        if (!resposta.ok) {
            window.location.href = '/html/index2.html';
            return null;
        }

        return dados;

    } catch (erro) {
        console.error('Erro ao verificar autenticação:', erro);

        window.location.href = '/html/index2.html';
        return null;
    }
}

verificarAutenticacao()


async function iniciarDashboard() {
    const autenticado = await verificarAutenticacao();

    if (!autenticado) return;

    const track = document.getElementById('track');
    const slides = track.querySelectorAll('.slide');

    const dotsWrap = document.getElementById('dots');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');

    let current = 0;

    slides.forEach((_, i) => {
        const dot = document.createElement('button');

        if (i === 0) {
            dot.classList.add('active');
        }

        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });

    function update() {
        track.style.transform = `translateX(-${current * 100}%)`;

        [...dotsWrap.children].forEach((d, i) =>
            d.classList.toggle('active', i === current)
        );
    }

    function goTo(i) {
        current = (i + slides.length) % slides.length;
        update();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    setInterval(() => goTo(current + 1), 6000);
}

iniciarDashboard();