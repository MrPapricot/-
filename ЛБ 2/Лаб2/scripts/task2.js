(function () {
    function initTask2() {
        const object = document.getElementById('movingObject');
        const container = document.querySelector('.container');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (!object || !startBtn || !stopBtn || !resetBtn) return;


        let trailCanvas = document.getElementById('trailCanvas');
        if (!trailCanvas) {
            trailCanvas = document.createElement('canvas');
            trailCanvas.id = 'trailCanvas';
            trailCanvas.width = 600;  
            trailCanvas.height = 400; 
            trailCanvas.style.position = 'absolute';
            trailCanvas.style.top = '0';
            trailCanvas.style.left = '0';
            trailCanvas.style.pointerEvents = 'none';
            trailCanvas.style.zIndex = '1';
            container.style.position = 'relative';
            container.appendChild(trailCanvas);
        }
        const ctx = trailCanvas.getContext('2d');

        // Параметры движения
        const centerX = 300;
        const centerY = 200;
        const a = 2;
        const b = 3;
        const radiusX = 200;
        const radiusY = 150;
        let angle = 0;
        const speed = 0.02;
        let animationId = null;
        let isAnimating = false;

        let prevX = null, prevY = null;

        function updatePosition() {
            const x = centerX + radiusX * Math.sin(a * angle);
            const y = centerY + radiusY * Math.sin(b * angle);
            object.style.left = x + 'px';
            object.style.top = y + 'px';

            if (ctx && prevX !== null && prevY !== null) {
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'rgba(231, 76, 60, 0.4)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            prevX = x;
            prevY = y;
        }

        function animate() {
            if (!isAnimating) return;
            angle += speed;
            updatePosition();
            animationId = requestAnimationFrame(animate);
        }

        function startAnimation() {
            if (isAnimating) return;
            isAnimating = true;
            animate();
        }

        function stopAnimation() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            isAnimating = false;
        }

        function resetAnimation() {
            stopAnimation();
            angle = 0;
            ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
            prevX = null;
            updatePosition();
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

        updatePosition();
    }

    window.initTask2 = initTask2;
})();