// script.js

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.mode-btn');
const hint = document.getElementById('maskHint');

const W = canvas.width;
const H = canvas.height;

let currentMode = 'morph';
let animFrame = null;
let startTime = performance.now();

// ==================== МОРФИНГ (три фигуры) ====================
function getCirclePoints() {
    const centerX = 300, centerY = 350;
    const radiusX = 100, radiusY = 90;
    const count = 24;
    let points = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        points.push({
            x: centerX + radiusX * Math.cos(angle),
            y: centerY + radiusY * Math.sin(angle)
        });
    }
    return points;
}

function getStarPoints() {
    const centerX = 500, centerY = 350;
    const outerR = 110;
    const innerR = 50;
    const spikes = 5;
    let points = [];
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / spikes) * i - Math.PI / 2;
        points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }
    return points;
}

function getBlobPoints() {
    const centerX = 700, centerY = 350;
    const count = 20;
    let points = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = 100 + 30 * Math.sin(angle * 5) + 25 * Math.cos(angle * 3);
        points.push({
            x: centerX + r * Math.cos(angle),
            y: centerY + r * Math.sin(angle) + 20 * Math.sin(angle * 4)
        });
    }
    return points;
}

function getMorphPoints(progress) {
    let t = progress * 3;
    let pointsA, pointsB;
    let localT;
    
    if (t < 1) {
        pointsA = getCirclePoints();
        pointsB = getStarPoints();
        localT = t;
    } else if (t < 2) {
        pointsA = getStarPoints();
        pointsB = getBlobPoints();
        localT = t - 1;
    } else {
        pointsA = getBlobPoints();
        pointsB = getCirclePoints();
        localT = t - 2;
    }

    const count = Math.max(pointsA.length, pointsB.length);
    const result = [];
    for (let i = 0; i < count; i++) {
        const a = pointsA[i % pointsA.length];
        const b = pointsB[i % pointsB.length];
        result.push({
            x: a.x * (1 - localT) + b.x * localT,
            y: a.y * (1 - localT) + b.y * localT
        });
    }
    return result;
}

// ==================== ТРАЕКТОРИЯ ====================
function getPathPosition(t) {
    const angle = t * Math.PI * 4;
    const scaleX = 300;
    const scaleY = 200;
    const centerX = 500, centerY = 350;

    const x = Math.sin(angle * 0.9) * Math.cos(angle * 1.2) * scaleX;
    const y = Math.sin(angle * 1.7) * Math.cos(angle * 0.8) * scaleY;

    return {
        x: centerX + x,
        y: centerY + y - 25 * Math.sin(angle * 1.5)
    };
}

// ==================== МАСКА ====================
function drawHiddenImage() {
    // Небо градиент
    const skyGradient = ctx.createLinearGradient(0, 0, 0, H);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.5, '#98D8E8');
    skyGradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, W, H);

    // Солнце
    ctx.beginPath();
    ctx.arc(850, 120, 60, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFA500';
    ctx.shadowBlur = 30;
    ctx.fill();
    
    // Облака
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(150, 100, 40, 0, 2 * Math.PI);
    ctx.arc(200, 80, 35, 0, 2 * Math.PI);
    ctx.arc(250, 100, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(600, 150, 45, 0, 2 * Math.PI);
    ctx.arc(650, 130, 40, 0, 2 * Math.PI);
    ctx.arc(700, 150, 35, 0, 2 * Math.PI);
    ctx.fill();

    // Горы
    ctx.fillStyle = '#2E8B57';
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(200, 200);
    ctx.lineTo(350, 350);
    ctx.lineTo(500, 150);
    ctx.lineTo(650, 300);
    ctx.lineTo(800, 200);
    ctx.lineTo(1000, 350);
    ctx.lineTo(1000, 700);
    ctx.lineTo(0, 700);
    ctx.fill();

    // Деревья
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 6; i++) {
        const x = 50 + i * 150;
        ctx.beginPath();
        ctx.moveTo(x, 500);
        ctx.lineTo(x - 30, 550);
        ctx.lineTo(x + 30, 550);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, 480, 25, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Река
    ctx.fillStyle = '#4169E1';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0, 600, W, 100);
    ctx.globalAlpha = 1.0;
}

// ==================== ОТРИСОВКА ====================
function drawMorph(now) {
    const progress = 0.5 + 0.5 * Math.sin((now - startTime) / 4000);
    const points = getMorphPoints(progress);
    
    const r = Math.floor(100 + 155 * Math.abs(Math.sin(progress * 10)));
    const g = Math.floor(80 + 175 * Math.abs(Math.cos(progress * 8)));
    const b = Math.floor(150 + 105 * Math.abs(Math.sin(progress * 12)));

    ctx.clearRect(0, 0, W, H);
    
    // Фон
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);

    // Фигура
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawPath(now) {
    const t = ((now - startTime) / 10000) % 1;
    const pos = getPathPosition(t);

    ctx.clearRect(0, 0, W, H);
    
    // Фон
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);

    // Траектория
    ctx.beginPath();
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    for (let i = 0; i <= 200; i++) {
        const p = getPathPosition(i / 200);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Точка
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff8888';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawMask(now, mx, my) {
    ctx.clearRect(0, 0, W, H);
    drawHiddenImage();

    if (mx === null || my === null) return;

    const radius = 200;
    const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.9, 'rgba(26,26,46,0.8)');
    gradient.addColorStop(1, '#1a1a2e');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(mx, my, radius - 2, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Маленькое перекрестие
    ctx.beginPath();
    ctx.moveTo(mx - 15, my);
    ctx.lineTo(mx - 5, my);
    ctx.moveTo(mx + 5, my);
    ctx.lineTo(mx + 15, my);
    ctx.moveTo(mx, my - 15);
    ctx.lineTo(mx, my - 5);
    ctx.moveTo(mx, my + 5);
    ctx.lineTo(mx, my + 15);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

// ==================== ОБРАБОТКА МЫШИ ====================
let mouseX = null, mouseY = null;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
    mouseX = Math.min(W, Math.max(0, mouseX));
    mouseY = Math.min(H, Math.max(0, mouseY));
});

canvas.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
});

// ==================== АНИМАЦИЯ ====================
function animate(now) {
    if (currentMode === 'morph') {
        hint.classList.remove('visible');
        drawMorph(now);
    } else if (currentMode === 'path') {
        hint.classList.remove('visible');
        drawPath(now);
    } else if (currentMode === 'mask') {
        hint.classList.add('visible');
        drawMask(now, mouseX, mouseY);
    }
    animFrame = requestAnimationFrame(animate);
}

function setMode(mode) {
    currentMode = mode;
    buttons.forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    startTime = performance.now();
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

setMode('morph');
animFrame = requestAnimationFrame(animate);

window.addEventListener('beforeunload', () => {
    if (animFrame) cancelAnimationFrame(animFrame);
});