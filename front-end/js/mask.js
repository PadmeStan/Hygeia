document.addEventListener("DOMContentLoaded", function () {

    const inputsCPF = document.querySelectorAll(".CPF");

    inputsCPF.forEach(input => {

        input.addEventListener("input", function () {
            let valor = input.value.replace(/\D/g, "");

            if (valor.length > 11) {
                valor = valor.slice(0, 11);
            }

            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

            input.value = valor;
        });

        // bloqueia letras
        input.addEventListener("keypress", function (e) {
            if (!/\d/.test(e.key)) {
                e.preventDefault();
            }
        });

    });

});

document.addEventListener("DOMContentLoaded", function () {

    // 📅 DATA
    document.querySelectorAll(".data").forEach(input => {
        input.addEventListener("input", function () {
            let v = input.value.replace(/\D/g, "");

            if (v.length > 8) v = v.slice(0, 8);

            v = v.replace(/(\d{2})(\d)/, "$1/$2");
            v = v.replace(/(\d{2})(\d)/, "$1/$2");

            input.value = v;
        });
    });

    // 💳 CARTÃO SUS
    document.querySelectorAll(".sus").forEach(input => {
        input.addEventListener("input", function () {
            let v = input.value.replace(/\D/g, "");

            if (v.length > 15) v = v.slice(0, 15);

            v = v.replace(/(\d{3})(\d)/, "$1 $2");
            v = v.replace(/(\d{4})(\d)/, "$1 $2");
            v = v.replace(/(\d{4})(\d)/, "$1 $2");

            input.value = v;
        });
    });

    // 📞 TELEFONE
    document.querySelectorAll(".telefone").forEach(input => {
        input.addEventListener("input", function () {
            let v = input.value.replace(/\D/g, "");

            if (v.length > 11) v = v.slice(0, 11);

            v = v.replace(/(\d{2})(\d)/, "($1) $2");

            if (v.length > 10) {
                v = v.replace(/(\d{5})(\d)/, "$1-$2");
            } else {
                v = v.replace(/(\d{4})(\d)/, "$1-$2");
            }

            input.value = v;
        });
    });

    // 📍 CEP
    document.querySelectorAll(".cep").forEach(input => {
        input.addEventListener("input", function () {
            let v = input.value.replace(/\D/g, "");

            if (v.length > 8) v = v.slice(0, 8);

            v = v.replace(/(\d{5})(\d)/, "$1-$2");

            input.value = v;
        });
    });

});
