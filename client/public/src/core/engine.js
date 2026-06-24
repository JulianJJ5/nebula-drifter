// Motor principal del juego (Game Loop)
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Estado del juego
        this.running = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Entidades
        this.entities = {
            ship: null,
            fragments: [],
            creatures: [],
            storms: [],
            particles: [],
        };
        
        // Sistema de entrada
        this.keys = {};
        this.setupInput();
        
        // Callbacks para el ciclo de vida
        this.onUpdate = null;
        this.onRender = null;
    }
    
    // Configurar eventos de teclado
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault(); // Evitar scroll
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    // Verificar si una tecla está presionada
    isKeyPressed(key) {
        return this.keys[key] === true;
    }
    
    // Iniciar el juego
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    // Detener el juego
    stop() {
        this.running = false;
    }
    
    // Game Loop principal
    gameLoop(currentTime) {
        if (!this.running) return;
        
        // Calcular deltaTime (tiempo entre frames)
        this.deltaTime = (currentTime - this.lastTime) / 1000; // en segundos
        this.lastTime = currentTime;
        
        // Limitar deltaTime para evitar saltos (si el juego se minimiza)
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        
        // Actualizar lógica
        if (this.onUpdate) {
            this.onUpdate(this.deltaTime);
        }
        
        // Renderizar
        if (this.onRender) {
            this.onRender(this.ctx);
        }
        
        // Continuar el loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // Limpiar el canvas
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    // Dibujar un círculo (utilidad)
    drawCircle(ctx, x, y, radius, color, strokeColor = null, strokeWidth = 1) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}