(function() {
    function createSVG(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }

    function injectStyle() {
        if (document.getElementById('cat-pet-style')) return;
        const style = document.createElement('style');
        style.id = 'cat-pet-style';
        style.textContent = `
            [id*="cat-pet-signal"] {
                position: absolute !important; opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important; min-width: 0 !important; max-width: 0 !important;
                padding: 0 !important; margin: 0 !important; border: 0 !important;
                overflow: hidden !important; visibility: hidden !important;
                left: -9999px !important;
            }

            #cat-pet-container {
                position: relative;
                display: flex; align-items: center;
                padding: 0 10px; height: 100%;
            }

            #cat-pet-svg {
                height: 26px; width: 26px;
                transform-origin: center bottom;
                transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: visible;
            }

            #cat-pet-svg > g.cat-body {
                transform-origin: center bottom;
                transition: transform 0.9s ease-in-out;
            }
            #cat-pet-svg.is-breathing > g.cat-body {
                transform: scaleY(1.06);
            }

            @keyframes cat-jump {
                0%   { transform: translateY(0)    scaleX(1)    scaleY(1); }
                10%  { transform: translateY(2px)  scaleX(1.18) scaleY(0.82); }
                28%  { transform: translateY(-9px) scaleX(0.88) scaleY(1.2); }
                48%  { transform: translateY(-12px) scaleX(0.92) scaleY(1.14); }
                68%  { transform: translateY(0)    scaleX(1.18) scaleY(0.82); }
                84%  { transform: translateY(-2px) scaleX(0.97) scaleY(1.05); }
                100% { transform: translateY(0)    scaleX(1)    scaleY(1); }
            }

            #cat-pet-svg.is-jumping {
                animation: cat-jump 0.6s cubic-bezier(0.34, 1.36, 0.64, 1) forwards;
                transition: none;
            }

            #cat-pet-container:hover #cat-pet-svg:not(.is-jumping) {
                transform: rotate(-9deg) scale(1.06);
            }

            .cat-cheek { transition: fill 0.25s ease, r 0.25s ease; }
            #cat-pet-container:hover .cat-cheek { fill: #FF9FB3; }

            .cat-eye {
                transform-origin: center;
                transform-box: fill-box;
            }
            .cat-eye.is-blinking {
                animation: cat-blink 0.22s ease both;
            }
            @keyframes cat-blink {
                0%, 100% { transform: scaleY(1); }
                50%      { transform: scaleY(0.05); }
            }

            #cat-pet-svg.is-jumping .cat-eye {
                transform: scaleY(0.18);
            }

            .cat-mouth-jump { display: none; }
            #cat-pet-svg.is-jumping .cat-mouth-idle { display: none; }
            #cat-pet-svg.is-jumping .cat-mouth-jump { display: block; }

            #cat-pet-tail {
                transform-origin: 76px 76px;
                transform-box: view-box;
                animation: cat-tail-wag 1.7s ease-in-out infinite;
            }

            @keyframes cat-tail-wag {
                0%, 100% { transform: rotate(-14deg); }
                50%      { transform: rotate(16deg); }
            }

            #cat-pet-svg.is-jumping #cat-pet-tail {
                animation-duration: 0.4s;
            }

            .cat-particle {
                position: absolute;
                width: 5px; height: 5px;
                border-radius: 50%;
                background: #FFD1DC;
                pointer-events: none;
                bottom: 6px; left: 50%;
                margin-left: -2.5px;
                opacity: 0;
                animation: cat-particle-pop 0.55s ease-out forwards;
            }

            @keyframes cat-particle-pop {
                0%   { transform: translate(0, 0) scale(0.3); opacity: 1; }
                60%  { opacity: 0.9; }
                100% { transform: translate(var(--dx), var(--dy)) scale(0.1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    function spawnParticles(container) {
        const offsets = [
            { dx: '-12px', dy: '-6px' },
            { dx: '12px',  dy: '-6px' },
            { dx: '-7px',  dy: '4px' },
            { dx: '7px',   dy: '4px' }
        ];
        offsets.forEach((o, i) => {
            const p = document.createElement('div');
            p.className = 'cat-particle';
            p.style.setProperty('--dx', o.dx);
            p.style.setProperty('--dy', o.dy);
            p.style.animationDelay = (i * 20) + 'ms';
            container.appendChild(p);
            setTimeout(() => p.remove(), 700);
        });
    }

    function startBlinkLoop(svg) {
        function next() {
            const wait = 3500 + Math.random() * 3500;
            setTimeout(() => {
                if (!svg.classList.contains('is-jumping')) {
                    const eyes = svg.querySelectorAll('.cat-eye');
                    eyes.forEach(e => {
                        e.classList.remove('is-blinking');
                        void e.getBoundingClientRect();
                        e.classList.add('is-blinking');
                        setTimeout(() => e.classList.remove('is-blinking'), 240);
                    });
                }
                next();
            }, wait);
        }
        next();
    }

    function startBreathLoop(svg) {
        let on = false;
        setInterval(() => {
            if (svg.classList.contains('is-jumping')) return;
            on = !on;
            svg.classList.toggle('is-breathing', on);
        }, 1100);
    }

    function inject() {
        injectStyle();
        if (document.getElementById('cat-pet-container')) return;

        const statusbar = document.querySelector('.part.statusbar');
        const leftItems = document.querySelector('.part.statusbar .left-items')
            || document.querySelector('.part.statusbar .items-container.left-items');
        if (!leftItems) return;

        const container = document.createElement('div');
        container.id = 'cat-pet-container';

        const svg = createSVG('svg', { viewBox: '0 0 100 100' });
        svg.id = 'cat-pet-svg';

        const tail = createSVG('path', {
            d: 'M 78 75 Q 92 68 90 52',
            fill: 'none',
            stroke: '#FFFFFF',
            'stroke-width': '6',
            'stroke-linecap': 'round'
        });
        tail.id = 'cat-pet-tail';

        const body = createSVG('g');
        body.setAttribute('class', 'cat-body');

        body.appendChild(tail);

        const shapes = [
            {t:'path', a:{d:'M20 80 Q20 40 50 40 Q80 40 80 80 Z', fill:'#FFFFFF', stroke:'#E0E0E0', 'stroke-width':'2'}},
            {t:'path', a:{d:'M34 41 Q30 30 40 38 Z', fill:'#FFFFFF', stroke:'#E0E0E0'}},
            {t:'path', a:{d:'M35 39 Q32 33 38 37 Z', fill:'#FFD1DC'}},
            {t:'path', a:{d:'M66 41 Q70 30 60 38 Z', fill:'#FFFFFF', stroke:'#E0E0E0'}},
            {t:'path', a:{d:'M65 39 Q68 33 62 37 Z', fill:'#FFD1DC'}},
            {t:'circle', a:{cx:'40', cy:'55', r:'4', fill:'#333333', class:'cat-eye'}},
            {t:'circle', a:{cx:'60', cy:'55', r:'4', fill:'#333333', class:'cat-eye'}},
            {t:'circle', a:{cx:'32', cy:'62', r:'5', fill:'#FFD1DC', class:'cat-cheek'}},
            {t:'circle', a:{cx:'68', cy:'62', r:'5', fill:'#FFD1DC', class:'cat-cheek'}},
            {t:'path', a:{d:'M45 65 Q50 70 55 65', fill:'none', stroke:'#333333', 'stroke-width':'2', class:'cat-mouth-idle'}},
            {t:'path', a:{d:'M43 64 Q50 74 57 64', fill:'none', stroke:'#333333', 'stroke-width':'2', class:'cat-mouth-jump'}}
        ];

        shapes.forEach(s => body.appendChild(createSVG(s.t, s.a)));

        svg.appendChild(body);
        container.appendChild(svg);
        leftItems.appendChild(container);

        startBreathLoop(svg);
        startBlinkLoop(svg);

        if (!statusbar) return;

        const observer = new MutationObserver(() => {
            const sig = document.querySelector('[id*="cat-pet-signal"]');
            const isTyping = sig && (sig.textContent || '').includes('TYPING');
            if (!isTyping || svg.classList.contains('is-jumping')) return;

            svg.classList.add('is-jumping');
            spawnParticles(container);

            const onEnd = (e) => {
                if (e.animationName !== 'cat-jump') return;
                svg.classList.remove('is-jumping');
                svg.removeEventListener('animationend', onEnd);
            };
            svg.addEventListener('animationend', onEnd);
        });

        observer.observe(statusbar, { childList: true, subtree: true, characterData: true });
    }

    setInterval(inject, 2000);
})();
