const DECISION_THRESHOLD = 75;
const MAX_TILT = 14;

const cardsContainer = document.querySelector('.cards');

// Datos semilla del mazo principal.
const deckData = [
  {
    id: 1,
    name: 'Valeria',
    age: 24,
    bio: 'Amante del café y el código. Buscando con quién hablar de tecnología.',
    location: 'Bogotá · A 3 km',
    job: 'Ingeniera de software', school: 'Universidad Nacional', interests: ['Café', 'Tecnología', 'Viajes'],
    photos: ['./imgs/photos/valeria_1.webp', './imgs/photos/valeria_2.webp'],
  },
  {
    id: 2,
    name: 'Álex',
    age: 25,
    bio: 'Viajes espontáneos, música y nuevos lugares por descubrir.',
    location: 'Medellín · A 5 km',
    job: 'Product designer', school: 'EAFIT', interests: ['Música', 'Fotografía', 'Senderismo'],
    photos: ['./imgs/photos/mateo_1.webp'],
  },
  {
    id: 3,
    name: 'Sofía',
    age: 26,
    bio: 'Diseñadora, lectora nocturna y fan de los perros grandes.',
    location: 'Cali · A 7 km',
    job: 'Diseñadora visual', school: 'Javeriana', interests: ['Diseño', 'Libros', 'Mascotas'],
    photos: ['./imgs/photos/sofia_1.webp', './imgs/photos/sofia_2.webp'],
  },
];

const matchesData = [
  { name: 'Valeria', image: './imgs/photos/valeria_1.webp', message: '¡Hola! ¿Cómo va tu día?', time: '10:42' },
  { name: 'Mateo', image: './imgs/photos/mateo_1.webp', message: 'Visto · Nos vemos pronto', time: 'Ayer' },
];

const likesData = [
  { name: 'Sofía', image: './imgs/photos/sofia_1.webp' },
  { name: 'Alex', image: './imgs/photos/alex_secret.webp' },
  { name: 'Laura', image: './imgs/photos/valeria_2.webp' },
];

const state = {
  queue: [...deckData],
  history: [],
  activeCard: null,
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
  moved: false,
  animating: false,
};

function renderDeck() {
  cardsContainer.innerHTML = '';
  const profile = state.queue[0];

  if (!profile) {
    cardsContainer.innerHTML = '<span class="cards-empty">No hay más personas cerca de ti...<br>Vuelve a intentarlo más tarde</span>';
    return;
  }

  const card = document.createElement('article');
  card.dataset.id = profile.id;
  card.dataset.photoIndex = '0';
  card.innerHTML = `
    <div class="story-bars" aria-label="Fotos de ${profile.name}">
      ${profile.photos.map((_, index) => `<span class="story-bar${index === 0 ? ' is-active' : ''}"></span>`).join('')}
    </div>
    <img class="profile-photo" src="${profile.photos[0]}" alt="Foto de ${profile.name}">
    <div class="photo-zone photo-zone-left" data-photo-direction="previous"></div>
    <div class="photo-zone photo-zone-right" data-photo-direction="next"></div>
    <div class="profile-content">
      <p class="profile-distance">${profile.location}</p>
      <h2>${profile.name} <span>${profile.age}</span></h2>
      <p class="profile-bio">${profile.bio}</p>
      <button class="expand-profile" type="button" aria-label="Ver perfil completo">⌃</button>
    </div>
    <div class="profile-details" aria-hidden="true">
      <button class="close-profile" type="button" aria-label="Cerrar perfil">⌄</button>
      <p class="details-bio">${profile.bio}</p>
      <div class="detail-line"><strong>Trabajo</strong><span>${profile.job}</span></div>
      <div class="detail-line"><strong>Estudios</strong><span>${profile.school}</span></div>
      <div class="detail-line"><strong>Vive en</strong><span>${profile.location}</span></div>
      <div class="interest-list">${profile.interests.map((interest) => `<span>${interest}</span>`).join('')}</div>
    </div>
    <div class="choice nope">NOPE</div>
    <div class="choice like">LIKE</div>`;

  cardsContainer.append(card);
}

function renderSecondaryViews() {
  const matchRow = document.querySelector('.match-row');
  const messageList = document.querySelector('.message-list');
  const likesGrid = document.querySelector('.likes-grid');

  if (matchRow) {
    matchRow.innerHTML = matchesData
      .map((match) => `<img src="${match.image}" alt="${match.name}" title="${match.name}">`)
      .join('');
  }

  if (messageList) {
    messageList.innerHTML = matchesData
      .map((match) => `
        <article>
          <img src="${match.image}" alt="${match.name}">
          <div><strong>${match.name}</strong><p>${match.message}</p></div>
          <time>${match.time}</time>
        </article>`)
      .join('');
  }

  if (likesGrid) {
    likesGrid.innerHTML = likesData
      .map((like) => `<article><img src="${like.image}" alt="${like.name}"><span>${like.name}</span></article>`)
      .join('');
  }
}

function setCardTransform(card, deltaX, deltaY = 0) {
  const width = card.offsetWidth || 320;
  const intensity = Math.min(Math.abs(deltaX) / width, 1);

  card.style.setProperty('--card-x', `${deltaX}px`);
  card.style.setProperty('--card-y', `${Math.max(-20, Math.min(20, deltaY / 4))}px`);
  card.style.setProperty('--card-rotate', `${deltaX / 14}deg`);
  card.style.setProperty('--card-tilt-x', `${Math.max(-MAX_TILT, Math.min(MAX_TILT, -deltaY / 8))}deg`);
  card.style.setProperty('--card-tilt-y', `${(deltaX / width) * MAX_TILT}deg`);
  card.style.setProperty('--choice-opacity', Math.min(intensity * 1.25, 1));
}

function changePhoto(card, direction) {
  const profile = state.queue[0];
  if (!profile || profile.photos.length < 2) return;

  let nextIndex = Number(card.dataset.photoIndex);
  nextIndex += direction === 'next' ? 1 : -1;
  if (nextIndex < 0) nextIndex = profile.photos.length - 1;
  if (nextIndex >= profile.photos.length) nextIndex = 0;

  card.dataset.photoIndex = nextIndex;
  card.querySelector('.profile-photo').src = profile.photos[nextIndex];
  card.querySelectorAll('.story-bar').forEach((bar, index) => {
    bar.classList.toggle('is-active', index === nextIndex);
  });
}

function finishSwipe(card, profile, direction) {
  card.addEventListener('transitionend', () => {
    state.queue.shift();
    state.history.push({ profile, direction });
    card.remove();
    state.activeCard = null;
    state.animating = false;
    renderDeck();
  }, { once: true });
}

function swipe(direction) {
  if (state.animating || !state.queue.length) return;
  const card = cardsContainer.querySelector('article');
  if (!card) return;

  state.animating = true;
  card.classList.add(direction === 'right' ? 'go-right' : 'go-left');
  finishSwipe(card, state.queue[0], direction);
}

function startDrag(event) {
  if (state.animating || state.activeCard) return;
  const card = event.target.closest('article');
  if (!card || event.target.closest('.photo-zone, button')) return;

  state.activeCard = card;
  state.startX = event.clientX;
  state.startY = event.clientY;
  state.deltaX = 0;
  state.deltaY = 0;
  state.moved = false;
  card.classList.add('is-dragging');
  card.setPointerCapture?.(event.pointerId);
}

function moveDrag(event) {
  if (!state.activeCard) return;

  state.deltaX = event.clientX - state.startX;
  state.deltaY = event.clientY - state.startY;
  if (Math.abs(state.deltaX) > 6 || Math.abs(state.deltaY) > 6) state.moved = true;
  setCardTransform(state.activeCard, state.deltaX, state.deltaY);
}

function endDrag() {
  if (!state.activeCard) return;

  const card = state.activeCard;
  if (!state.moved) {
    card.classList.remove('is-dragging');
    state.activeCard = null;
    return;
  }

  if (state.deltaY < -50 && Math.abs(state.deltaX) < DECISION_THRESHOLD) {
    card.classList.add('is-expanded');
    card.querySelector('.profile-details')?.setAttribute('aria-hidden', 'false');
    card.classList.remove('is-dragging');
    state.activeCard = null;
    state.moved = false;
    return;
  }

  const decided = Math.abs(state.deltaX) >= DECISION_THRESHOLD;
  const direction = state.deltaX >= 0 ? 'right' : 'left';
  state.animating = decided;
  card.classList.remove('is-dragging');

  if (decided) {
    card.classList.add(direction === 'right' ? 'go-right' : 'go-left');
    finishSwipe(card, state.queue[0], direction);
  } else {
    card.classList.add('reset');
    setCardTransform(card, 0, 0);
    state.activeCard = null;
  }

  window.setTimeout(() => { state.moved = false; }, 0);
}

function undo() {
  if (state.animating || !state.history.length) return;
  const lastAction = state.history.pop();
  state.queue.unshift(lastAction.profile);
  renderDeck();
}

function setActiveView(target) {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.target === target);
  });
  document.querySelectorAll('.app-view').forEach((view) => {
    view.classList.toggle('is-active', view.dataset.view === target);
  });
}

cardsContainer.addEventListener('pointerdown', startDrag);
cardsContainer.addEventListener('pointermove', moveDrag);
cardsContainer.addEventListener('pointerup', endDrag);
cardsContainer.addEventListener('pointercancel', endDrag);

cardsContainer.addEventListener('click', (event) => {
  const zone = event.target.closest('[data-photo-direction]');
  if (zone && !state.moved) changePhoto(cardsContainer.querySelector('article'), zone.dataset.photoDirection);
});

cardsContainer.addEventListener('click', (event) => {
  const card = cardsContainer.querySelector('article');
  if (!card || state.moved) return;
  if (event.target.closest('.expand-profile')) {
    card.classList.add('is-expanded');
    card.querySelector('.profile-details')?.setAttribute('aria-hidden', 'false');
  }
  if (event.target.closest('.close-profile')) {
    card.classList.remove('is-expanded');
    card.querySelector('.profile-details')?.setAttribute('aria-hidden', 'true');
  }
});

document.querySelector('.is-undo')?.addEventListener('click', undo);
document.querySelector('.is-remove')?.addEventListener('click', () => swipe('left'));
document.querySelector('.is-fav')?.addEventListener('click', () => swipe('right'));
document.querySelector('.is-star')?.addEventListener('click', () => swipe('right'));
document.querySelector('.is-zap')?.addEventListener('click', () => swipe('right'));

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => setActiveView(button.dataset.target));
});

renderDeck();
renderSecondaryViews();
