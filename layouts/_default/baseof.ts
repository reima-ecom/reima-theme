/**
 * @param {MouseEvent} e
 */
const openButtonClick = (e) => {
  e.preventDefault();
  const current = /** @type {HTMLElement} */ e.currentTarget;
  const openId = current.getAttribute('openid');
  let openElement;
  if (openId === 'parent') openElement = current.parentElement;
  else openElement = document.getElementById(openId);
  openElement.classList.toggle('open');
  // if this is an overlay, freeze body
  if (
    openElement.classList.contains('overlay') ||
    openElement.classList.contains('modal') ||
    openElement.hasAttribute('modal-opener')
  ) {
    document.body.style.overflow = 'hidden';
  }
};

document.querySelectorAll('[openid]').forEach((element) => {
  element.addEventListener('click', openButtonClick);
});

/**
 * @param {MouseEvent} e
 */
const overlayClick = (e) => {
  // close if the overlay itself was clicked
  // or if the close button was clicked
  if (e.target === e.currentTarget || /** @type {HTMLElement} */ e.target.closest('[close]')) {
    /** @type {HTMLElement} */ e.currentTarget.closest('.open').classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.querySelectorAll('.overlay').forEach((element) => {
  element.addEventListener('click', overlayClick);
});
document.querySelectorAll('.modal').forEach((element) => {
  element.addEventListener('click', overlayClick);
});

const load = async (url: string) =>
  new Promise((resovle, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resovle;
    script.onerror = reject;
    script.type = 'module';
    document.head.appendChild(script);
  });

const loaderClick = async (e) => {
  const name = e.currentTarget.getAttribute('load');
  const url = window.lazy[name];
  if (url) {
    load(url);
  } else {
    throw new Error(`No lazy dependency "${name}" found`);
  }
};

document.querySelectorAll('[load]').forEach((element) => {
  element.addEventListener('click', loaderClick);
});

/**
 * Initialize Carousels
 */
document.querySelectorAll('.carousel').forEach((carousel) => {
  const ele: HTMLElement = carousel.querySelector('ul');
  const bullets = carousel.querySelectorAll('ol li');
  const nextarrow: HTMLElement = carousel.querySelector('.next');
  const prevarrow: HTMLElement = carousel.querySelector('.prev');
  const autoplay: boolean = !!carousel.getAttribute('data-autoplay');
  const autoplaySpeed: number = carousel.getAttribute('data-autoplay-speed')
    ? parseInt(carousel.getAttribute('data-autoplay-speed'), 10)
    : 7000;
  const dots: boolean = !!carousel.getAttribute('data-dots');
  const arrows: boolean = !!carousel.getAttribute('data-arrows');

  ele.scrollLeft = 0;
  bullets[0].classList.add('selected');

  const scrollTo = function (event) {
    event.preventDefault();
    const elID = this.getAttribute('href');
    const el: HTMLElement = ele.querySelector('.carousel__item[data-id="' + elID.substr(1) + '"]');
    ele.scrollLeft = el.offsetLeft;

    // Set selected bullet
    bullets.forEach(function (bullet) {
      bullet.classList.remove('selected');
    });
    this.parentElement.classList.add('selected');
  };

  const nextSlide = function () {
    if (!carousel.querySelector('ol li:last-child').classList.contains('selected')) {
      carousel.querySelector('ol li.selected').nextElementSibling.querySelector('a').click();
    } else {
      carousel.querySelector('ol li:first-child a').click();
    }
  };

  const prevSlide = function () {
    if (!carousel.querySelector('ol li:first-child').classList.contains('selected')) {
      carousel.querySelector('ol li.selected').previousElementSibling.querySelector('a').click();
    } else {
      carousel.querySelector('ol li:last-child a').click();
    }
  };

  // Attach the handlers
  if (arrows && nextarrow && prevarrow) {
    nextarrow.style.display = 'block';
    prevarrow.style.display = 'block';
  }

  nextarrow.addEventListener('click', nextSlide);
  prevarrow.addEventListener('click', prevSlide);

  if (dots) {
    const dotsElement: HTMLElement = carousel.querySelector('.dots');
    if (dotsElement) {
      dotsElement.style.display = 'flex';
    }
    bullets.forEach(function (bullet) {
      bullet.querySelector('a').addEventListener('click', scrollTo);
    });
  }

  // setInterval for autoplay

  if (autoplay) {
    setInterval(function () {
      if (ele != document.querySelector('.carousel:hover ul')) {
        const screenWidth = window.innerWidth;
        let visibleItems: number;
        let selectedIndex: number = 0;

        // Table breakpoint
        if (screenWidth > 767 && screenWidth < 992) {
          visibleItems = parseInt(carousel.getAttribute('data-items-tablet'), 10) + 1;
        }
        // Desktop breakpoint
        else if (screenWidth > 991) {
          visibleItems = parseInt(carousel.getAttribute('data-items-desktop'), 10) + 1;
        }
        // Mobile breakpoint
        else {
          visibleItems = parseInt(carousel.getAttribute('data-items-mobile'), 10);
          nextarrow.click();
        }

        // Find selected bullet index
        bullets.forEach(function (bullet, index) {
          if (bullet.classList.contains('selected')) {
            selectedIndex = index;
          }
        });

        const bulletIndex =
          selectedIndex + visibleItems > bullets.length ? 1 : selectedIndex + visibleItems;
        const nextBullet: HTMLElement = document.querySelector(
          '.dots li:nth-child(' + bulletIndex + ') a',
        );
        if (nextBullet) {
          nextBullet.click();
        }
      }
    }, autoplaySpeed);
  }
});
