// Utilidades matemáticas
const MathUtils = {
    // Distancia entre dos puntos
    distance: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Interpolación lineal
    lerp: (a, b, t) => a + (b - a) * t,
    
    // Aleatorio entre min y max
    random: (min, max) => Math.random() * (max - min) + min,
    
    // Aleatorio entero entre min y max (inclusive)
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // Limitar un valor entre min y max
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    
    // Ángulo entre dos puntos (en radianes)
    angleBetween: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
    
    // Conversión de grados a radianes
    toRadians: (degrees) => degrees * (Math.PI / 180),
    
    // Conversión de radianes a grados
    toDegrees: (radians) => radians * (180 / Math.PI),
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathUtils;
}