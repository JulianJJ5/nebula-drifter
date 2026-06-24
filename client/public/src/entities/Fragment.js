// client/public/src/entities/Fragment.js
class Fragment {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.size = config?.minSize ? Math.random() * (config.maxSize - config.minSize) + config.minSize : 12;
        this.active = true;
        this.pulse = 0;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = 0.01 + Math.random() * 0.02;
        
        // Color (dorado con variación)
        this.baseColor = '#ffd700';
        this.glowColor = 'rgba(255, 215, 0, 0.4)';
        
        // Tipo de fragmento (para variedad)
        this.type = Math.random() > 0.7 ? 'rare' : 'common';
        if (this.type === 'rare') {
            this.baseColor = '#ff6b6b';
            this.glowColor = 'rgba(255, 107, 107, 0.4)';
            this.size *= 1.3;
        }
    }

    // Actualizar fragmento (animación)
    update(deltaTime) {
        // Animación de pulso
        this.pulse += this.pulseSpeed;
        this.rotation += this.rotationSpeed;
        
        // Pequeño movimiento flotante (opcional)
        // this.y += Math.sin(this.pulse) * 0.1;
    }

    // Dibujar fragmento
    draw(ctx) {
        if (!this.active) return;
        
        const pulseSize = this.size + Math.sin(this.pulse) * 2;
        
        // Sombra/brillo exterior
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, pulseSize * 2.5
        );
        gradient.addColorStop(0, this.glowColor);
        gradient.addColorStop(0.5, this.glowColor);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Cuerpo del fragmento (hexágono)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Dibujar hexágono
        const sides = 6;
        const radius = pulseSize;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        // Relleno con gradiente
        const grad = ctx.createRadialGradient(
            -radius * 0.3, -radius * 0.3, 0,
            0, 0, radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, this.baseColor);
        grad.addColorStop(1, this.baseColor);
        ctx.fillStyle = grad;
        ctx.fill();
        
        // Borde brillante
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Brillo interno (brillo central)
        const shine = ctx.createRadialGradient(
            -radius * 0.2, -radius * 0.2, 0,
            0, 0, radius * 0.6
        );
        shine.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.arc(-radius * 0.2, -radius * 0.2, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Recoger fragmento (desactivar)
    collect() {
        this.active = false;
        return this.type === 'rare' ? 25 : 10; // Puntos según tipo
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
    module.exports = Fragment;
}