document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const gameOverScreen = document.getElementById('gameOver');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const finalScoreElement = document.getElementById('finalScore');

    // 游戏设置
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let snake = [];
    let food = {};
    let direction = '';
    let nextDirection = '';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = 150;
    let gameLoopId = null;
    let isPaused = false;
    let isGameOver = false;

    // 初始化高分
    highScoreElement.textContent = highScore;

    // 创建初始蛇
    function createSnake() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        direction = 'right';
        nextDirection = 'right';
    }

    // 随机生成食物
    function generateFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // 确保食物不会生成在蛇身上
        if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            generateFood();
        }
    }

    // 绘制游戏元素
    function draw() {
        // 清空画布
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制蛇
        snake.forEach((segment, index) => {
            // 蛇头颜色不同
            ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);

            // 蛇眼
            if (index === 0) {
                ctx.fillStyle = 'white';
                const eyeSize = gridSize / 5;
                if (direction === 'right') {
                    ctx.fillRect(segment.x * gridSize + gridSize - eyeSize * 2, segment.y * gridSize + eyeSize, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * gridSize + gridSize - eyeSize * 2, segment.y * gridSize + gridSize - eyeSize * 2, eyeSize, eyeSize);
                } else if (direction === 'left') {
                    ctx.fillRect(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize * 2, eyeSize, eyeSize);
                } else if (direction === 'up') {
                    ctx.fillRect(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * gridSize + gridSize - eyeSize * 2, segment.y * gridSize + eyeSize, eyeSize, eyeSize);
                } else if (direction === 'down') {
                    ctx.fillRect(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize * 2, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * gridSize + gridSize - eyeSize * 2, segment.y * gridSize + gridSize - eyeSize * 2, eyeSize, eyeSize);
                }
            }
        });

        // 绘制食物
        ctx.fillStyle = '#FF5252';
        ctx.beginPath();
        ctx.arc(
            food.x * gridSize + gridSize / 2,
            food.y * gridSize + gridSize / 2,
            gridSize / 2 - 1,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // 更新游戏状态
    function update() {
        if (isPaused || isGameOver) return;

        direction = nextDirection;
        const head = { x: snake[0].x, y: snake[0].y };

        // 根据方向移动蛇头
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }

        // 检查是否撞墙
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        // 检查是否撞到自己
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        // 将新头部添加到蛇
        snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            generateFood();
            // 随着分数增加提高游戏速度
            if (score % 50 === 0 && gameSpeed > 50) {
                gameSpeed -= 10;
                clearInterval(gameLoopId);
                gameLoopId = setInterval(gameLoop, gameSpeed);
            }
        } else {
            // 如果没吃到食物，移除尾部
            snake.pop();
        }

        draw();
    }

    // 游戏循环
    function gameLoop() {
        update();
    }

    // 游戏结束
    function gameOver() {
        isGameOver = true;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        finalScoreElement.textContent = score;
        gameOverScreen.style.display = 'block';

        // 更新最高分
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
    }

    // 事件监听 - 键盘控制
    document.addEventListener('keydown', (e) => {
        // 防止页面滚动
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case ' ': // 空格键暂停/继续
                if (!isGameOver) {
                    togglePause();
                }
                break;
            case 'Enter': // 回车键开始/重新开始
                if (isGameOver || !gameLoopId) {
                    startGame();
                }
                break;
        }
    });

    // 开始游戏
    function startGame() {
        if (gameLoopId) clearInterval(gameLoopId);
        score = 0;
        scoreElement.textContent = score;
        isGameOver = false;
        isPaused = false;
        gameOverScreen.style.display = 'none';
        createSnake();
        generateFood();
        gameLoopId = setInterval(gameLoop, gameSpeed);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    }

    // 暂停/继续游戏
    function togglePause() {
        if (isGameOver) return;

        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '继续' : '暂停';
        startBtn.disabled = !isPaused;
    }

    // 重置游戏
    function resetGame() {
        clearInterval(gameLoopId);
        gameLoopId = null;
        score = 0;
        scoreElement.textContent = score;
        isGameOver = false;
        isPaused = false;
        gameOverScreen.style.display = 'none';
        createSnake();
        generateFood();
        draw();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = '暂停';
    }

    // 按钮事件
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', startGame);

    // 初始化游戏
    createSnake();
    generateFood();
    draw();
});