/**********************
 * GAME CONFIG
 **********************/
const gridElement = document.querySelector(".letter-grid");
const GRID_SIZE = 6;
let WORDS = [];
const DIRECTIONS = [
  { r: 0, c: 1 },   // right
  // { r: 0, c: -1 },  // left
  { r: 1, c: 0 },   // down
  { r: -1, c: 0 }   // up
];
let timerInterval = null;
let isMouseDown = false;

function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
}

// Function to hide the loading indicator
function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

/**********************
 * FETCH DATA FROM API
 **********************/ 
async function loadWordsFromAPI(level) {

    showLoading(); // Set loading to true before the API call

  const baseUrl = "https://picto.runasp.net"
  try {
    const response = await fetch(`${baseUrl}/api/Words/difficulty/${level}`);
    if (response.ok) {
      const data = await response.json();
  
      WORDS = data.map(item => ({
        id: item.id,
        word: item.word.toUpperCase(),
        image: item.imageUrl
      }));
  
      // startGame();
      console.log(WORDS, 'api');
      
  
    }else{
      throw new Error('Network response was not ok'); 
    }
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
    // startGame();

  }finally{
    hideLoading(); // Set loading to false after the API call is complete
  }
}

document.getElementById("startBtn").addEventListener("click", async () => {
  const level = document.getElementById("levelInput").value;
  console.log(level,'LLL');
  document.getElementById("startBtn").style.pointerEvents = 'none'
  

  if (!level) {
    alert("Please enter a valid level");
    return;
  }

  await loadWordsFromAPI(level);
  startGame();

});

/**********************
 * GAME STATE
 **********************/
let grid = [];
let selectedCells = [];
let foundWords = [];
let currentWordIndex = 0;
let score = 0;
let timeLeft = 90;

/**********************
 * INIT
 **********************/
// loadWordsFromAPI();

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
document.addEventListener("mouseup", onMouseUp);
function renderGrid() {
  const gridEl = document.querySelector(".letter-grid");
  gridEl.innerHTML = "";

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

  }, 1000);
  
  restartBtn.addEventListener("click", () => {
      location.reload()
  })
}
// CHECK WIN 
function checkWin() {
  if (currentWordIndex === WORDS.length) {
    clearInterval(timerInterval);

    const timeTaken = 90 - timeLeft;
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
    nextBtn.addEventListener('click', async () => {
      winCard.style.display = "none"
      timerInterval = null;
      document.querySelector(".images-container").innerHTML = '';
      currentWordIndex = 0;
      timeLeft = 90;

      const level = document.getElementById("levelInput");
      levelValue = level.value;
      if(levelValue < 2)
      {
        levelValue++
        level.value = levelValue;
      }
      await loadWordsFromAPI(levelValue);
      startGame()

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
 * HELPERS
 **********************/
function rand(max) {
  return Math.floor(Math.random() * max);
}
