const ScoreDisplay = document.getElementById('result')
let score = 0
ScoreDisplay.innerHTML = score
const GridDisplay = document.getElementById('grid')
let CardArray = [
    // {
    //     name: 'أوزي بوزي',
    //     img: '../assets/images/F0237351.PNG'
    // },
    // {
    //     name: 'pilliger',
    //     img: '../assets/images/F0259336.PNG'
    // },
    // {
    //     name: 'molister',
    //     img: '../assets/images/F0286933.PNG'
    // },
    // {
    //     name: 'الحته وهو بيضحك',
    //     img: '../assets/images/Screenshot 2025-11-14 161421.png'
    // },
    // {
    //     name: 'القائد',
    //     img: '../assets/images/F0305649.PNG'
    // },
    // {
    //     name: 'CAT',
    //     img: '../assets/images/cat.jpeg'
    // },
    // {
    //     name: 'lemonz',
    //     img: '../assets/images/F0306753.PNG'
    // },
    // {
    //     name: 'البنظ والكنظ',
    //     img: '../assets/images/F0312228.PNG'
    // },
    // {
    //     name: 'الحته',
    //     img: '../assets/images/F0314773.PNG'
    // },
    // {
    //     name: 'الحته وهو مكسوف',
    //     img: '../assets/images/F0316513.PNG'
    // },
    // {
    //     name: 'icecream',
    //     img: '../assets/images/F0306748.PNG'
    // },
    // {
    //     name: 'lemonscream',
    //     img: '../assets/images/F0316519.PNG'
    // },
    // {
    //     name: 'أوزي بوزي',
    //     img: '../assets/images/F0237351.PNG'
    // },
    // {
    //     name: 'pilliger',
    //     img: '../assets/images/F0259336.PNG'
    // },
    // {
    //     name: 'molister',
    //     img: '../assets/images/F0286933.PNG'
    // },
    // {
    //     name: 'الحته وهو بيضحك',
    //     img: '../assets/images/Screenshot 2025-11-14 161421.png'
    // },
    // {
    //     name: 'القائد',
    //     img: '../assets/images/F0305649.PNG'
    // },
    // {
    //     name: 'CAT',
    //     img: '../assets/images/cat.jpeg'
    // },
    // {
    //     name: 'lemonz',
    //     img: '../assets/images/F0306753.PNG'
    // },
    // {
    //     name: 'البنظ والكنظ',
    //     img: '../assets/images/F0312228.PNG'
    // },
    // {
    //     name: 'الحته',
    //     img: '../assets/images/F0314773.PNG'
    // },
    // {
    //     name: 'الحته وهو مكسوف',
    //     img: '../assets/images/F0316513.PNG'
    // },
    // {
    //     name: 'icecream',
    //     img: '../assets/images/F0306748.PNG'
    // },
    // {
    //     name: 'lemonscream',
    //     img: '../assets/images/F0316519.PNG'
    // }
]

function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
}

// Function to hide the loading indicator
function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

/**********************
 * INIT
 **********************/
loadWordsFromAPI();


/**********************
 * FETCH DATA FROM API
 **********************/ 
// EXAMPLE DATA 
  // {
  //   "id": 1,
  //   "word": "apple",
  //   "imageUrl": "https://i.imgur.com/CGuDGFN.png",
  //   "difficultyLevel": 1
  // },
  
async function loadWordsFromAPI() {

    showLoading(); // Set loading to true before the API call

  const baseUrl = "https://pictopuzzle.runasp.net"
  try {
    const response = await fetch(`${baseUrl}/api/Words`);
    if(response.ok){
        const data = await response.json();
            
            CardArray = data.map(item => ({
            id: item.id,
            word: item.word.toUpperCase(),
            image: item.imageUrl
            }));
        
        /**********************
        * DUPLICATE DATA
        **********************/ 
            CardArray.push(...CardArray);
            console.log(CardArray)
        
        // call creation function 
            createBoard();
    }else{
        throw new Error('Network response was not ok');  
    }

  } catch (error) {
    console.error("Failed to load words", error);
    // alert("Error loading game data");

    // Fallback words 
    CardArray = [
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
    createBoard();
  }finally {
    hideLoading(); // Set loading to false after the API call is complete
  }
}

//idk what ()=>0.5 - Math.random() does
function createBoard() {
// RESORT ARRAY 
    CardArray.sort(() => 0.5 - Math.random())

// CREATE IMAGE CARDS 
    for (let i = 0; i < CardArray.length; i++) {
        const card = document.createElement('img')
        card.setAttribute('src', CardArray[i].image)
        card.setAttribute('data-id', i)
        card.addEventListener('click', flipCard)
        GridDisplay.appendChild(card)

        setTimeout( () => {
            card.src = '../assets/images/F0394208.PNG'
            
        }
        ,1500)
    }
}
const originalCardsChosen = []
const cardsChosen = []
const cardsChosenId = []

function flipCard() {
    if ((this.getAttribute('src') === '../assets/images/F0394208.PNG')) {
        console.log('i entered flip')
        let cardId = this.getAttribute('data-id')
        cardsChosenId.push(cardId)
        cardsChosen.push(CardArray[cardId])
        originalCardsChosen.push(this)
        this.setAttribute('src', CardArray[cardId].image)
        if (cardsChosen.length === 2) {
            console.log('i entered if')
            GridDisplay.classList.toggle('event-pointer')
            setTimeout(() => {
                checkMatch()
                GridDisplay.classList.toggle('event-pointer')
            }, 500)
        }
    }
}
function checkMatch() {
    if (cardsChosen[0].id === cardsChosen[1].id) {
        score += 10
        ScoreDisplay.innerHTML = score
        originalCardsChosen.pop()
        originalCardsChosen.pop()
        cardsChosen.pop()
        cardsChosen.pop()

        if (score % CardArray.length*10 === 0) {

            const winCard = document.querySelector(".win")
            const finalScore = document.getElementById('all-score')
            const restartBtn = document.getElementById('again-btn')
            
            finalScore.textContent = score
            winCard.style.display = "block"

            restartBtn.addEventListener('click', () => {
                winCard.style.display = "none"
                GridDisplay.innerHTML = ''
                score = 0
                ScoreDisplay.innerHTML = score
                CardArray.sort(() => 0.5 - Math.random())
                createBoard();
            })
        }
    }
    else {
        originalCardsChosen[0].setAttribute('src', '../assets/images/F0394208.PNG')
        originalCardsChosen[1].setAttribute('src', '../assets/images/F0394208.PNG')
        originalCardsChosen.pop()
        originalCardsChosen.pop()
        cardsChosen.pop()
        cardsChosen.pop()
    }
}