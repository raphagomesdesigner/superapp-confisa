const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');
const videoFrame = document.querySelector('[data-video-frame]');

// O arquivo local não envia um referer HTTP ao YouTube e pode mostrar o erro 153.
// Na prévia local, a capa leva ao vídeo; em produção, o player fica no hero.
if (videoFrame && location.protocol === 'https:') {
  const iframe = document.createElement('iframe');
  iframe.src = videoFrame.dataset.embed;
  iframe.title = 'Demonstração do SuperApp para ferragem armada';
  iframe.allow = 'autoplay; encrypted-media';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  videoFrame.replaceChildren(iframe);
}

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
  menu.classList.toggle('open', !expanded);
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menu');
}));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.classList.contains('open')) {
    menu.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menu');
    menuButton?.focus();
  }
});

// Ampliação das telas do produto apenas em desktop.
const screenZoomMedia = window.matchMedia('(min-width: 821px)');
const screenZoomButtons = [...document.querySelectorAll('.screen-zoom-button')];
const screenLightbox = document.querySelector('.screen-lightbox');
if (screenLightbox && screenZoomButtons.length) {
  const lightboxImage = screenLightbox.querySelector('img');
  const lightboxCaption = screenLightbox.querySelector('p');
  const closeLightbox = screenLightbox.querySelector('.screen-lightbox__close');
  const syncScreenZoomAvailability = () => {
    screenZoomButtons.forEach((button) => { button.disabled = !screenZoomMedia.matches; });
    if (!screenZoomMedia.matches && screenLightbox.open) screenLightbox.close();
  };
  syncScreenZoomAvailability();
  screenZoomMedia.addEventListener('change', syncScreenZoomAvailability);
  screenZoomButtons.forEach((button) => button.addEventListener('click', () => {
    if (!screenZoomMedia.matches) return;
    const image = button.querySelector('img');
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = button.getAttribute('aria-label') || '';
    lightboxCaption.textContent = button.closest('figure')?.querySelector('figcaption strong')?.textContent || '';
    screenLightbox.showModal();
    closeLightbox.focus();
  }));
  closeLightbox.addEventListener('click', () => screenLightbox.close());
  screenLightbox.addEventListener('click', (event) => {
    if (event.target === screenLightbox) screenLightbox.close();
  });
}