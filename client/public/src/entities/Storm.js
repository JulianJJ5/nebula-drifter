// client/public/src/entities/Storm.js
class Storm {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.radius = config?.radius || 150;
        this.damage = config?.damagePerTick || 0.5;
        this.duration = config?.duration || 4000; // ms
        this.active = true;
        this.lifetime = 0;
        
        // Animación
        this.pulse = 0;
        this.pulseSpeed = 0.02;
        this.rotation = 0;
        this.rotationSpeed = 0.005;
        
        // Partículas internas
        this.particles = [];
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                distance: Math.random() * this.radius,
                speed: 0.5 + Math.random() * 1.5,
                size: 2 + Math.random() * 4,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        // Color de la tormenta
        this.colors = [
            'rgba(108, 60, 224, ',  // Púrpura
            'rgba(224, 60, 138, ',  // Rosa
            'rgba(60, 138, 224, '   // Azul
        ];
        this.mainColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    // Actualizar tormenta
    update(deltaTime, playerX, playerY) {
        if (!this.active) return;
        
        // Incrementar tiempo de vida
        this.lifetime += deltaTime * 1000;
        
        // Desactivar si expiró
        if (this.lifetime >= this.duration) {
            this.active = false;
            return;
        }
        
        // Animación de pulso
        this.pulse += this.pulseSpeed;
        this.rotation += this.rotationSpeed;
        
        // Actualizar partículas internas
        for (const particle of this.particles) {
            particle.angle += particle.speed * deltaTime * 0.5;
            particle.distance += Math.sin(particle.phase + this.pulse) * 0.3;
            particle.distance = Math.max(2, Math.min(this.radius, particle.distance));
            particle.phase += deltaTime * 0.5;
        }
    }

    // Dibujar tormenta
    draw(ctx) {
        if (!this.active) return;
        
        const progress = this.lifetime / this.duration;
        const alpha = Math.sin(progress * Math.PI) * 0.8 + 0.2;
        const pulseRadius = this.radius + Math.sin(this.pulse) * 20;
        
        // 1. Brillo exterior (aura)
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, pulseRadius * 1.8
        );
        gradient.addColorStop(0, this.mainColor + (alpha * 0.3) + ')');
        gradient.addColorStop(0.5, this.mainColor + (alpha * 0.15) + ')');
        gradient.addColorStop(1, this.mainColor + '0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // 2. Anillos concéntricos (ondas de energía)
        ctx.save();
        ctx.translate(this.x, this.y);
        
        for (let i = 0; i < 3; i++) {
            const ringRadius = pulseRadius * (0.4 + i * 0.25) + Math.sin(this.pulse + i * 1.5) * 15;
            const ringAlpha = alpha * (0.3 - i * 0.08);
            
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = this.mainColor + ringAlpha + ')';
            ctx.lineWidth = 2 + Math.sin(this.pulse + i) * 1;
            ctx.stroke();
        }
        
        // 3. Partículas internas (relámpagos)
        for (const particle of this.particles) {
            const x = Math.cos(particle.angle + this.rotation) * particle.distance;
            const y = Math.sin(particle.angle + this.rotation) * particle.distance;
            const particleAlpha = alpha * (0.5 + Math.sin(particle.phase + this.pulse) * 0.3);
            
            // Círculo de partícula
            ctx.beginPath();
            ctx.arc(x, y, particle.size * (0.5 + Math.sin(particle.phase + this.pulse) * 0.3), 0, Math.PI * 2);
            ctx.fillStyle = this.mainColor + particleAlpha + ')';
            ctx.fill();
            
            // Brillo de partícula
            if (particle.size > 3) {
                const glow = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 3);
                glow.addColorStop(0, this.mainColor + (particleAlpha * 0.5) + ')');
                glow.addColorStop(1, this.mainColor + '0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, y, particle.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
        
        // 4. Borde de advertencia (cuando está a punto de desaparecer)
        if (progress > 0.7) {
            const warningAlpha = Math.sin(this.pulse * 4) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(255, 255, 255, ${warningAlpha * 0.3})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 15]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseRadius * 1.2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // 5. Texto de advertencia (opcional)
        if (progress < 0.2) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(1 - progress / 0.2) * 0.5})`;
            ctx.font = 'bold 16px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ TORMENTA DE PLASMA', this.x, this.y - pulseRadius - 30);
        }
    }

    // Verificar colisión con un punto
    checkCollision(x, y, radius) {
        if (!this.active) return false;
        const dx = x - this.x;
        const dy = y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const effectiveRadius = this.radius + Math.sin(this.pulse) * 20;
        return dist < effectiveRadius + radius;
    }

    // Obtener el daño por tick
    getDamage() {
        if (!this.active) return 0;
        // El daño varía con el pulso
        const damageMultiplier = 0.8 + Math.sin(this.pulse * 2) * 0.2;
        return this.damage * damageMultiplier;
    }

    // Obtener posición (para partículas)
    getPosition() {
        return { x: this.x, y: this.y };
    }

    // Verificar si está activa
    isActive() {
        return this.active;
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storm;
}