(function () {
    function initTask1() {
        const canvas = document.getElementById('morphCanvas');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (!canvas || !startBtn || !stopBtn || !resetBtn) return;

        const ctx = canvas.getContext('2d');
        const centerX = 200, centerY = 200;
        const radius = 150;
        const N = 60;

        const circlePoints = [];
        for (let i = 0; i < N; i++) {
            const angle = (i / N) * Math.PI * 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            circlePoints.push({ x, y });
        }

        const squarePoints = [];
        const halfSquare = radius;
        const perSideSquare = N / 4;
        for (let i = 0; i < N; i++) {
            const side = Math.floor(i / perSideSquare);
            const t = (i % perSideSquare) / perSideSquare;
            let x, y;
            switch (side) {
                case 0:
                    x = centerX - halfSquare + t * 2 * halfSquare;
                    y = centerY - halfSquare;
                    break;
                case 1:
                    x = centerX + halfSquare;
                    y = centerY - halfSquare + t * 2 * halfSquare;
                    break;
                case 2:
                    x = centerX + halfSquare - t * 2 * halfSquare;
                    y = centerY + halfSquare;
                    break;
                case 3:
                    x = centerX - halfSquare;
                    y = centerY + halfSquare - t * 2 * halfSquare;
                    break;
            }
            squarePoints.push({ x, y });
        }


        const triangleVertices = [];
        for (let k = 0; k < 3; k++) {
            const angle = (k * 2 * Math.PI / 3) - Math.PI / 2; 
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            triangleVertices.push({ x, y });
        }
        const trianglePoints = [];
        const perSideTriangle = N / 3;
        for (let i = 0; i < N; i++) {
            const side = Math.floor(i / perSideTriangle);
            const t = (i % perSideTriangle) / perSideTriangle;
            const v1 = triangleVertices[side];
            const v2 = triangleVertices[(side + 1) % 3];
            const x = v1.x * (1 - t) + v2.x * t;
            const y = v1.y * (1 - t) + v2.y * t;
            trianglePoints.push({ x, y });
        }

        const hexagonVertices = [];
        for (let k = 0; k < 6; k++) {
            const angle = k * 2 * Math.PI / 6; 
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            hexagonVertices.push({ x, y });
        }
        const hexagonPoints = [];
        const perSideHexagon = N / 6;
        for (let i = 0; i < N; i++) {
            const side = Math.floor(i / perSideHexagon);
            const t = (i % perSideHexagon) / perSideHexagon;
            const v1 = hexagonVertices[side];
            const v2 = hexagonVertices[(side + 1) % 6];
            const x = v1.x * (1 - t) + v2.x * t;
            const y = v1.y * (1 - t) + v2.y * t;
            hexagonPoints.push({ x, y });
        }

        
        const shapes = [circlePoints, squarePoints, trianglePoints, hexagonPoints];

        let currentIdx = 0;        
        let t = 0;                 
        const step = 0.005;        
        let animationId = null;

        // Интерполяция двух точек
        function interpolatePoints(p1, p2, t) {
            return {
                x: p1.x * (1 - t) + p2.x * t,
                y: p1.y * (1 - t) + p2.y * t
            };
        }

       
        function getCurrentPoints() {
            const fromShape = shapes[currentIdx];
            const toShape = shapes[(currentIdx + 1) % shapes.length];
            const points = [];
            for (let i = 0; i < N; i++) {
                points.push(interpolatePoints(fromShape[i], toShape[i], t));
            }
            return points;
        }

        // Отрисовка фигуры
        function drawShape(points) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = '#e74c3c';
            ctx.fill();
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        
        function animate() {
            if (!animationId) return;

            t += step;
            if (t >= 1) {
                t = 0;
                currentIdx = (currentIdx + 1) % shapes.length; 
            }

            const points = getCurrentPoints();
            drawShape(points);

            animationId = requestAnimationFrame(animate);
        }

        function startAnimation() {
            if (animationId) return;
            animationId = requestAnimationFrame(animate);
        }

        function stopAnimation() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }

        function resetAnimation() {
            stopAnimation();
            currentIdx = 0;
            t = 0;
            drawShape(circlePoints);
        }

        
        const newStartBtn = startBtn.cloneNode(true);
        const newStopBtn = stopBtn.cloneNode(true);
        const newResetBtn = resetBtn.cloneNode(true);

        startBtn.parentNode.replaceChild(newStartBtn, startBtn);
        stopBtn.parentNode.replaceChild(newStopBtn, stopBtn);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);

        newStartBtn.addEventListener('click', startAnimation);
        newStopBtn.addEventListener('click', stopAnimation);
        newResetBtn.addEventListener('click', resetAnimation);

        drawShape(circlePoints);
    }

    window.initTask1 = initTask1;
})();