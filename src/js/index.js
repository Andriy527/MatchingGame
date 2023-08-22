class Card {
    constructor(value) {
        this.value = value;
        this.isFlipped = false;
        this.element = this.createCardElement();
    }

    createCardElement() {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.value = this.value;
        cardElement.textContent = '?';
        cardElement.addEventListener('click', () => this.animateFlip());
        return cardElement;
    }

    reset() {
        this.isFlipped = false;
        this.element.textContent = '?';
    }

    animateFlip() {
        if (this.isFlipped) return;

        this.isFlipped = true;

        anime({
            targets: this.element,
            scaleX: [{value: 0, delay: 50}],
            complete: () => {
                this.element.textContent = this.isFlipped ? this.value : '?';
                anime({
                    targets: this.element,
                    scaleX: [{value: 1, delay: 50}],
                });
                game.checkForMatch(this);
            }
        });
    }
}

class MatchGrid {
    constructor(width, height, cols, rows, theme, timeLimit) {
        this.width = width;
        this.height = height;
        this.rows = rows;
        this.cols = cols;
        this.theme = theme;
        this.timeLimit = timeLimit;
        this.cards = [];
        this.matchedPairs = 0;
        this.firstCard = null;
        this.secondCard = null;
        this.isFlipping = false;
        this.isTimerOn = false;
        this.timer = null;

        this.gameContainer = document.querySelector('.game-container');
        this.timerElement = document.querySelector('.timer-value');
        this.scoreElement = document.querySelector('.score-value');

        this.initGame();
    }

    initGame() {
        const totalCards = this.rows * this.cols;
        const uniqueCardValues = this.generateUniqueCardValues(totalCards / 2);

        this.gameContainer.style.gridTemplateRows = this.setRows();
        this.gameContainer.style.gridTemplateColumns = this.setColums();

        for (const value of uniqueCardValues) {
            this.cards.push(new Card(value), new Card(value));
        }

        this.shuffleCards();
        this.setThemeOptions();

        for (const card of this.cards) {
            this.gameContainer.appendChild(card.element);
        }
    }

    setThemeOptions() {
        if (this.theme) {
            const root = document.querySelector(':root');

            for (const [key, value] of Object.entries(this.theme)) {
                root.style.setProperty(`--${key}`, value);
            }
        }
    }

    setRows() {
        let rowProperty = '';

        for (let i = 0; i < this.rows; i++) {
            rowProperty += ` ${this.width / this.rows}px`;
        }

        return rowProperty;
    }

    setColums() {
        let colProperty = '';

        for (let i = 0; i < this.cols; i++) {
            colProperty += ` ${this.height / this.cols}px`;
        }

        return colProperty;
    }

    startTimer() {
        this.timer = this.timeLimit;
        this.updateTimerDisplay();
        this.setTimerSettings();
    }

    setTimerSettings() {
        this.isTimerOn = true;

        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();

            if (this.timer <= 0) {
                this.stopTimer();
                alert('Time is up! Game over.');
                this.resetGame();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerElement.textContent = this.timer;
    }

    stopTimer() {
        this.isTimerOn = false;
        clearInterval(this.timerInterval);
    }

    generateUniqueCardValues(count) {
        const values = [];
        for (let i = 1; i <= count; i++) {
            values.push(i);
        }
        return values;
    }

    shuffleCards() {
        let currentIndex = this.cards.length, randomIndex;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [this.cards[currentIndex], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[currentIndex]];
        }
    }

    checkForMatch(card) {
        if (this.isFlipping) return;

        if (!this.firstCard) {
            this.firstCard = card;
            return;
        }

        this.secondCard = card;
        this.isFlipping = true;

        if (this.firstCard.value === this.secondCard.value) {
            this.matchedPairs++;
            this.updateScore();

            if (this.matchedPairs === this.rows * this.cols / 2) {
                setTimeout(() => {
                    alert('Congratulations! You won the game!');
                    this.resetGame();
                }, 500);
            } else {
                this.resetCards();
            }
        } else {
            setTimeout(() => {
                this.firstCard.reset();
                this.secondCard.reset();
                this.resetCards();
            }, 1000);
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.matchedPairs;
    }

    resetScore() {
        this.scoreElement.textContent = 0;
    }

    resetCards() {
        this.firstCard = null;
        this.secondCard = null;
        this.isFlipping = false;
    }

    resetGame() {
        this.cards = [];
        this.matchedPairs = 0;
        this.gameContainer.innerHTML = '';
        this.timer = this.timeLimit;
        this.resetScore();
        this.initGame();
    }

}

const themeOptions = {
    bgColor: '#f3f3f3',
    itemsColor: '#8d8989',
    fontColor: '#282727'
}

const game = new MatchGrid(500, 500, 2, 2, themeOptions, 60);

const initGameInfo = () => {
    game.timerElement = document.querySelector('.timer-value');
    game.scoreElement = document.querySelector('.score-value');
    game.startTimer();
}

document.getElementById('app-wrapper').addEventListener('mouseleave', () => {
    game.stopTimer();
})

document.getElementById('app-wrapper').addEventListener('mouseover', () => {
    if (!game.isTimerOn) game.setTimerSettings();
})

document.getElementById('reset-button').addEventListener('click', () => {
    game.resetGame();
})

initGameInfo();