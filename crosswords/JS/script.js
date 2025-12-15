/**********************
 * GAME CONFIG
 **********************/
const GRID_SIZE = 6;
let WORDS = [];
// EXAMPLE DATA 
  // {
  //   "id": 1,
  //   "word": "apple",
  //   "imageUrl": "https://i.imgur.com/CGuDGFN.png",
  //   "difficultyLevel": 1
  // },

/**********************
 * FETCH DATA FROM API
 **********************/ 
async function loadWordsFromAPI() {
  const baseUrl = "http://pictopuzzle.runasp.net"
  try {
    const response = await fetch(`${baseUrl}/api/Words`);
    const data = await response.json();

    WORDS = data.map(item => ({
      id: item.id,
      word: item.word.toUpperCase(),
      image: item.imageUrl
    }));

    startGame();
  } catch (error) {
    console.error("Failed to load words", error);
    // alert("Error loading game data");

    // Fallback words 
    WORDS = [
      { 
        word: "CAT", 
        image: "../assets/images/cat.jpeg" 
      },
      { 
        word: "DOG", 
        image: "../assets/images/dog.jpeg" 
      },
      { 
        word: "LION", 
        image: "../assets/images/lion.jpeg" 
      },
    ];
    startGame();

  }
}


const DIRECTIONS = [
  { r: 0, c: 1 },   // right
  // { r: 0, c: -1 },  // left
  { r: 1, c: 0 },   // down
  { r: -1, c: 0 }   // up
];

let timerInterval = null;
let isMouseDown = false;



/**********************
 * GAME STATE
 **********************/
let grid = [];
let selectedCells = [];
let foundWords = [];
let currentWordIndex = 0;
let score = 0;
let timeLeft = 60;

/**********************
 * INIT
 **********************/
loadWordsFromAPI();

/**********************
 * START GAME AFTER LOADING WORDS
 **********************/
function startGame() {
  createEmptyGrid();
  placeAllWords();
  fillEmptyCells();
  renderGrid();
  startTimer();
  showCurrentImage();
}

/**********************
 * GRID GENERATION
 **********************/
function createEmptyGrid() {
  grid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null)
  );
}

function placeAllWords() {
  WORDS.forEach(item => placeWord(item.word));
}

function placeWord(word) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const row = rand(GRID_SIZE);
    const col = rand(GRID_SIZE);
    const dir = DIRECTIONS[rand(DIRECTIONS.length)];
    
    if (canPlace(word, row, col, dir)) {
      for (let i = 0; i < word.length; i++) {
        grid[row + dir.r * i][col + dir.c * i] = word[i];
      }
      return;
    }
  }
}

function canPlace(word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.r * i;
    const c = col + dir.c * i;

    if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE)
      return false;

    if (grid[r][c] && grid[r][c] !== word[i])
      return false;
  }
  return true;
}

function fillEmptyCells() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letters[rand(letters.length)];
      }
    }
  }
}

/**********************
 * RENDER GRID
 **********************/
function renderGrid() {
  const gridEl = document.querySelector(".letter-grid");
  gridEl.innerHTML = "";
  document.addEventListener("mouseup", onMouseUp);

  grid.forEach((row, r) => {
    row.forEach((letter, c) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = letter;
      cell.dataset.row = r;
      cell.dataset.col = c;
      // cell.addEventListener("click", () => onCellClick(cell));
      cell.addEventListener("mousedown", e => onMouseDown(e, cell));
      cell.addEventListener("mouseenter", () => onMouseEnter(cell));

      // Touch Events
      cell.addEventListener(
        "touchstart",
        e => onTouchStart(e, cell),
        { passive: false }
      );

      cell.addEventListener(
        "touchend",
        onTouchEnd
      );

      gridEl.appendChild(cell);
    });
  });
}

/**********************
 * CELL SELECTION LOGIC
 **********************/
function onCellClick(cell) {
  const row = +cell.dataset.row;
  const col = +cell.dataset.col;

  if (selectedCells.length > 0) {
    const last = selectedCells[selectedCells.length - 1];
    if (!isAdjacent(last, { row, col })) {
        resetSelection();
        return;
    }
  }

  if (selectedCells.includes(cell)) return;

  cell.classList.add("selected");
  selectedCells.push(cell);

}

function isAdjacent(a, b) {
  const dr = Math.abs(a.dataset.row - b.row);
  const dc = Math.abs(a.dataset.col - b.col);
  return (dr + dc === 1);
}

/**********************
 * WORD CHECK
 **********************/
function checkWord() {
  const word = selectedCells.map(c => c.textContent).join("");
  const target = WORDS[currentWordIndex]?.word;

  if (word === target) {
    markCorrect();
  }
  if (!target.startsWith(word)) {
    resetSelection();
  }
}

function markCorrect() {
  selectedCells.forEach(c => {
    c.classList.remove("selected");
    c.classList.add("correct");
  });

  foundWords.push(WORDS[currentWordIndex]);
//   addImage(WORDS[currentWordIndex].image);
    removeHighLight()

  score += 10;
  document.getElementById("score").textContent = score;

  selectedCells = [];
  currentWordIndex++;

  showCurrentImage();
  checkWin();
}

/**********************
 * IMAGES
 **********************/
function removeHighLight(){
    const container = document.querySelector(".images-container");
    const rightIcon = document.createElement("div");
    rightIcon.classList.add("right-icon");
    rightIcon.innerHTML = '<img src="../assets/icons/right-icon.png" alt="right-icon">';
    container.lastChild.firstChild.style.border = "none";
    container.lastChild.appendChild(rightIcon)
}

function showCurrentImage() {
  if (currentWordIndex >= WORDS.length) return;
  addImage(WORDS[currentWordIndex].image, true);
}

function addImage(src, isCurrent = false) {
  const container = document.querySelector(".images-container");
  const singleImageDiv = document.createElement("div");
  const img = document.createElement("img");
  singleImageDiv.className = "image";
  img.src = src;
  if (isCurrent) img.style.border = "2px solid #22c55e";
  singleImageDiv.appendChild(img);
  container.appendChild(singleImageDiv);
}

/**********************
 * TIMER
 **********************/
function startTimer() {
  const timerEl = document.getElementById("timer");
  const loseCard = document.querySelector(".lose")
  const finalScor = document.getElementById("final-score")
  const restartBtn = document.getElementById("restart-btn")
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0){
        finalScor.textContent = score;
        clearInterval(timerInterval);
        loseCard.style.display = "block"

    }
    restartBtn.addEventListener("click", () => {
        location.reload()
    })
  }, 1000);
}
// CHECK WIN 
function checkWin() {
  if (currentWordIndex === WORDS.length) {
    clearInterval(timerInterval);

    const timeTaken = 60 - timeLeft;
    const winCard = document.querySelector(".win")
    const finshedTime = document.getElementById('finshed-time')
    const finalScore = document.getElementById('all-score')
    const restartBtn = document.getElementById('again-btn')
    const nextBtn = document.getElementById('next-btn')
    
    finalScore.textContent = score
    finshedTime.textContent = timeTaken + " seconds"
    winCard.style.display = "block"
    
    restartBtn.addEventListener('click', () => {
        location.reload()
    })
}
}

/**********************
 * RESET LOGIC
 **********************/
function resetSelection() {
  // شيل اللون المؤقت من الحروف المختارة
  selectedCells.forEach(cell => {
    cell.classList.remove("selected");
  });

  // فضي الاختيار الحالي
  selectedCells = [];

}

/**********************
 * MOUSE DRAG SUPPORT
 **********************/

function onMouseDown(e, cell) {
  e.preventDefault();
  resetSelection();
  isMouseDown = true;
  onCellClick(cell);
}

function onMouseEnter(cell) {
  if (!isMouseDown) return;
  onCellClick(cell);
}

function onMouseUp() {
  if (!isMouseDown) return;

  isMouseDown = false;
  checkWordOnRelease();
}

document.addEventListener(
  "touchmove",
  e => {
    if (!isTouching) return;

    e.preventDefault(); // 🔴 مهم جدًا

    const touch = e.touches[0];
    const element = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );

    if (element && element.classList.contains("cell")) {
      onCellClick(element);
    }
  },
  { passive: false }
);


function checkWordOnRelease() {
  if (selectedCells.length === 0) return;

  const word = selectedCells.map(c => c.textContent).join("");
  const target = WORDS[currentWordIndex]?.word;

  if (word === target) {
    markCorrect();
  } else {
    resetSelection();
  }
}

/**********************
 * TOUCH SUPPORT
 **********************/
let isTouching = false;

function onTouchStart(e, cell) {
  e.preventDefault(); // يمنع Scroll
  resetSelection();
  isTouching = true;
  onCellClick(cell);
}

function onTouchMove(e) {
  if (!isTouching) return;

  const touch = e.touches[0];
  const element = document.elementFromPoint(
    touch.clientX,
    touch.clientY
  );

  if (element && element.classList.contains("cell")) {
    onCellClick(element);
  }
}

function onTouchEnd() {
  if (!isTouching) return;

  isTouching = false;
  checkWordOnRelease();
}



/**********************
 * HELPERS
 **********************/
function rand(max) {
  return Math.floor(Math.random() * max);
}
