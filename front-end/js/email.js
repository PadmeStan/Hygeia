document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // 📄 ETAPA 1 (email)
    // =========================
    const inputEmail = document.querySelector('input[type="email"]');

    if (inputEmail) {
        const form1 = inputEmail.closest("form");

        form1.addEventListener("submit", (e) => {
    e.preventDefault(); // ← adiciona isso
    const email = inputEmail.value;
    localStorage.setItem("emailUsuario", email);
    window.location.href = "cadastro2.html"; // ← navega manualmente para a próxima página
});
    }


    // =========================
    // 📄 ETAPA 2 (enviar código)
    // =========================
    const inputSenha = document.querySelector(".senha");

    if (inputSenha) {
        const form2 = inputSenha.closest("form");

        form2.addEventListener("submit", function(e) {
            e.preventDefault();

            const email = localStorage.getItem("emailUsuario");
            console.log("Email recuperado:", email);

            if (!email) {
                alert("Erro: email não encontrado.");
                return;
            } 

            fetch("http://localhost:3000/enviar-codigo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            })
            .then(res => res.json())
            .then(res => {
                if (res.sucesso) {
                    window.location.href = "codigo.html";
                } else {
                    alert("Erro ao enviar código");
                }
            })
            .catch(() => {
                alert("Erro de conexão com servidor");
            });
        });
    }


    // =========================
    // 📄 PÁGINA DO CÓDIGO
    // =========================
    const inputsCodigo = document.querySelectorAll(".codigo");

    if (inputsCodigo.length > 0) {

        const formCodigo = inputsCodigo[0].closest("form");

        // 🔹 auto avançar
        inputsCodigo.forEach((input, index) => {

            input.addEventListener("input", (e) => {
                let value = e.target.value.replace(/\D/g, "");
                input.value = value;

                if (value !== "" && index < inputsCodigo.length - 1) {
                    inputsCodigo[index + 1].focus();
                }
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && input.value === "" && index > 0) {
                    inputsCodigo[index - 1].focus();
                }
            });

        });

        // 🔹 validar código
        formCodigo.addEventListener("submit", function(e) {
            e.preventDefault();

            let codigo = "";
            inputsCodigo.forEach(input => codigo += input.value);

            const email = localStorage.getItem("emailUsuario");

            fetch("http://localhost:3000/verificar-codigo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, codigo })
            })
            .then(res => res.json())
            .then(res => {
                if (res.valido) {
                    alert("Código correto!");
                    window.location.href = "sucesso.html";
                } else {
                    alert("Código inválido!");
                }
            });
        });
    }

});