// ─── CONFIGURAÇÃO ────────────────────────────────────────────────────────────
// URL base do backend.
const API = '/api';

// ─── UTILITÁRIOS ─────────────────────────────────────────────────────────────
function mostrarErro(elementoId, mensagem) {
  const el = document.getElementById(elementoId);
  if (el) el.textContent = mensagem;
}

function limparErro(elementoId) {
  const el = document.getElementById(elementoId);
  if (el) el.textContent = '';
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const formLogin = document.getElementById('formLogin');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparErro('erroLogin');

    const dados = {
      cpf: formLogin.cpf.value,
      senha: formLogin.senha.value,
    };

    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // envia/recebe cookie de sessão
        body: JSON.stringify(dados),
      });

      const json = await res.json();

      if (!res.ok) {
        mostrarErro('erroLogin', json.erro || 'Erro ao fazer login.');
        return;
      }

      // Redireciona para a dashboard
      window.location.href = '../html/dashboard.html';

    } catch (err) {
      mostrarErro('erroLogin', 'Não foi possível conectar ao servidor.');
    }
  });
}
// ─── CADASTRO ETAPA 1 ─────────────────────────────────────────────────────────
const formCadastro1 = document.getElementById('formCadastro1');
if (formCadastro1) {
    formCadastro1.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cpf = formCadastro1.cpf.value;
        const email = formCadastro1.email.value;

        // SALVAMENTO PREVENTIVO (Antes mesmo de enviar ao servidor)
        sessionStorage.setItem('cpf_final', cpf);
        sessionStorage.setItem('email_final', email);

        try {
            const res = await fetch(`${API}/register-step1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf, email }),
            });

            if (res.ok) {
                // REDIRECIONAMENTO COM PARÂMETROS EXPLÍCITOS
                const url = new URL(window.location.origin + '/html/cadastro2.html'); // Ajuste o caminho se necessário
                url.searchParams.append('c', cpf);
                url.searchParams.append('e', email);
                
                window.location.href = url.toString();
            } else {
                const json = await res.json();
                alert(json.erro);
            }
        } catch (err) { alert('Erro de conexão'); }
    });
}

// ─── CADASTRO ETAPA 2 ──────────────────────────────────────
const inicializarEtapa2 = () => {
    const form = document.getElementById('formCadastro2');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Pega da URL ou da Sessão
        const urlParams = new URLSearchParams(window.location.search);
        
        const cpfVindoDaUrl = urlParams.get('c');
        const emailVindoDaUrl = urlParams.get('e');
        const cpfVindoDaSessao = sessionStorage.getItem('cpf_final');
        const emailVindoDaSessao = sessionStorage.getItem('email_final');

        // VALOR FINAL (Prioridade para a URL, depois Sessão)
        const cpfFinal = cpfVindoDaUrl || cpfVindoDaSessao;
        const emailFinal = emailVindoDaUrl || emailVindoDaSessao;

        if (!cpfFinal || !emailFinal) {
            alert("ERRO: O navegador perdeu o CPF/Email. Digite-os novamente na tela anterior.");
            window.location.href = 'index2.html';
            return;
        }

        // MONTAGEM DOS DADOS
        const dados = {
            cpf: cpfFinal,
            email: emailFinal,
            nome: form.nome.value.trim(),
            data_nascimento: form.data_nascimento.value,
            genero: form.genero.value,
            sus: form.sus.value,
            telefone: form.telefone.value,
            cep: form.cep.value,
            cidade: form.cidade.value,
            bairro: form.bairro.value,
            rua: form.rua.value,
            numero: form.numero.value,
            senha: form.senha.value,
            confirmar_senha: form.confirmar_senha.value
        };

        console.log("DADOS ENVIADOS:", dados);

        try {
            const res = await fetch(`${API}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados),
            });

            const json = await res.json();
            if (res.ok) {
                sessionStorage.clear();
                alert('Sucesso!');
                window.location.href = 'index2.html';
            } else {
                alert(json.erro || "Campos incompletos");
            }
        } catch (err) { alert("Erro de conexão"); }
    });
};
inicializarEtapa2();
