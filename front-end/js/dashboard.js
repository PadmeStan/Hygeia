  document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('hygeiaCarousel');
  const track = document.getElementById('carouselTrack');
  const slides = Array.from(track.children);
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const dots = Array.from(document.querySelectorAll('.dot'));

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoplayTimer = null;

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    // Move a faixa de slides
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Atualiza os marcadores ativos
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // Eventos das setas
  btnPrev.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    resetAutoplay();
  });

  btnNext.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    resetAutoplay();
  });

  // Eventos dos marcadores
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIndex = Number(dot.dataset.index);
      goToSlide(targetIndex);
      resetAutoplay();
    });
  });

  // Navegação por toque (Swipe no celular)
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goToSlide(currentIndex + 1) : goToSlide(currentIndex - 1);
      resetAutoplay();
    }
  }, { passive: true });

  // Troca automática (pausa ao passar o mouse)
  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 15000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  carousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  carousel.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
});