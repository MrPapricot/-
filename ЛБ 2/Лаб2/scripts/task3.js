(function () {
    function initTask3() {
        const container = document.getElementById('imageContainer');
        const overlay = document.getElementById('overlay');

        if (!container || !overlay) return;

        const spotlightSize = 150; 
        const radius = spotlightSize / 2; 

        function moveSpotlight(e) {
            const rect = container.getBoundingClientRect();

            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            x = Math.max(radius, Math.min(rect.width - radius, x));
            y = Math.max(radius, Math.min(rect.height - radius, y));

            overlay.style.setProperty('--x', x + 'px');
            overlay.style.setProperty('--y', y + 'px');
        }

        container.addEventListener('mouseenter', () => {
            overlay.style.setProperty('--r', radius + 'px');
        });

        container.addEventListener('mousemove', moveSpotlight);

        container.addEventListener('mouseleave', () => {
            overlay.style.setProperty('--r', '0px');
        });
    }

    window.initTask3 = initTask3;
})();