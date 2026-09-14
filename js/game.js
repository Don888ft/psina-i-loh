// Основной игровой движок
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.state = 'TEAM_SELECT';
        this.tournament = new Tournament();
        
        this.playerTeam = [];
        this.opponentTeam = [];
        this.ball = new Ball();
        this.kargalyga = new Kargalyga();
        
        this.score = { player: 0, opponent: 0 };
        this.gameTime = CONFIG.game.matchDuration;
        this.lastTime = Date.now();
        
        this.keys = {};
        
        this.init();
    }
    
    init() {
        // Инициализация аудио
        GameAudio.init();
        
        // Создание кнопок выбора команды
        this.createTeamButtons();
        
        // Обработчики клавиатуры
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (this.state === 'PLAYING' && e.key === ' ') {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Кнопка "Играть снова"
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            location.reload();
        });
        
        // Запуск игрового цикла
        this.gameLoop();
    }
    
    createTeamButtons() {
        const container = document.getElementById('teamSelect');
        
