// Получаем элемент canvas и его контекст для рисования
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Загружаем изображение охотника
const hunterImg = new Image();
hunterImg.src = 'hunter.png';  // Убедись, что файл находится в той же папке

// Размеры охотника
const hunter = {
    x: 50,
    y: 320, // Охотник немного ниже земли
    width: 50,
    height: 50,
    dy: 0,
    gravity: 0.5,
    jumpPower: -10,
    isJumping: false
};

// Загружаем изображения препятствий
const tentImg = new Image();
tentImg.src = 'tent.png';  // Изображение палатки

const bearImg = new Image();
bearImg.src = 'bear.png';  // Изображение медведя

const digImg = new Image();
digImg.src = 'dig.png';  // Изображение археологического раскопа

// Массив для хранения препятствий
const obstacles = [];
let gameSpeed = 5;  // Начальная скорость игры
let score = 0;  // Очки за время
let isGameOver = false;  // Переменная для отслеживания состояния игры
let maxObstacles = 1;  // Максимальное количество препятствий одновременно на экране
let obstacleFrequency = 2000;  // Начальная частота появления препятствий
let gameStartTime = Date.now();  // Время начала игры
let level = 1;  // Начальный уровень сложности

// Увеличиваем уровень сложности каждые 10 секунд до 10 уровня
setInterval(() => {
    if (level < 10) {
        level += 1;  // Увеличиваем уровень сложности
        gameSpeed = 5 * Math.pow(1.5, level);  // Экспоненциальное увеличение скорости
        maxObstacles = level + 1;  // Увеличиваем количество препятствий
        obstacleFrequency = Math.max(100, 2000 - level * 150);  // Уменьшаем интервал появления препятствий
    }
}, 10000);  // Каждые 10 секунд

// Обрабатываем прыжки охотника
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !hunter.isJumping && !isGameOver) {
        hunter.dy = hunter.jumpPower;
        hunter.isJumping = true;
    }
});

// Функция для создания нового препятствия
function createObstacle() {
    if (obstacles.length < maxObstacles) {
        const obstacleType = Math.floor(Math.random() * 3); // Случайный выбор между 0, 1 и 2
        let obstacleImage;
        let obstacleY = 320; // Препятствия (палатка и медведь) также будут ниже земли

        switch(obstacleType) {
            case 0:
                obstacleImage = tentImg; // Палатка
                break;
            case 1:
                obstacleImage = bearImg; // Медведь
                obstacleY = 310; // Медведь немного выше палатки
                break;
            case 2:
                obstacleImage = digImg; // Археологический раскоп
                obstacleY = 325;  // Раскоп ниже земли, частично углублён
                break;
        }

        const obstacle = {
            x: canvas.width,
            y: obstacleY, // Координата Y зависит от типа препятствия
            width: 50,
            height: 50,
            image: obstacleImage // Присваиваем выбранное изображение
        };

        obstacles.push(obstacle);
    }
}

// Функция для обновления препятствий
function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.x -= gameSpeed;  // Используем переменную gameSpeed вместо фиксированной скорости

        // Рисуем препятствие
        if (obstacle.image.complete) {
            ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }

        // Проверяем столкновение с серединой препятствия
        if (checkCollision(obstacle)) {
            isGameOver = true;
            return; // Останавливаем дальнейшую проверку препятствий
        }

        // Удаляем препятствия, которые вышли за пределы экрана
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            i--;
        }
    }
}

// Проверяем столкновение охотника с серединой препятствия
function checkCollision(obstacle) {
    // Определяем середину препятствия по оси X
    const obstacleMiddleX = obstacle.x + obstacle.width / 2;

    // Проверяем, находится ли середина препятствия внутри охотника
    if (
        hunter.x < obstacleMiddleX &&  // Передняя часть охотника левее середины препятствия
        hunter.x + hunter.width > obstacleMiddleX && // Задняя часть охотника правее середины
        hunter.y < obstacle.y + obstacle.height &&  // Верхняя часть охотника ниже нижней части препятствия
        hunter.y + hunter.height > obstacle.y  // Нижняя часть охотника выше верхней части препятствия
    ) {
        return true;  // Столкновение засчитано
    }
    return false;  // Столкновения нет
}

// Добавляем препятствие с динамической частотой
setInterval(createObstacle, obstacleFrequency);

// Функция для рисования земли
function drawGround() {
    // Рисуем линию земли
    ctx.strokeStyle = '#000000'; // Чёрная линия
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(canvas.width, 350);
    ctx.stroke();
}

// Основной игровой цикл
function gameLoop() {
    if (isGameOver) {
        // Если игра окончена, отображаем сообщение
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        return; // Останавливаем игровой цикл
    }

    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем землю
    drawGround();

    // Добавляем гравитацию и перемещение охотника
    hunter.dy += hunter.gravity;
    hunter.y += hunter.dy;

    // Ограничиваем охотника внизу экрана
    if (hunter.y >= 320) {  // Охотник ниже земли
        hunter.y = 320;
        hunter.dy = 0;
        hunter.isJumping = false;
    }

    // Обновляем и рисуем препятствия с текущей скоростью игры
    updateObstacles();

    // Обновляем очки по времени
    const elapsedTime = Date.now() - gameStartTime;
    score = Math.floor(elapsedTime / 100);  // Увеличиваем очки за каждую сотую секунды

    // Рисуем охотника
    if (hunterImg.complete) {
        ctx.drawImage(hunterImg, hunter.x, hunter.y, hunter.width, hunter.height);
    }

    // Выводим количество очков и уровень сложности
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Level: " + level, 10, 50);  // Отображаем текущий уровень сложности

    // Запускаем игровой цикл
    requestAnimationFrame(gameLoop);
}

// Запускаем игровой цикл
gameLoop();
