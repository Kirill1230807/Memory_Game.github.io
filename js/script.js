document.addEventListener("DOMContentLoaded", function () {
    const FLIP_DELAY = 1000;
    const CARD_TYPES = [
        'banana', 'curry-rice', 'dango', 'dumpling',
        'jar', 'apple', 'pizza', 'burger', 'lemon',
        'fish', 'rice-ball', 'ice-cream', 'sushi',
        'cake', 'grape', 'salad'
    ];

    const gameBoard = document.querySelector(".memory-game");
    const startGameButton = document.getElementById("start-game");
    const resetSettingButton = document.getElementById("reset-settings");
    const restartGameButton = document.getElementById("restart-game");
    const gameSettingsDiv = document.getElementById("game-settings");
    const sizeSelect = document.getElementById("size");
    const difficultySelect = document.getElementById("difficulty");
    const timerDisplay = document.getElementById("timer");
    const movesDisplay = document.getElementById("moves");

    let cards = [];
    let timerInterval;
    let timeLeft;
    let moves = 0;
    let state = {
        flippedCards: [],
        matchedCards: [],
        lockBoard: false,
        shuffledOrder: []
    };

    startGameButton.addEventListener("click", startGame);
    resetSettingButton.addEventListener("click", resetSettings);
    restartGameButton.addEventListener("click", restartGame);

    function startGame() {
        const size = parseInt(sizeSelect.value);
        generateCards(size);
        gameSettingsDiv.style.display = 'none';
        gameBoard.className = `memory-game size-${size}x${size}`;

        const selectedDifficulty = difficultySelect.options[difficultySelect.selectedIndex];
        timeLeft = parseInt(selectedDifficulty.getAttribute('data-time'));
        startTimer(timeLeft);

        moves = 0;
        updateMovesDisplay();
    }

    function generateCards(size) {
        gameBoard.innerHTML = '';
        const totalCards = size * size;
        const pairsNeeded = totalCards / 2;
        const selectedTypes = CARD_TYPES.slice(0, pairsNeeded);

        cards = [];
        selectedTypes.forEach(type => {
            for (let i = 0; i < 2; i++) {
                const card = document.createElement('div');
                card.className = 'memory-card';
                card.dataset.food = type;
                card.innerHTML = `
                    <img class="front-face" src="img/${type}.png" alt="${type}">
                    <img class="back-face" src="img/raspberry.png" alt="Card Back">
                `;
                card.addEventListener('click', handleClick);
                gameBoard.appendChild(card);
                cards.push(card);
            }
        });

        state = {
            flippedCards: [],
            matchedCards: [],
            lockBoard: false,
            shuffledOrder: shuffle(cards.length)
        };
        render();
    }

    function restartGame() {
        clearInterval(timerInterval);
        startGame();
    }

    function resetSettings() {
        sizeSelect.value = "4";
        difficultySelect.value = "easy";
        moves = 0;
        updateMovesDisplay();
    }

    function startTimer(duration) {
        clearInterval(timerInterval);
        timeLeft = duration;
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert('Час вийшов! Спробуйте ще раз.');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function updateMovesDisplay() {
        movesDisplay.textContent = moves;
    }

    function incrementMoves() {
        moves++;
        updateMovesDisplay();
    }

    function shuffle(count) {
        return Array.from({ length: count }, (_, i) => i)
            .sort(() => Math.random() - 0.5);
    }

    function isMatch(card1, card2) {
        return card1.dataset.food === card2.dataset.food;
    }

    function handleClick(e) {
        const clickedIndex = cards.indexOf(e.currentTarget);
        if (state.lockBoard || state.flippedCards.includes(clickedIndex) || state.matchedCards.includes(clickedIndex)) {
            return;
        }

        const newState = {
            ...state,
            flippedCards: [...state.flippedCards, clickedIndex]
        };

        if (newState.flippedCards.length === 2) {
            incrementMoves();
            const [firstIdx, secondIdx] = newState.flippedCards;
            if (isMatch(cards[firstIdx], cards[secondIdx])) {
                newState.matchedCards = [...newState.matchedCards, firstIdx, secondIdx];
                newState.flippedCards = [];
                if (newState.matchedCards.length === cards.length) {
                    setTimeout(() => alert(`Перемога! Ви знайшли всі пари за ${moves} кроків!`), 500);
                }
            } else {
                newState.lockBoard = true;
                setTimeout(() => {
                    render({ ...newState, flippedCards: [], lockBoard: false });
                    state = { ...newState, flippedCards: [], lockBoard: false };
                }, FLIP_DELAY);
            }
        }

        state = newState;
        render(newState);
    }

    function render(currentState = state) {
        cards.forEach((card, i) => {
            card.style.order = currentState.shuffledOrder[i];
            card.classList.toggle('flip',
                currentState.flippedCards.includes(i) || currentState.matchedCards.includes(i)
            );
        });
    }
});