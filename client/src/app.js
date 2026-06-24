// Punto de entrada principal del juego
(function() {
    'use strict';
    
    console.log('🌌 Nebula Drifter - Iniciando...');
    
    // 1. Obtener referencias del DOM
    const canvas = document.getElementById('gameCanvas');
    const mainMenu = document.getElementById('mainMenu');
    const gameOverScreen = document.getElementById('gameOver');
    const hud = document.getElementById('hud');
    
    // 2. Crear el motor del juego
    const engine = new GameEngine('gameCanvas');
    
    // 3. Estado del juego
    let gameState = {
        isPlaying: false,
        score: 0,
        fragments: 0,
        zone: 0, // índice de la zona actual
        health: GAME_CONFIG.ship.maxHealth,
    };
    
    // 4. Inicializar el juego (cuando se pulsa "Iniciar")
    function initGame() {
        console.log('🚀 Iniciando partida...');
        
        // Crear la nave
        const ship = new Ship(
            engine.width / 2,
            engine.height / 2,
            GAME_CONFIG.ship
        );
        engine.entities.ship = ship;
        
        // Generar fragmentos
        engine.entities.fragments = [];
        const fragmentCount = GAME_CONFIG.fragment.count;
        for (let i = 0; i < fragmentCount; i++) {
            const fragment = new Fragment(
                MathUtils.random(50, engine.width - 50),
                MathUtils.random(50, engine.height - 50),
                GAME_CONFIG.fragment
            );
            engine.entities.fragments.push(fragment);
        }
        
        // Generar criaturas
        engine.entities.creatures = [];
        const creatureCount = GAME_CONFIG.creature.count;
        for (let i = 0; i < creatureCount; i++) {
            const creature = new Creature(
                MathUtils.random(50, engine.width - 50),
                MathUtils.random(50, engine.height - 50),
                GAME_CONFIG.creature
            );
            engine.entities.creatures.push(creature);
        }
        
        // Reiniciar estado
        gameState.isPlaying = true;
        gameState.score = 0;
        gameState.fragments = 0;
        gameState.health = GAME_CONFIG.ship.maxHealth;
        gameState.zone = 0;
        
        // Mostrar HUD, ocultar menús
        mainMenu.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        hud.classList.remove('hidden');
        
        // Actualizar HUD
        updateHUD();
        
        // Configurar callbacks del engine
        engine.onUpdate = (deltaTime) => updateGame(deltaTime);
        engine.onRender = (ctx) => renderGame(ctx);
        
        // Iniciar el motor
        engine.start();
    }
    
    // 5. Actualizar lógica del juego
    function updateGame(deltaTime) {
        if (!gameState.isPlaying) return;
        
        const ship = engine.entities.ship;
        if (!ship) return;
        
        // --- Actualizar nave ---
        ship.update(engine.keys, deltaTime);
        ship.checkBoundaries(engine.width, engine.height);
        
        // --- Actualizar fragmentos ---
        engine.entities.fragments.forEach(fragment => {
            fragment.update(deltaTime);
        });
        
        // --- Actualizar criaturas ---
        engine.entities.creatures.forEach(creature => {
            creature.update(ship.x, ship.y, deltaTime);
        });
        
        // --- Colisiones (simplificadas para empezar) ---
        // Colisión nave - fragmentos
        for (let i = engine.entities.fragments.length - 1; i >= 0; i--) {
            const fragment = engine.entities.fragments[i];
            const dist = MathUtils.distance(ship.x, ship.y, fragment.x, fragment.y);
            if (dist < ship.size + fragment.size && fragment.active) {
                // Recoger fragmento
                fragment.collect();
                gameState.fragments++;
                gameState.score += GAME_CONFIG.score.fragmentValue;
                updateHUD();
                
                // Efecto de partículas (implementar después)
                console.log(`💎 Fragmento recogido! Total: ${gameState.fragments}`);
            }
        }
        
        // Colisión nave - criaturas (daño)
        for (const creature of engine.entities.creatures) {
            const dist = MathUtils.distance(ship.x, ship.y, creature.x, creature.y);
            if (dist < ship.size + creature.size) {
                // Dañar al jugador
                gameState.health -= GAME_CONFIG.creature.damage;
                updateHUD();
                console.log(`💥 Daño! Vida: ${gameState.health}`);
                
                // Teletransportar criatura (para evitar daño continuo)
                creature.x = MathUtils.random(50, engine.width - 50);
                creature.y = MathUtils.random(50, engine.height - 50);
                
                // Game Over si la vida llega a 0
                if (gameState.health <= 0) {
                    gameOver();
                    return;
                }
            }
        }
        
        // --- Actualizar sistema de partículas (si existe) ---
        if (engine.entities.particles) {
            engine.entities.particles = engine.entities.particles.filter(p => p.active);
            engine.entities.particles.forEach(p => p.update(deltaTime));
        }
    }
    
    // 6. Renderizar el juego
    function renderGame(ctx) {
        // Limpiar canvas
        engine.clearCanvas();
        
        // --- Fondo (estrellas) ---
        // (Implementar después con parallax)
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, engine.width, engine.height);
        
        // Estrellas fijas (temporales)
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let i = 0; i < 100; i++) {
            const x = (i * 137) % engine.width;
            const y = (i * 271) % engine.height;
            const size = (i % 3) + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // --- Dibujar fragmentos ---
        engine.entities.fragments.forEach(fragment => {
            if (fragment.active) {
                fragment.draw(ctx);
            }
        });
        
        // --- Dibujar criaturas ---
        engine.entities.creatures.forEach(creature => {
            creature.draw(ctx);
        });
        
        // --- Dibujar nave ---
        const ship = engine.entities.ship;
        if (ship) {
            ship.draw(ctx);
        }
        
        // --- Dibujar partículas ---
        if (engine.entities.particles) {
            engine.entities.particles.forEach(p => p.draw(ctx));
        }
        
        // --- Debug info (temporal) ---
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${Math.round(1/engine.deltaTime)}`, 10, 20);
        ctx.fillText(`Fragmentos: ${gameState.fragments}`, 10, 40);
        ctx.fillText(`Zona: ${GAME_CONFIG.zones[gameState.zone].name}`, 10, 60);
    }
    
    // 7. Actualizar HUD
    function updateHUD() {
        // Vida
        const healthPercent = (gameState.health / GAME_CONFIG.ship.maxHealth) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        
        // Fragmentos
        document.getElementById('fragmentCount').textContent = gameState.fragments;
        
        // Puntuación
        document.getElementById('scoreDisplay').textContent = gameState.score;
        
        // Zona
        if (gameState.zone < GAME_CONFIG.zones.length) {
            document.getElementById('zoneName').textContent = GAME_CONFIG.zones[gameState.zone].name;
        }
    }
    
    // 8. Game Over
    function gameOver() {
        gameState.isPlaying = false;
        engine.stop();
        
        document.getElementById('finalFragments').textContent = gameState.fragments;
        document.getElementById('finalScore').textContent = gameState.score;
        gameOverScreen.classList.remove('hidden');
        hud.classList.add('hidden');
        
        console.log('💀 Game Over! Puntuación:', gameState.score);
    }
    
    // 9. Eventos de UI
    document.getElementById('startGameBtn').addEventListener('click', initGame);
    document.getElementById('retryBtn').addEventListener('click', initGame);
    document.getElementById('menuBtn').addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        engine.stop();
    });
    
    // 10. Mostrar menú principal al cargar
    mainMenu.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.add('hidden');
    
    console.log('✅ Nebula Drifter cargado! Listo para jugar.');
})();