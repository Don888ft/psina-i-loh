// Конфигурация игры
const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    
    court: {
        x: 50,
        y: 100,
        width: 700,
        height: 400
    },
    
    hoops: [
        { x: 80, y: 300, player: false },   // Левая корзина (соперник)
        { x: 720, y: 300, player: true }    // Правая корзина (игрок)
    ],
    
    teams: [
        { name: 'ПСИНА И ЛОХ', color: '#e94560', emoji: '🔥', speed: 2.5, skill: 0.7 },
        { name: 'ЧЕРЕПА', color: '#2a2a2a', emoji: '💀', speed: 2.2, skill: 0.6 },
        { name: 'МОЛНИИ', color: '#ffeb3b', emoji: '⚡', speed: 3.0, skill: 0.65 },
        { name: 'ЯСТРЕБЫ', color: '#795548', emoji: '🦅', speed: 2.4, skill: 0.68 },
        { name: 'ВОЛКИ', color: '#607d8b', emoji: '🐺', speed: 2.6, skill: 0.72 },
        { name: 'АЛМАЗЫ', color: '#00bcd4', emoji: '🔶', speed: 2.3, skill: 0.64 },
        { name: 'ЗВЁЗДЫ', color: '#9c27b0', emoji: '🌟', speed: 2.7, skill: 0.75 },
        { name: 'КОРОЛИ', color: '#ffc107', emoji: '👑', speed: 2.8, skill: 0.8 }
    ],
    
    game: {
        matchDuration: 60,  // секунды
        winScore: 10,       // альтернативная победа по очкам
        pointsPerBasket: 2
    },
    
    kargalyga: {
        spawnChance: 0.01,
        spawnInterval: 300,
        speed: 4,
        disruptRadius: 40
    }
};
