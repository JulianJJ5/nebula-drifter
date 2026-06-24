// client/public/src/entities/Creature.js
class Creature {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.size = 20 + Math.random() * 10;
        this.speed = (config?.speed || 1.2) + Math.random() * 0.5;
        this.aggroRadius = config?.aggroRadius || 200;
        this.damage = config?.damage || 1;
        this.health = 3;
        this.maxHealth = 3;
        this.active = true;
        
        // Movimiento sinusoidal (como medusa)
        this.phase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.03 + Math.random() * 0.02;
        this.wobbleAmplitude = 0.5 + Math.random() * 0.5;
        
        // Trayectoria aleatoria (cuando no persigue)
        this.targetX = x;
        this.targetY = y;
        this.wanderTimer = 0;
        this.wanderInterval = 120 + Math.random() * 120;
        
        // Color según tipo
        const colors = ['#00ff88', '#00ccff', '#ff00ff', '#ff6b6b'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Partículas de la criatura (tentáculos)
        this.tentacles = [];
        for (let i = 0; i < 8; i++) {
            this.tentacles.push({
                angle: (i / 8) * Math.PI * 2,
                length: this.size * (0.8 + Math.random() * 0.4),
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    // Actualizar criatura
    update(playerX, playerY, deltaTime) {
        if (!this.active) return;
        
        // Actualizar fase sinusoidal
        this.phase += this.wobbleSpeed;
        
        // Calcular distancia al jugador
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Comportamiento: perseguir si está dentro del radio de aggro
        if (dist < this.aggroRadius) {
            // Perseguir al jugador (con algo de inercia sinusoidal)
            const angle = Math.atan2(dy, dx);
            const wobble = Math.sin(this.phase) * this.wobbleAmplitude * 0.3;
            this.x += Math.cos(angle + wobble) * this.speed * 0.8;
            this.y += Math.sin(angle + wobble) * this.speed * 0.8;
        } else {
            // Movimiento errante (vagar)
            this.wanderTimer++;
            if (this.wanderTimer > this.wanderInterval) {
                this.targetX = Math.random() * 800 + 50;
                this.targetY = Math.random() * 500 + 50;
                this.wanderTimer = 0;
                this.wanderInterval = 60 + Math.random() * 120;
            }
            
            const wanderDx = this.targetX - this.x;
            const wanderDy = this.targetY - this.y;
            const wanderDist = Math.sqrt(wanderDx * wanderDx + wanderDy * wanderDy);
            if (wanderDist > 5) {
                const angle = Math.atan2(wanderDy, wanderDx);
                this.x += Math.cos(angle + Math.sin(this.phase) * 0.3) * this.speed * 0.3;
                this.y += Math.sin(angle + Math.cos(this.phase) * 0.3) * this.speed * 0.3;
            }
        }
        
        // Movimiento sinusoidal (flotación)
        this.y += Math.sin(this.phase * 2) * 0.2;
        this.x += Math.cos(this.phase * 1.5) * 0.1;
        
        // Actualizar tentáculos
        for (const tentacle of this.tentacles) {
            tentacle.phase += 0.05;
        }
    }

    // Dibujar criatura
    draw(ctx) {
        if (!this.active) return;
        
        // Efecto de brillo
        const glow = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );
        glow.addColorStop(0, this.color + '40');
        glow.addColorStop(1, this.color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Dibujar tentáculos
        for (const tentacle of this.tentacles) {
            const angle = tentacle.angle + this.phase * 0.5;
            const length = tentacle.length + Math.sin(tentacle.phase) * 3;
            const x1 = this.x + Math.cos(angle) * this.size * 0.5;
            const y1 = this.y + Math.sin(angle) * this.size * 0.5;
            const x2 = this.x + Math.cos(angle + 0.5) * (this.size * 0.5 + length);
            const y2 = this.y + Math.sin(angle + 0.5) * (this.size * 0.5 + length);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(
                (x1 + x2) / 2 + Math.sin(tentacle.phase + this.phase) * 5,
                (y1 + y2) / 2 + Math.cos(tentacle.phase + this.phase) * 5,
                x2, y2
            );
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // Cuerpo principal (círculo con gradiente)
        const gradient = ctx.createRadialGradient(
            this.x - this.size * 0.3, this.y - this.size * 0.3, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, this.color);
        
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 30;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojos (siempre miran al jugador)
        const eyeAngle = Math.atan2(
            window._playerY - this.y || 0,
            window._playerX - this.x || 0
        );
        for (let i = -1; i <= 1; i += 2) {
            const eyeX = this.x + Math.cos(eyeAngle + i * 0.8) * this.size * 0.3;
            const eyeY = this.y + Math.sin(eyeAngle + i * 0.8) * this.size * 0.3;
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, this.size * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.arc(
                eyeX + Math.cos(eyeAngle) * this.size * 0.08,
                eyeY + Math.sin(eyeAngle) * this.size * 0.08,
                this.size * 0.1, 0, Math.PI * 2
            );
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        // Barra de vida (solo si tiene daño)
        if (this.health < this.maxHealth) {
            const barWidth = this.size * 1.2;
            const barHeight = 4;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.size - 10;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = '#34d399';
            ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        }
    }

    // Recibir daño
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.active = false;
            return true; // Murió
        }
        return false;
    }

    // Verificar colisión con un punto
    checkCollision(x, y, radius) {
        if (!this.active) return false;
        const dx = x - this.x;
        const dy = y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < this.size + radius;
    }

    // Obtener posición (para partículas)
    getPosition() {
        return { x: this.x, y: this.y };
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Creature;
}