document.addEventListener("DOMContentLoaded", function () {

    const inputs = document.querySelectorAll(".codigo");

    inputs.forEach((input, index) => {

        input.addEventListener("input", (e) => {
            let value = e.target.value;

            // aceita só números
            value = value.replace(/\D/g, "");
            input.value = value;

            if (value.length > 1) {
                const valores = value.split("");

                valores.forEach((v, i) => {
                    if (inputs[index + i]) {
                        inputs[index + i].value = v;
                    }
                });

                inputs[Math.min(index + value.length, inputs.length - 1)].focus();
            } else {
                if (value !== "" && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && index > 0) {
                inputs[index - 1].focus();
            }
        });

    });

});