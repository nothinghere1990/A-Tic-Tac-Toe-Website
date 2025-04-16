// Game state variables
let currentPlayer = 1; // 1 for player 1, 2 for player 2
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""]; // Empty cells
let player1Markers = []; // Track player 1's markers in order of placement
let player2Markers = []; // Track player 2's markers in order of placement
let player1CustomMarker = null; // Custom image for player 1
let player2CustomMarker = null; // Custom image for player 2

// Winning combinations
const winningConditions = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6]  // Diagonal top-right to bottom-left
];

// DOM elements
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('status-message');
const restartButton = document.getElementById('restart-btn');
const player1Upload = document.getElementById('p1-upload');
const player2Upload = document.getElementById('p2-upload');
const player1MarkerDisplay = document.getElementById('p1-marker');
const player2MarkerDisplay = document.getElementById('p2-marker');

// Initialize the game
function initGame() {
    // Set default markers
    player1MarkerDisplay.textContent = "O";
    player2MarkerDisplay.textContent = "X";

    // Add event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', cellClicked);
    });

    restartButton.addEventListener('click', restartGame);
    player1Upload.addEventListener('change', handlePlayer1Upload);
    player2Upload.addEventListener('change', handlePlayer2Upload);
}

// Handle cell click
function cellClicked() {
    const cellIndex = parseInt(this.getAttribute('data-index'));

    // Check if cell is already occupied or game is not active
    if (gameState[cellIndex] !== "" || !gameActive) {
        return;
    }

    // Update game state
    gameState[cellIndex] = currentPlayer;

    // Track marker placement
    if (currentPlayer === 1) {
        player1Markers.push(cellIndex);
    } else {
        player2Markers.push(cellIndex);
    }

    // Update the cell display
    updateCellDisplay(cellIndex);

    // Check for win or draw
    checkResult();

    // If game is still active (no win/draw), apply the special rule for marker removal
    if (gameActive) {
        // Special rule: Remove oldest marker if this is the 4th+ marker
        if (currentPlayer === 1 && player1Markers.length >= 4) {
            const oldestMarkerIndex = player1Markers.shift();
            removeMarker(oldestMarkerIndex);
        } else if (currentPlayer === 2 && player2Markers.length >= 4) {
            const oldestMarkerIndex = player2Markers.shift();
            removeMarker(oldestMarkerIndex);
        }

        // Switch player
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        statusMessage.textContent = `玩家 ${currentPlayer} 的回合`;
    }
}

// Remove a marker with animation
function removeMarker(cellIndex) {
    const cell = cells[cellIndex];

    // Add fade-out animation
    cell.classList.add('fade-out');

    // After animation completes, clear the cell
    setTimeout(() => {
        gameState[cellIndex] = "";
        cell.innerHTML = "";
        cell.classList.remove('p1', 'p2', 'fade-out');
    }, 300);
}

// Update cell display based on game state
function updateCellDisplay(cellIndex) {
    const cell = cells[cellIndex];

    // Clear cell content
    cell.innerHTML = "";
    cell.classList.remove('p1', 'p2');

    if (gameState[cellIndex] === 1) {
        // Player 1's marker
        cell.classList.add('p1', 'fade-in');
        if (player1CustomMarker) {
            const img = document.createElement('img');
            img.src = player1CustomMarker;
            cell.appendChild(img);
        } else {
            cell.textContent = "O";
        }
    } else if (gameState[cellIndex] === 2) {
        // Player 2's marker
        cell.classList.add('p2', 'fade-in');
        if (player2CustomMarker) {
            const img = document.createElement('img');
            img.src = player2CustomMarker;
            cell.appendChild(img);
        } else {
            cell.textContent = "X";
        }
    }

    // Remove the animation class after it completes
    setTimeout(() => {
        cell.classList.remove('fade-in');
    }, 300);
}

// Update all cells display (used when markers change)
function updateAllCellsDisplay() {
    cells.forEach((cell, index) => {
        if (gameState[index] !== "") {
            updateCellDisplay(index);
        }
    });
}

// Check for win or draw
function checkResult() {
    let roundWon = false;
    let winningCells = [];

    // Check for winning combinations
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];

        // Skip if any cell in the combination is empty
        if (gameState[a] === "" || gameState[b] === "" || gameState[c] === "") {
            continue;
        }

        // Check if all cells in the combination have the same player
        if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
            roundWon = true;
            winningCells = [a, b, c];
            break;
        }
    }

    // Handle win
    if (roundWon) {
        statusMessage.textContent = `玩家 ${currentPlayer} 獲勝！`;
        gameActive = false;

        // Highlight winning cells
        winningCells.forEach(index => {
            cells[index].classList.add('winning-cell');
        });

        return;
    }

    // Check for draw (if all cells are filled)
    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusMessage.textContent = "遊戲平局！";
        gameActive = false;
        return;
    }
}

// Handle player 1 custom marker upload
function handlePlayer1Upload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            player1CustomMarker = e.target.result;
            player1MarkerDisplay.innerHTML = "";

            const img = document.createElement('img');
            img.src = player1CustomMarker;
            img.alt = "Player 1 Marker";
            player1MarkerDisplay.appendChild(img);

            // Update all player 1 markers on the board
            updateAllCellsDisplay();
        };
        reader.readAsDataURL(file);
    }
}

// Handle player 2 custom marker upload
function handlePlayer2Upload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            player2CustomMarker = e.target.result;
            player2MarkerDisplay.innerHTML = "";

            const img = document.createElement('img');
            img.src = player2CustomMarker;
            img.alt = "Player 2 Marker";
            player2MarkerDisplay.appendChild(img);

            // Update all player 2 markers on the board
            updateAllCellsDisplay();
        };
        reader.readAsDataURL(file);
    }
}

// Restart the game
function restartGame() {
    currentPlayer = 1;
    gameActive = true;
    gameState = ["", "", "", "", "", "", "", "", ""];
    player1Markers = [];
    player2Markers = [];
    statusMessage.textContent = "遊戲開始，P1 先行";

    // Clear all cells
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('p1', 'p2', 'winning-cell', 'fade-in', 'fade-out');
    });
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);
