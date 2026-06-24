// client/public/src/app.js
(function() {
    'use strict';
    
    console.log('🌌 Nebula Drifter - Iniciando...');
    
    // Obtener referencias del DOM
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const mainMenu = document.getElementById('mainMenu');
    const gameOverScreen = document.getElementById('gameOver');
    const hud = document.getElementById('hud');
    
    // Estado del juego
    let gameRunning = false;
    let ship = null;
    let fragments = [];
    let creatures = [];
    let keys = {};
    let animationId = null;
    let lastTime = 0;
    let score = 0;
    let fragmentCount = 0;
    
    // Configuración
    const CONFIG = {
        ship: {
            maxSpeed: 4,
            acceleration: 0.12,
            friction: 0.98,
            rotationSpeed: 0.04,
            size: 20,
            maxHealth: 5
        },
        fragment: {
            count: 15,
            minSize: 8,
            maxSize: 16
        },
        creature: {
            count: 5,
            speed: 1.2,
            aggroRadius: 200,
            damage: 1
        }
    };
    
    // ================================================
    // FUNCIONES DEL JUEGO
    // ================================================
    
    function initGame() {
        console.log('🚀 Iniciando partida...');
        
        // Crear nave en el centro
        ship = new Ship(
            canvas.width / 2,
            canvas.height / 2,
            CONFIG.ship
        );
        
        // Crear fragmentos
        fragments = [];
        for (let i = 0; i < CONFIG.fragment.count; i++) {
            const fragment = new Fragment(
                Math.random() * (canvas.width - 60) + 30,
                Math.random() * (canvas.height - 60) + 30,
                CONFIG.fragment
            );
            fragments.push(fragment);
        }
        
        // Crear criaturas
        creatures = [];
        for (let i = 0; i < CONFIG.creature.count; i++) {
            const creature = new Creature(
                Math.random() * (canvas.width - 80) + 40,
                Math.random() * (canvas.height - 80) + 40,
                CONFIG.creature
            );
            creatures.push(creature);
        }
        
        // Reiniciar puntuación
        score = 0;
        fragmentCount = 0;
        
        gameRunning = true;
        mainMenu.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        hud.classList.remove('hidden');
        
        updateHUD();
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        lastTime = performance.now();
        gameLoop(lastTime);
    }
    
    function gameLoop(currentTime) {
        if (!gameRunning) return;
        
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        const dt = Math.min(deltaTime, 0.05);
        
        update(dt);
        render();
        
        animationId = requestAnimationFrame(gameLoop);
    }
    
    function update(dt) {
        if (!ship) return;
        
        // Actualizar nave
        ship.update(keys, dt);
        ship.checkBoundaries(canvas.width, canvas.height);
        
        // Actualizar fragmentos
        for (const fragment of fragments) {
            fragment.update(dt);
        }
        
        // Actualizar criaturas (pasar posición del jugador)
        for (const creature of creatures) {
            creature.update(ship.x, ship.y, dt);
        }
        
        // Colisiones nave - fragmentos
        for (let i = fragments.length - 1; i >= 0; i--) {
            const fragment = fragments[i];
            if (!fragment.active) continue;
            
            if (fragment.checkCollision(ship.x, ship.y, ship.size)) {
                const points = fragment.collect();
                score += points;
                fragmentCount++;
                updateHUD();
                console.log(`💎 Fragmento recogido! +${points} puntos`);
            }
        }
        
        // Colisiones nave - criaturas
        for (const creature of creatures) {
            if (!creature.active) continue;
            if (creature.checkCollision(ship.x, ship.y, ship.size)) {
                // Dañar al jugador
                ship.takeDamage(CONFIG.creature.damage);
                updateHUD();
                console.log(`💥 Daño! Vida: ${ship.health}`);
                
                // Teletransportar criatura (para evitar daño continuo)
                creature.x = Math.random() * (canvas.width - 80) + 40;
                creature.y = Math.random() * (canvas.height - 80) + 40;
                
                // Game Over si la vida llega a 0
                if (ship.health <= 0) {
                    gameOver();
                    return;
                }
            }
        }
        
        updateHUD();
    }
    
    function render() {
        // Limpiar canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar estrellas
        drawStars();
        
        // Dibujar fragmentos
        for (const fragment of fragments) {
            fragment.draw(ctx);
        }
        
        // Dibujar criaturas
        for (const creature of creatures) {
            creature.draw(ctx);
        }
        
        // Dibujar nave
        if (ship) {
            ship.draw(ctx);
        }
        
        // Debug info
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '12px monospace';
        ctx.fillText(`Velocidad: ${Math.sqrt(ship.vx*ship.vx + ship.vy*ship.vy).toFixed(2)}`, 10, 20);
        ctx.fillText(`Ángulo: ${(ship.angle * 180 / Math.PI).toFixed(1)}°`, 10, 40);
        ctx.fillText(`Vida: ${ship.health}`, 10, 60);
        ctx.fillText(`Fragmentos: ${fragmentCount}`, 10, 80);
        ctx.fillText(`Puntuación: ${score}`, 10, 100);
        ctx.fillText(`Criaturas vivas: ${creatures.filter(c => c.active).length}`, 10, 120);
    }
    
    function drawStars() {
        // Estrellas estáticas
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let i = 0; i < 150; i++) {
            const x = (i * 137) % canvas.width;
            const y = (i * 271) % canvas.height;
            const size = (i % 3) + 1;
            const alpha = 0.3 + (i % 5) / 10;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    
    function updateHUD() {
        if (!ship) return;
        const healthPercent = (ship.health / CONFIG.ship.maxHealth) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        document.getElementById('fragmentCount').textContent = fragmentCount;
        document.getElementById('scoreDisplay').textContent = score;
    }
    
    function gameOver() {
        gameRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        document.getElementById('finalFragments').textContent = fragmentCount;
        document.getElementById('finalScore').textContent = score;
        gameOverScreen.classList.remove('hidden');
        hud.classList.add('hidden');
        console.log('💀 Game Over!');
    }
    
    // ================================================
    // EVENTOS DE TECLADO
    // ================================================
    
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
        }
        if (e.key === 'Escape') {
            gameRunning = false;
            cancelAnimationFrame(animationId);
            mainMenu.classList.remove('hidden');
            hud.classList.add('hidden');
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // ================================================
    // EVENTOS DE UI
    // ================================================
    
    document.getElementById('startGameBtn').addEventListener('click', initGame);
    
    document.getElementById('retryBtn').addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        initGame();
    });
    
    document.getElementById('menuBtn').addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        gameRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
    
    // ================================================
    // INICIALIZACIÓN
    // ================================================
    
    mainMenu.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.add('hidden');
    
    console.log('✅ Nebula Drifter cargado! Listo para jugar.');
    console.log('🎮 Controles: WASD para mover, flechas para rotar');
    console.log('💎 Recolecta fragmentos, esquiva a las criaturas!');
})();