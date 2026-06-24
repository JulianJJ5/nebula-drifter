// client/src/entities/Ship.js
class Ship {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;
        this.vx = 0;
        this.vy = 0;
        
        // Configuración
        this.maxSpeed = config.maxSpeed || 4;
        this.acceleration = config.acceleration || 0.1;
        this.friction = config.friction || 0.97;
        this.rotationSpeed = config.rotationSpeed || 0.05;
        this.size = config.size || 20;
        this.maxHealth = config.maxHealth || 5;
        this.health = this.maxHealth;
        
        // Estado de la nave
        this.thrusting = false;
        this.turnLeft = false;
        this.turnRight = false;
        
        // Color de la nave
        this.color = '#00e5ff';
        this.trail = [];
        this.maxTrail = 15;
    }

    // Actualizar nave
    update(keys, deltaTime) {
        // Leer entrada del teclado
        this.thrusting = keys['w'] || keys['W'] || keys['ArrowUp'];
        this.turnLeft = keys['a'] || keys['A'] || keys['ArrowLeft'];
        this.turnRight = keys['d'] || keys['D'] || keys['ArrowRight'];
        
        // Rotación
        if (this.turnLeft) {
            this.angle -= this.rotationSpeed;
        }
        if (this.turnRight) {
            this.angle += this.rotationSpeed;
        }
        
        // Aceleración
        if (this.thrusting) {
            this.vx += Math.cos(this.angle) * this.acceleration;
            this.vy += Math.sin(this.angle) * this.acceleration;
            
            // Crear estela (solo cuando acelera)
            this.addTrail();
        }
        
        // Fricción (inercia)
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Limitar velocidad máxima
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > this.maxSpeed) {
            this.vx = (this.vx / currentSpeed) * this.maxSpeed;
            this.vy = (this.vy / currentSpeed) * this.maxSpeed;
        }
        
        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;
        
        // Actualizar estela (decaimiento)
        this.updateTrail();
    }

    // Agregar punto a la estela
    addTrail() {
        this.trail.push({ x: this.x, y: this.y, life: 1 });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }
    }

    // Actualizar estela
    updateTrail() {
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= 0.04;
            if (this.trail[i].life <= 0) {
                this.trail.splice(i, 1);
            }
        }
    }

    // Verificar límites del canvas
    checkBoundaries(width, height) {
        // Wrap alrededor (como en Asteroids)
        const margin = 10;
        if (this.x < -margin) this.x = width + margin;
        if (this.x > width + margin) this.x = -margin;
        if (this.y < -margin) this.y = height + margin;
        if (this.y > height + margin) this.y = -margin;
    }

    // Dibujar nave
    draw(ctx) {
        // Dibujar estela
        for (const point of this.trail) {
            const alpha = point.life * 0.5;
            const radius = 3 * point.life;
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx.fill();
        }
        
        // Dibujar nave (triángulo)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Sombra/brillo
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        
        // Triángulo principal
        const size = this.size;
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.7, -size * 0.7);
        ctx.lineTo(-size * 0.7, size * 0.7);
        ctx.closePath();
        
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Brillo interior (solo cuando acelera)
        if (this.thrusting) {
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#ff6b6b';
            ctx.beginPath();
            ctx.moveTo(-size * 0.5, 0);
            ctx.lineTo(-size * 0.9, -size * 0.3);
            ctx.lineTo(-size * 0.9, size * 0.3);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
            ctx.fill();
        }
        
        ctx.restore();
    }

    // Recibir daño
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        return this.health <= 0;
    }

    // Curar (opcional)
    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    // Obtener el centro de la nave (para colisiones)
    getCenter() {
        return { x: this.x, y: this.y };
    }
}

// Exportar para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ship;
}