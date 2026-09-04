document.addEventListener("DOMContentLoaded", () => {
  const promotionsSlider = document.querySelector(
    ".promotions__slider",
  );

  if (!promotionsSlider) {
    return;
  }

  new Swiper(promotionsSlider, {
    speed: 650,

    slidesPerView: 1.15,
    spaceBetween: 10,

    grabCursor: true,
    watchOverflow: true,

    navigation: {
      prevEl: ".promotions__button--prev",
      nextEl: ".promotions__button--next",
    },

    breakpoints: {
      480: {
        slidesPerView: 1.4,
        spaceBetween: 12,
      },

      640: {
        slidesPerView: 2.1,
        spaceBetween: 12,
      },

      768: {
        slidesPerView: 2.4,
        spaceBetween: 14,
      },

      1024: {
        slidesPerView: 3.2,
        spaceBetween: 14,
      },

      1366: {
        slidesPerView: 4,
        spaceBetween: 14,
      },

      1600: {
        slidesPerView: 4.6,
        spaceBetween: 16,
      },

      2200: {
        slidesPerView: 5.2,
        spaceBetween: 18,
      },

      3000: {
        slidesPerView: 5.6,
        spaceBetween: 20,
      },
    },
  });
});
