const ScoreDisplay = document.getElementById('result')
let score = 0
ScoreDisplay.innerHTML = score
const GridDisplay = document.getElementById('grid')
const CardArray = [
    {
        name: 'أوزي بوزي',
        img: 'images/F0237351.PNG'
    },
    {
        name: 'pilliger',
        img: 'images/F0259336.PNG'
    },
    {
        name: 'molister',
        img: 'images/F0286933.PNG'
    },
    {
        name: 'الحته وهو بيضحك',
        img: 'images/Screenshot 2025-11-14 161421.png'
    },
    {
        name: 'القائد',
        img: 'images/F0305649.PNG'
    },
    {
        name: 'aki',
        img: 'images/F0305652.PNG'
    },
    {
        name: 'lemonz',
        img: 'images/F0306753.PNG'
    },
    {
        name: 'البنظ والكنظ',
        img: 'images/F0312228.PNG'
    },
    {
        name: 'الحته',
        img: 'images/F0314773.PNG'
    },
    {
        name: 'الحته وهو مكسوف',
        img: 'images/F0316513.PNG'
    },
    {
        name: 'icecream',
        img: 'images/F0306748.PNG'
    },
    {
        name: 'lemonscream',
        img: 'images/F0316519.PNG'
    },
    {
        name: 'أوزي بوزي',
        img: 'images/F0237351.PNG'
    },
    {
        name: 'pilliger',
        img: 'images/F0259336.PNG'
    },
    {
        name: 'molister',
        img: 'images/F0286933.PNG'
    },
    {
        name: 'الحته وهو بيضحك',
        img: 'images/Screenshot 2025-11-14 161421.png'
    },
    {
        name: 'القائد',
        img: 'images/F0305649.PNG'
    },
    {
        name: 'aki',
        img: 'images/F0305652.PNG'
    },
    {
        name: 'lemonz',
        img: 'images/F0306753.PNG'
    },
    {
        name: 'البنظ والكنظ',
        img: 'images/F0312228.PNG'
    },
    {
        name: 'الحته',
        img: 'images/F0314773.PNG'
    },
    {
        name: 'الحته وهو مكسوف',
        img: 'images/F0316513.PNG'
    },
    {
        name: 'icecream',
        img: 'images/F0306748.PNG'
    },
    {
        name: 'lemonscream',
        img: 'images/F0316519.PNG'
    }
]
//idk what ()=>0.5 - Math.random() does
CardArray.sort(() => 0.5 - Math.random())
console.log(CardArray)
createBoard()
function createBoard() {
    for (let i = 0; i < CardArray.length; i++) {
        const card = document.createElement('img')
        card.setAttribute('src', 'images/F0394208.PNG')
        card.setAttribute('data-id', i)
        card.addEventListener('click', flipCard)
        GridDisplay.appendChild(card)
    }
}
const originalCardsChosen = []
const cardsChosen = []
const cardsChosenId = []

function flipCard() {
    if ((this.getAttribute('src') === 'images/F0394208.PNG')) {
        console.log('i entered flip')
        let cardId = this.getAttribute('data-id')
        cardsChosenId.push(cardId)
        cardsChosen.push(CardArray[cardId])
        originalCardsChosen.push(this)
        this.setAttribute('src', CardArray[cardId].img)
        if (cardsChosen.length === 2) {
            console.log('i entered if')
            setTimeout(checkMatch, 500)
        }
    }
}
function checkMatch() {
    if (cardsChosen[0].name === cardsChosen[1].name) {
        score += 50
        ScoreDisplay.innerHTML = score
        originalCardsChosen.pop()
        originalCardsChosen.pop()
        cardsChosen.pop()
        cardsChosen.pop()

        if (score % 600 === 0) {
            GridDisplay.innerHTML = ''
            CardArray.sort(() => 0.5 - Math.random())
            createBoard()
        }
    }
    else {
        originalCardsChosen[0].setAttribute('src', 'images/F0394208.PNG')
        originalCardsChosen[1].setAttribute('src', 'images/F0394208.PNG')
        originalCardsChosen.pop()
        originalCardsChosen.pop()
        cardsChosen.pop()
        cardsChosen.pop()
    }
}