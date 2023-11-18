const selectors = { // Objek selectors untuk menyimpan elemen-elemen HTML yang akan diakses dalam skrip
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('.button'),
    win: document.querySelector('.win'),
};

const state = { // Objek state untuk menyimpan keadaan permainan
    gameStarted: false, // Status permainan dimulai atau tidak
    flippedCards: 0, // Jumlah kartu yang sedang dibalik
    totalFlips: 0, // Jumlah total langkah yang diambil
    totalTime: 0, // Total waktu permainan
    loop: null, // ID interval untuk waktu permainan
};

const shuffle = array => { // Fungsi untuk mengacak urutan elemen dalam array
    const clonedArray = [...array];

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const original = clonedArray[i];

        clonedArray[i] = clonedArray[randomIndex];
        clonedArray[randomIndex] = original;
    }
    return clonedArray;
};

const pickRandom = (array, items) => { // Fungsi untuk memilih sejumlah elemen secara acak dari array

    const clonedArray = [...array];
    const randomPicks = [];

    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);

        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }
    return randomPicks;
};

const generateGame = () => { // Fungsi untuk menghasilkan papan permainan dengan elemen-elemen yang diacak
    const dimensions = selectors.board.getAttribute('data-dimension');
    if (dimensions % 2 !== 0) {
        throw new Error("Dimensi harus bilangan genap");
    }
    const emojis = ['🥯', '🫐', '🥑', '🍌', '🌽', '🍔', '🥩', '🍍', '🍉', '🍇'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
        </div>
    `;
    const parser = new DOMParser().parseFromString(cards, 'text/html');
    selectors.board.replaceWith(parser.querySelector('.board'));
};

const startGame = () => { // Fungsi untuk memulai permainan dengan mengatur interval waktu
    state.gameStarted = true;
    selectors.start.classList.add('disabled');

    state.loop = setInterval(() => {
        state.totalTime++;

        selectors.moves.innerText = `${state.totalFlips} moves`;
        selectors.timer.innerText = `Time: ${state.totalTime} sec`;
    }, 1000);
};
const flipBackCards = () => { // Fungsi untuk membalikkan kembali kartu yang belum di-matched
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });
    state.flippedCards = 0;
};

const checkWin = () => { // Fungsi untuk mengecek apakah semua kartu telah di-matched dan memunculkan pesan menang

    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    Kamu menang!<br />
                    with <span class="highlight">${state.totalFlips}</span>
                    moves<br />
                    under <span class="highlight">${state.totalTime}</span>
                    seconds
                </span>
            `;
            clearInterval(state.loop);
            selectors.win.style.display = 'block'; // Tambahan baris ini untuk memastikan elemen "win" terlihat dan menampilkan pesan menang
        }, 1000);
    }
};


const flipCard = card => { // Fungsi untuk membalikkan kartu saat diklik
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards.forEach(card => {
                card.classList.add('matched');
            });

            setTimeout(() => {
                flipBackCards();
                checkWin();
            }, 1000);
        } else {
            setTimeout(() => {
                flipBackCards();
            }, 1000);
        }
    }
};

const attachEventListeners = () => { // Fungsi untuk menangani event klik
    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped') && !eventParent.className.includes('matched')) {
            flipCard(eventParent);
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame();
        }
    });
};

generateGame(); // Memulai permainan dan menambahkan event listeners
attachEventListeners();
