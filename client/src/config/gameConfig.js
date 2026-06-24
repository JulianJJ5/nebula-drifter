// Configuración global del juego
const GAME_CONFIG = {
    // Tamaño del canvas
    canvasWidth: 900,
    canvasHeight: 600,
    
    // Nave
    ship: {
        maxSpeed: 4,
        acceleration: 0.1,
        friction: 0.97,
        rotationSpeed: 0.05,
        size: 20,
        maxHealth: 5,
    },
    
    // Fragmentos
    fragment: {
        count: 15,              // Por zona
        minSize: 8,
        maxSize: 16,
        colors: ['#ffd700', '#ff6b6b', '#ff9f43', '#f368e0'],
        respawnTime: 3000,      // ms para reaparecer
    },
    
    // Criaturas
    creature: {
        count: 8,               // Por zona
        speed: 1.2,
        aggroRadius: 200,
        damage: 1,
    },
    
    // Tormentas
    storm: {
        duration: 4000,         // ms
        cooldown: 15000,        // ms entre tormentas
        radius: 150,
        damagePerTick: 0.5,
    },
    
    // Zonas
    zones: [
        { id: 1, name: 'El Velo de Polvo', fragmentsRequired: 0, difficulty: 1 },
        { id: 2, name: 'El Mar de Cristal', fragmentsRequired: 10, difficulty: 2 },
        { id: 3, name: 'El Bosque de Medusas', fragmentsRequired: 25, difficulty: 3 },
        { id: 4, name: 'El Abismo Susurrante', fragmentsRequired: 45, difficulty: 4 },
        { id: 5, name: 'El Núcleo Violeta', fragmentsRequired: 70, difficulty: 5 },
    ],
    
    // Puntuación
    score: {
        fragmentValue: 10,
        creatureKillBonus: 25,
        zoneBonus: 100,
    },
};

// Exportar para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONFIG;
}