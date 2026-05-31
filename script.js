// --- ELEMENTOS DO HTML ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');

// --- CONFIGURAÇÕES DO JOGO ---
const GRID_SIZE = 20;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// --- VARIÁVEIS DE ESTADO ---
let snake, food, specialFood, direction, score, highScore, gameSpeed, gameInterval;
let specialFoodActive = false;
let specialFoodTimer;
let isGameOver;

// --- FUNÇÕES DE INICIALIZAÇÃO ---

function loadHighScore() {
    const savedHighScore = localStorage.getItem('snakeHighScore') || 0;
    highScore = parseInt(savedHighScore);
    highScoreEl.textContent = highScore;
}

// Inicia (ou reinicia) o jogo
function startGame() {

    snake = [{ x: 10, y: 10 }];

    food = generateFoodPosition();

    specialFood = null;
    specialFoodActive = false;
    clearTimeout(specialFoodTimer);

    direction = 'right';
    score = 0;
    gameSpeed = 200; 
    isGameOver = false;

    // Atualiza a interface
    currentScoreEl.textContent = score;
    gameOverScreen.classList.add('hidden');

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// --- LÓGICA DAS COMIDAS ---

function generateFoodPosition() {
    let newPosition;
    do {
        newPosition = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE))
        };
    } while (snake.some(segment => segment.x === newPosition.x && segment.y === newPosition.y));
    return newPosition;
}

function spawnSpecialFood() {
    if (specialFoodActive) return;

    specialFoodActive = true;
    const type = Math.random() < 0.5 ? 'negative' : 'positive'; 
    specialFood = {
        ...generateFoodPosition(),
        type: type,
        color: type === 'negative' ? '#e74c3c' : '#f39c12' 
    };

    specialFoodTimer = setTimeout(() => {
        specialFood = null;
        specialFoodActive = false;
    }, 5000);
}

// --- LÓGICA DO JOGO ---

function updateGameSpeed() {

    const speedDecrease = Math.floor(score / 4) * 10;
    gameSpeed = Math.max(200 - speedDecrease, 60); 

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
    if (isGameOver) return;
    update();
    draw();
}

function update() {
    const head = { ...snake[0] };

    if (direction === 'right') head.x++;
    if (direction === 'left') head.x--;
    if (direction === 'up') head.y--;
    if (direction === 'down') head.y++;

    if (head.x < 0 || head.x * GRID_SIZE >= CANVAS_WIDTH || head.y < 0 || head.y * GRID_SIZE >= CANVAS_HEIGHT) {
        return endGame();
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return endGame();
    }
    
    snake.unshift(head); 

    let ateFood = false;

    if (head.x === food.x && head.y === food.y) {
        ateFood = true;
        score++;
        food = generateFoodPosition();
        updateGameSpeed();

        if (Math.random() < 0.25) {
            spawnSpecialFood();
        }
    }

    else if (specialFoodActive && head.x === specialFood.x && head.y === specialFood.y) {
        ateFood = true;
        if (specialFood.type === 'negative') {
            score = Math.max(0, score - 1); 
            if (snake.length > 1) snake.pop(); 
        } else {
            score += 4;
   
            for(let i=0; i<3; i++) snake.push({}); 
        }
        specialFood = null;
        specialFoodActive = false;
        clearTimeout(specialFoodTimer);
        updateGameSpeed();
    }

    if (!ateFood) {
        snake.pop();
    }
    
    currentScoreEl.textContent = score;
}

function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.textContent = highScore;
    }

    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// --- RENDERIZAÇÃO ---

function draw() {

    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#48cae4'; 

    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }

    const head = snake[0];
    const headX = head.x * GRID_SIZE;
    const headY = head.y * GRID_SIZE;
    
    ctx.fillStyle = '#ade8f4'; 
    ctx.fillRect(headX, headY, GRID_SIZE, GRID_SIZE);

    ctx.fillStyle = '#161b22'; 

    switch (direction) {
        case 'up':

            ctx.fillRect(headX + 4, headY + 12, 4, 4); 
            ctx.fillRect(headX + 12, headY + 12, 4, 4); 
            ctx.fillRect(headX + 4, headY + 4, 12, 4); 
            break;

        case 'down':

            ctx.fillRect(headX + 4, headY + 4, 4, 4); 
            ctx.fillRect(headX + 12, headY + 4, 4, 4); 
            ctx.fillRect(headX + 4, headY + 12, 12, 4); 
            break;

        case 'left':

            ctx.fillRect(headX + 12, headY + 4, 4, 4); 
            ctx.fillRect(headX + 12, headY + 12, 4, 4); 
            ctx.fillRect(headX + 4, headY + 4, 4, 12);
            break;

        case 'right':

            ctx.fillRect(headX + 4, headY + 4, 4, 4); 
            ctx.fillRect(headX + 4, headY + 12, 4, 4); 
            ctx.fillRect(headX + 12, headY + 4, 4, 12); 
            break;
    }


    

    ctx.fillStyle = '#ffafcc'; 
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    if (specialFoodActive && specialFood) {
        const specialFoodColor = specialFood.type === 'negative' ? '#f72585' : '#ffea00'; 
        ctx.fillStyle = specialFoodColor;
        ctx.fillRect(specialFood.x * GRID_SIZE, specialFood.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
}

// --- CONTROLES ---

function handleDirectionChange(newDirection) {
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingLeft = direction === 'left';
    const goingRight = direction === 'right';

    if (newDirection === 'up' && !goingDown) direction = 'up';
    if (newDirection === 'down' && !goingUp) direction = 'down';
    if (newDirection === 'left' && !goingRight) direction = 'left';
    if (newDirection === 'right' && !goingLeft) direction = 'right';
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') handleDirectionChange('up');
    if (e.key === 'ArrowDown') handleDirectionChange('down');
    if (e.key === 'ArrowLeft') handleDirectionChange('left');
    if (e.key === 'ArrowRight') handleDirectionChange('right');
});

document.getElementById('btn-up').addEventListener('click', () => handleDirectionChange('up'));
document.getElementById('btn-down').addEventListener('click', () => handleDirectionChange('down'));
document.getElementById('btn-left').addEventListener('click', () => handleDirectionChange('left'));
document.getElementById('btn-right').addEventListener('click', () => handleDirectionChange('right'));
document.getElementById('restart-button').addEventListener('click', startGame);

// --- INÍCIO DO JOGO ---
loadHighScore();
startGame();
