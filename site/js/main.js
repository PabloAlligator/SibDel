document.addEventListener('DOMContentLoaded', () => {
  const promotionsSlider = document.querySelector('.promotions__slider');

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
      prevEl: '.promotions__button--prev',
      nextEl: '.promotions__button--next',
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

  // ВТОРОЫЙ СВАЙПЕР- ПОПУЛЯР ТОВАРЫ

  const popularProductsSlider = document.querySelector(
    '.popular-products__slider',
  );

  if (popularProductsSlider) {
    new Swiper(popularProductsSlider, {
      speed: 650,

      slidesPerView: 1.35,
      spaceBetween: 10,

      grabCursor: true,
      watchOverflow: true,

      navigation: {
        prevEl: '.popular-products__button--prev',
        nextEl: '.popular-products__button--next',
      },

      breakpoints: {
        480: {
          slidesPerView: 1.7,
          spaceBetween: 12,
        },

        640: {
          slidesPerView: 2.2,
          spaceBetween: 12,
        },

        768: {
          slidesPerView: 2.7,
          spaceBetween: 14,
        },

        1024: {
          slidesPerView: 3.4,
          spaceBetween: 14,
        },

        1366: {
          slidesPerView: 4.4,
          spaceBetween: 14,
        },

        1600: {
          slidesPerView: 5.2,
          spaceBetween: 16,
        },

        2200: {
          slidesPerView: 6.2,
          spaceBetween: 18,
        },

        3000: {
          slidesPerView: 6.6,
          spaceBetween: 20,
        },
      },
    });
  }

  // третий свайпер - отзывы

  const reviewsSlider = document.querySelector('.reviews__slider');

  if (reviewsSlider) {
    new Swiper(reviewsSlider, {
      speed: 650,

      slidesPerView: 1.08,
      spaceBetween: 10,

      grabCursor: true,
      watchOverflow: true,

      navigation: {
        prevEl: '.reviews__button--prev',
        nextEl: '.reviews__button--next',
      },

      breakpoints: {
        480: {
          slidesPerView: 1.2,
          spaceBetween: 12,
        },

        640: {
          slidesPerView: 1.5,
          spaceBetween: 12,
        },

        768: {
          slidesPerView: 1.8,
          spaceBetween: 14,
        },

        1024: {
          slidesPerView: 2.2,
          spaceBetween: 14,
        },

        1366: {
          slidesPerView: 3,
          spaceBetween: 16,
        },

        1920: {
          slidesPerView: 3.4,
          spaceBetween: 18,
        },

        2200: {
          slidesPerView: 4,
          spaceBetween: 18,
        },

        3000: {
          slidesPerView: 4.6,
          spaceBetween: 20,
        },
      },
    });
  }
});
