// mostrar ou não menu

function menuShow() {
    let menuMobile = document.querySelector('.menu-mobile');
    if (menuMobile.classList.contains('open')) {
        menuMobile.classList.remove('open');
        document.querySelector('.icon').src = "../img/menu.png";
    } else {
        menuMobile.classList.add('open');
        document.querySelector('.icon').src = "../img/menu2.png";
    }
}
// três pontinhos
let index = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

function showSlide(n) {
    slides.forEach((slide, i) => {
        slide.style.left = (i - n) * 100 + "%";
    });

    dots.forEach(dot => dot.classList.remove("active"));
    dots[n].classList.add("active");
}

function moveSlide(n) {
    index += n;
    if (index < 0) index = slides.length - 1;
    if (index > slides.length - 1) index = 0;
    showSlide(index);
}

function goToSlide(n) {
    index = n;
    showSlide(index);
}

showSlide(index);

// segundo carrosel

let index2 = 0;
const slides2 = document.querySelectorAll(".slide2");
const dots2 = document.querySelectorAll(".dot2");

function showSlide2(n) {
    slides2.forEach((slide2, i) => {
        slide2.style.left = (i - n) * 100 + "%";
    });

    dots2.forEach(dot2 => dot2.classList.remove("active2"));
    dots2[n].classList.add("active2");
}

function moveSlide2(n) {
    index2 += n;
    if (index2 < 0) index2 = slides2.length - 1;
    if (index2 > slides2.length - 1) index2 = 0;
    showSlide2(index2);
}

function goToSlide2(n) {
    index2 = n;
    showSlide2(index2);
}

showSlide2(index2);


