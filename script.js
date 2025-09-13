// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏变量
const gridSize = 20;
const initialSpeed = 200; // 初始速度（毫秒）
let speed = initialSpeed;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameRunning = false;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;

// 移动端触摸变量
let touchStartX = 0;
let touchStartY = 0;

// 初始化游戏
function initGame() {
    // 初始化蛇
    snake = [
        {x: 5 * gridSize, y: 5 * gridSize},
        {x: 4 * gridSize, y: 5 * gridSize},
        {x: 3 * gridSize, y: 5 * gridSize}
    ];
    
    // 生成食物
    generateFood();
    
    // 重置分数
    score = 0;
    updateScore();
    
    // 重置方向
    direction = 'right';
    nextDirection = 'right';
    
    // 重置速度
    speed = initialSpeed;
}

// 生成食物
function generateFood() {
    // 确保食物不会生成在蛇身上
    let validPosition = false;
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
        
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                validPosition = false;
                break;
            }
        }
    }
}

// 绘制蛇
function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    for (let segment of snake) {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        
        // 绘制边框
        ctx.strokeStyle = '#45a049';
        ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
    }
    
    // 绘制蛇头
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(snake[0].x, snake[0].y, gridSize, gridSize);
    ctx.strokeRect(snake[0].x, snake[0].y, gridSize, gridSize);
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(food.x + gridSize/2, food.y + gridSize/2, gridSize/2, 0, Math.PI * 2);
    ctx.fill();
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = nextDirection;
    
    // 创建新的头部
    const head = {x: snake[0].x, y: snake[0].y};
    
    // 根据方向移动头部
    switch (direction) {
        case 'up':
            head.y -= gridSize;
            break;
        case 'down':
            head.y += gridSize;
            break;
        case 'left':
            head.x -= gridSize;
            break;
        case 'right':
            head.x += gridSize;
            break;
    }
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 生成新食物
        generateFood();
        
        // 增加分数
        score += 10;
        updateScore();
        
        // 加速
        if (speed > 50) {
            speed -= 5;
        }
        
        // 不移除尾部，蛇会变长
    } else {
        // 移除尾部
        snake.pop();
    }
    
    // 检查游戏是否结束
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 添加新头部
    snake.unshift(head);
}

// 检查碰撞
function checkCollision(head) {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    
    // 检查自身碰撞
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    
    return false;
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameRunning = false;
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        updateScore();
    }
    
    // 绘制游戏结束文本
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = '20px Arial';
    ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText(`最高分: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = `得分: ${score}`;
    document.getElementById('highScore').textContent = `最高分: ${highScore}`;
}

// 游戏主循环
function gameUpdate() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 移动蛇
    moveSnake();
    
    // 绘制食物和蛇
    drawFood();
    drawSnake();
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        initGame();
        gameRunning = true;
        gamePaused = false;
        gameLoop = setInterval(gameUpdate, speed);
    }
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    if (gamePaused) {
        // 继续游戏
        gamePaused = false;
        gameLoop = setInterval(gameUpdate, speed);
        document.getElementById('pauseBtn').textContent = '暂停';
    } else {
        // 暂停游戏
        gamePaused = true;
        clearInterval(gameLoop);
        document.getElementById('pauseBtn').textContent = '继续';
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameLoop);
    initGame();
    gameRunning = true;
    gamePaused = false;
    document.getElementById('pauseBtn').textContent = '暂停';
    gameLoop = setInterval(gameUpdate, speed);
}

// 检测设备类型
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 根据设备类型调整游戏速度
function adjustGameSpeed() {
    if (isMobileDevice()) {
        speed = initialSpeed + 50; // 移动设备速度稍慢
    }
}

// 键盘控制
document.addEventListener('keydown', function(event) {
    switch (event.key) {
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
    }
});

// 触摸控制 - 滑动
document.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchmove', function(event) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // 确定主要方向 - 水平或垂直
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0) {
            // 向左滑动
            if (direction !== 'right') nextDirection = 'left';
        } else {
            // 向右滑动
            if (direction !== 'left') nextDirection = 'right';
        }
    } else {
        // 垂直滑动
        if (diffY > 0) {
            // 向上滑动
            if (direction !== 'down') nextDirection = 'up';
        } else {
            // 向下滑动
            if (direction !== 'up') nextDirection = 'down';
        }
    }
    
    // 防止页面滚动
    event.preventDefault();
}, { passive: false });

document.addEventListener('touchend', function() {
    touchStartX = 0;
    touchStartY = 0;
});

// 按钮控制
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', restartGame);

// 移动端虚拟按钮控制
document.getElementById('upBtn').addEventListener('click', function() {
    if (direction !== 'down') nextDirection = 'up';
});

document.getElementById('downBtn').addEventListener('click', function() {
    if (direction !== 'up') nextDirection = 'down';
});

document.getElementById('leftBtn').addEventListener('click', function() {
    if (direction !== 'right') nextDirection = 'left';
});

document.getElementById('rightBtn').addEventListener('click', function() {
    if (direction !== 'left') nextDirection = 'right';
});

// 调整游戏速度
adjustGameSpeed();

// 初始化游戏
initGame();