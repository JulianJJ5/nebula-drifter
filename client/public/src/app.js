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
    let storms = [];
    let keys = {};
    let animationId = null;
    let lastTime = 0;
    let score = 0;
    let fragmentCount = 0;
    let stormTimer = 0;
    let stormInterval = 5000; // 5 segundos entre tormentas
    let gameTime = 0;
    
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
        },
        storm: {
            radius: 150,
            damagePerTick: 0.8,
            duration: 4000,
            interval: 8000 // Tiempo entre tormentas
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
        
        // Reiniciar tormentas
        storms = [];
        stormTimer = 0;
        gameTime = 0;
        
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
        
        gameTime += dt;
        
        // Actualizar nave
        ship.update(keys, dt);
        ship.checkBoundaries(canvas.width, canvas.height);
        
        // Actualizar fragmentos
        for (const fragment of fragments) {
            fragment.update(dt);
        }
        
        // Actualizar criaturas
        for (const creature of creatures) {
            creature.update(ship.x, ship.y, dt);
        }
        
        // ============================================
        // SISTEMA DE TORMENTAS
        // ============================================
        
        // Crear tormentas periódicamente
        stormTimer += dt * 1000;
        if (stormTimer >= CONFIG.storm.interval) {
            stormTimer = 0;
            // Crear tormenta en una posición aleatoria (pero no encima del jugador)
            let x, y;
            let attempts = 0;
            do {
                x = Math.random() * (canvas.width - 200) + 100;
                y = Math.random() * (canvas.height - 200) + 100;
                attempts++;
            } while (attempts < 20 && Math.abs(x - ship.x) < 200 && Math.abs(y - ship.y) < 200);
            
            const storm = new Storm(x, y, CONFIG.storm);
            storms.push(storm);
            console.log(`⚡ Tormenta de plasma apareció en (${Math.round(x)}, ${Math.round(y)})`);
        }
        
        // Actualizar tormentas
        for (let i = storms.length - 1; i >= 0; i--) {
            const storm = storms[i];
            storm.update(dt, ship.x, ship.y);
            
            // Verificar colisión con la nave
            if (storm.isActive() && storm.checkCollision(ship.x, ship.y, ship.size)) {
                // Daño continuo mientras está dentro de la tormenta
                const damage = storm.getDamage() * dt;
                ship.takeDamage(damage);
                updateHUD();
                console.log(`⚡ Daño por tormenta! Vida: ${ship.health.toFixed(1)}`);
                
                // Si la vida llega a 0, game over
                if (ship.health <= 0) {
                    gameOver();
                    return;
                }
            }
            
            // Eliminar tormentas inactivas
            if (!storm.isActive()) {
                storms.splice(i, 1);
            }
        }
        
        // ============================================
        // COLISIONES
        // ============================================
        
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
                console.log(`💥 Daño por criatura! Vida: ${ship.health}`);
                
                // Teletransportar criatura
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
        
        // Dibujar tormentas (detrás de todo)
        for (const storm of storms) {
            storm.draw(ctx);
        }
        
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
        ctx.fillText(`Vida: ${ship.health.toFixed(1)}`, 10, 60);
        ctx.fillText(`Fragmentos: ${fragmentCount}`, 10, 80);
        ctx.fillText(`Puntuación: ${score}`, 10, 100);
        ctx.fillText(`Tormentas: ${storms.length}`, 10, 120);
        ctx.fillText(`Criaturas: ${creatures.filter(c => c.active).length}`, 10, 140);
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
    console.log('💎 Recolecta fragmentos, esquiva criaturas y tormentas!');
})();