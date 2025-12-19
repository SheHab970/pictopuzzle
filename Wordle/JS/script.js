// ===== WORDLE GAME – VANILLA JS =====

// --------- STATE ---------
let solution = '';
let imageUrl = '';
let currentGuess = '';
let turn = 0; // 0 → 5
let isCorrect = false;
let guesses = Array(6).fill(null); // formatted guesses
let history = [];
let usedKeys = {}; // { a: 'green', b: 'yellow' }

// --------- DOM ---------
const grid = document.querySelector('.grid');
const keypad = document.querySelector('.keypad');
const imageContainer = document.querySelector('.puzzle-image-container img');
const modal = document.querySelector('.modal');
const nextBtn = document.querySelector('.next-btn');

// --------- INIT ---------
async function initGame() {
  resetState();
  await fetchWord();
  renderEmptyGrid();
}

function resetState() {
  currentGuess = '';
  turn = 0;
  isCorrect = false;
  guesses = Array(6).fill(null);
  history = [];
  usedKeys = {};
  hideModal();
}

async function startNewGame() {
  // reset state
  currentGuess = '';
  turn = 0;
  isCorrect = false;
  guesses = Array(6).fill(null);
  history = [];
  usedKeys = {};

  // hide modal
  hideModal();

  // reset keyboard UI
  document.querySelectorAll('.key').forEach(key => {
    key.classList.remove('green', 'yellow', 'grey');
  });

  // fetch new word + image
  await fetchWord();

  // reset grid
  renderEmptyGrid();
}

// --------- FETCH WORD ---------
async function fetchWord() {
    const baseUrl = "https://pictopuzzle.runasp.net"
  try {
    const res = await fetch(`${baseUrl}/api/Words`);
    if (!res.ok) throw new Error('Failed to fetch');

    const data = await res.json();
    const random = data[Math.floor(Math.random() * data.length)];

    solution = random.word.toLowerCase();
    imageUrl = random.imageUrl;

    imageContainer.src = imageUrl;
  } catch (err) {
    // fallback
    solution = 'react';
    imageContainer.src = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg';
    console.warn('Fallback word used');
  }
}

// --------- GRID ---------
function renderEmptyGrid() {
  grid.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.classList.add('row');

    for (let j = 0; j < 5; j++) {
      row.appendChild(document.createElement('div'));
    }

    grid.appendChild(row);
  }
}

function updateCurrentRow() {
  const row = grid.children[turn];
  [...row.children].forEach((cell, i) => {
    cell.textContent = currentGuess[i] || '';
    cell.className = currentGuess[i] ? 'filled' : '';
  });
}

// --------- GUESS LOGIC ---------
function formatGuess() {
  const solutionArray = [...solution];
  const formatted = [...currentGuess].map(l => ({ key: l, color: 'grey' }));

  // greens
  formatted.forEach((l, i) => {
    if (solution[i] === l.key) {
      l.color = 'green';
      solutionArray[i] = null;
    }
  });

  // yellows
  formatted.forEach((l) => {
    if (l.color !== 'green' && solutionArray.includes(l.key)) {
      l.color = 'yellow';
      solutionArray[solutionArray.indexOf(l.key)] = null;
    }
  });

  return formatted;
}

function addNewGuess() {
  const formatted = formatGuess();

  guesses[turn] = formatted;
  history.push(currentGuess);

  applyGuessToGrid(formatted);
  updateUsedKeys(formatted);

  if (currentGuess === solution) {
    isCorrect = true;
    showModal(true);
  }

  turn++;
  currentGuess = '';

  if (turn > 5 && !isCorrect) {
    showModal(false);
  }
}

function applyGuessToGrid(formatted) {
  const row = grid.children[turn];
  row.classList.add('past');

  formatted.forEach((l, i) => {
    const cell = row.children[i];
    cell.textContent = l.key;
    cell.classList.add(l.color);
  });
}

function updateUsedKeys(formatted) {
  formatted.forEach(l => {
    const currentColor = usedKeys[l.key];

    if (l.color === 'green') usedKeys[l.key] = 'green';
    if (l.color === 'yellow' && currentColor !== 'green') usedKeys[l.key] = 'yellow';
    if (l.color === 'grey' && !currentColor) usedKeys[l.key] = 'grey';
  });

  updateKeyboard();
}

// --------- KEYBOARD ---------
function handleKey(key) {
  if (isCorrect || turn > 5) return;

  if (key === 'Enter') {
    if (currentGuess.length !== 5) return;
    if (history.includes(currentGuess)) return;
    addNewGuess();
    return;
  }

  if (key === 'Backspace') {
    currentGuess = currentGuess.slice(0, -1);
    updateCurrentRow();
    return;
  }

    let letter = null;

    if (/^[a-zA-Z]$/.test(key)) {
    letter = key.toLowerCase();
    } else if (code && code.startsWith('Key')) {
    letter = code.replace('Key', '').toLowerCase();
    }

    if (letter && currentGuess.length < 5) {
    currentGuess += letter;
    updateCurrentRow();
    }
}

function updateKeyboard() {
  document.querySelectorAll('.key').forEach(key => {
    const letter = key.textContent.toLowerCase();
    if (usedKeys[letter]) {
      key.classList.add(usedKeys[letter]);
    }
  });
}

// --------- EVENTS ---------
window.addEventListener('keyup', e => handleKey(e.key, e.code));

keypad.addEventListener('click', e => {
  const key = e.target.closest('.key');
  if (!key) return;

  let value = key.textContent.toLowerCase();

  if (value === '⌫') value = 'Backspace';
  if (value === 'enter') value = 'Enter';

  handleKey(value);
});

// --------- MODAL ---------
function showModal(win) {
  modal.style.display = 'flex';
  modal.querySelector('p').textContent = win
    ? 'You Won!'
    : `Unlucky! Solution: ${solution}`;
}

// --------- NEW GAME ---------
nextBtn.addEventListener('click', () => {
  startNewGame();
});

function hideModal() {
  modal.style.display = 'none';
}

// --------- START ---------
initGame();
