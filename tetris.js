document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".game-board");
    const scoreDisplay = document.getElementById("score");
    const startButton = document.getElementById("start-button");

    const ROWS = 20;
    const COLUMNS = 10;
    const EMPTY = "white";
    let board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(EMPTY));
    let score = 0;
    let gameOver = false;
    let interval;
    let currentPiece;
    let currentPosition;

    const shapes = [
        [
            [1, 1, 1, 1], // I-Piece
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        [
            [1, 1], // O-Piece
            [1, 1],
        ],
        [
            [1, 1, 1], // T-Piece
            [0, 1, 0],
            [0, 0, 0],
        ],
        // Add more shapes here
    ];

    const colors = ["cyan", "yellow", "purple", "green"];

    // Initialize the game
    function startGame() {
        if (gameOver) {
            board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(EMPTY));
            score = 0;
            gameOver = false;
            clearInterval(interval);
        }
        currentPiece = randomPiece();
        currentPosition = { x: 3, y: 0 };
        draw();
        interval = setInterval(update, 1000);
        startButton.style.display = "none";
    }

    // Generate a random Tetris piece
    function randomPiece() {
        const randomIndex = Math.floor(Math.random() * shapes.length);
        const piece = shapes[randomIndex];
        const color = colors[randomIndex];
        return { piece, color };
    }

    // Draw the current state of the game
    function draw() {
        grid.innerHTML = "";
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                const square = document.createElement("div");
                square.style.backgroundColor = board[row][col];
                grid.appendChild(square);
            }
        }

        currentPiece.piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const square = document.createElement("div");
                    square.style.backgroundColor = currentPiece.color;
                    square.style.top = (y + currentPosition.y) * 30 + "px";
                    square.style.left = (x + currentPosition.x) * 30 + "px";
                    grid.appendChild(square);
                }
            });
        });
    }

    // Update the game logic
    function update() {
        if (!gameOver) {
            moveDown();
            draw();
        }
    }

    // Move the current piece down
    function moveDown() {
        if (isValidMove(0, 1)) {
            currentPosition.y++;
        } else {
            merge();
            currentPiece = randomPiece();
            currentPosition = { x: 3, y: 0 };
            if (!isValidMove(0, 0)) {
                gameOver = true;
                clearInterval(interval);
                startButton.style.display = "block";
                startButton.innerHTML = "Game Over. Play Again?";
            }
        }
    }

    // Merge the current piece into the board
    function merge() {
        currentPiece.piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + currentPosition.y][x + currentPosition.x] = currentPiece.color;
                }
            });
        });

        // Check for line clears
        for (let row = ROWS - 1; row >= 0; ) {
            if (board[row].every((cell) => cell !== EMPTY)) {
                score += 100;
                scoreDisplay.innerText = score;
                const removedRow = board.splice(row, 1)[0].fill(EMPTY);
                board.unshift(removedRow);
            } else {
                row--;
            }
        }
    }

    // Check if the current move is valid
    function isValidMove(offsetX, offsetY) {
        for (let y = 0; y < currentPiece.piece.length; y++) {
            for (let x = 0; x < currentPiece.piece[y].length; x++) {
                if (currentPiece.piece[y][x]) {
                    const newY = y + currentPosition.y + offsetY;
                    const newX = x + currentPosition.x + offsetX;
                    if (
                        newY >= ROWS ||
                        newX < 0 ||
                        newX >= COLUMNS ||
                        board[newY][newX] !== EMPTY
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Handle keyboard controls
    document.addEventListener("keydown", (event) => {
        if (gameOver) return;
        if (event.key === "ArrowLeft" && isValidMove(-1, 0)) {
            currentPosition.x--;
        } else if (event.key === "ArrowRight" && isValidMove(1, 0)) {
            currentPosition.x++;
        } else if (event.key === "ArrowDown" && isValidMove(0, 1)) {
            moveDown();
        } else if (event.key === "ArrowUp") {
            rotatePiece();
        }
        draw();
    });

    // Rotate the current piece
    function rotatePiece() {
        const rotatedPiece = [];
        for (let y = 0; y < currentPiece.piece.length; y++) {
            rotatedPiece[y] = [];
            for (let x = 0; x < currentPiece.piece[y].length; x++) {
                rotatedPiece[y][x] = currentPiece.piece[x][currentPiece.piece.length - 1 - y];
            }
        }
        currentPiece.piece = rotatedPiece;
        if (!isValidMove(0, 0)) {
            // Undo the rotation if it's invalid
            currentPiece.piece = rotatedPiece.map((row) => [...row]);
        }
    }

    // Start the game when the "Start Game" button is clicked
    startButton.addEventListener("click", startGame);

    // Initialize the game
    startGame();
});
