const API = '/api';

function mostrarErro(elementoId, mensagem) {
    const elemento = document.getElementById(elementoId);

    if (elemento) {
        elemento.textContent = mensagem;
    }
}

function limparErro(elementoId) {
    const elemento = document.getElementById(elementoId);

    if (elemento) {
        elemento.textContent = '';
    }
}

const formLogin = document.getElementById('formLogin');

if (formLogin) {

    formLogin.addEventListener('submit', async (e) => {

        // IMPede o formulário HTML de navegar sozinho
        e.preventDefault();

        limparErro('erroLogin');

        const dados = {
            cpf: formLogin.cpf.value,
            senha: formLogin.senha.value
        };

        console.log('ENVIANDO LOGIN');

        try {

            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(dados)
            });

            const json = await res.json();

            console.log('RESPOSTA:', res.status, json);

            // ==========================================
            // LOGIN RECUSADO
            // ==========================================

            if (!res.ok) {

                console.log('LOGIN RECUSADO');

                mostrarErro(
                    'erroLogin',
                    json.erro || 'CPF ou senha incorretos.'
                );

                // MUITO IMPORTANTE:
                // não existe nenhum redirect aqui
                return;
            }

            // ==========================================
            // LOGIN ACEITO
            // ==========================================

            console.log('LOGIN ACEITO');

            window.location.href = '/html/dashboard.html';

        } catch (erro) {

            console.error('ERRO:', erro);

            mostrarErro(
                'erroLogin',
                'Não foi possível conectar ao servidor.'
            );
        }
    });
}
