document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let dots = [];
        const dotCount = 40;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < dotCount; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.5 + 0.5
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            
            dots.forEach(dot => {
                dot.x += dot.vx;
                dot.y += dot.vy;

                if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
                if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }
        animate();
    }

    const registerNowTrigger = document.getElementById('registerNowTrigger');
    if (registerNowTrigger) {
        registerNowTrigger.addEventListener('click', () => {
            window.location.href = '../../Home Page/index.html';
        });
    }

    const learnMoreTrigger = document.getElementById('learnMoreTrigger');
    const learnMoreModal = document.getElementById('learnMoreModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    if (learnMoreTrigger && learnMoreModal && modalCloseBtn) {
        learnMoreTrigger.addEventListener('click', () => {
            learnMoreModal.classList.remove('hidden');
        });
        modalCloseBtn.addEventListener('click', () => {
            learnMoreModal.classList.add('hidden');
        });
        learnMoreModal.addEventListener('click', (e) => {
            if (e.target === learnMoreModal) {
                learnMoreModal.classList.add('hidden');
            }
        });
    }
});