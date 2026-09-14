const track = document.getElementById('track');
    const slides = track.querySelectorAll('.slide');
    const dotsWrap = document.getElementById('dots');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');
 
    let current = 0;
 
    // cria os indicadores
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
 
    function update() {
      track.style.transform = `translateX(-${current * 100}%)`;
      [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === current));
    }
 
    function goTo(i) {
      current = (i + slides.length) % slides.length;
      update();
    }
 
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
 
    // autoplay opcional
    setInterval(() => goTo(current + 1), 6000);