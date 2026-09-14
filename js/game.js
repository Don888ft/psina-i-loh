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
        
        CONFIG.teams.forEach((team, index) => {
            const btn = document.createElement('button');
            btn.className = 'team-btn';
            btn.textContent = `${team.emoji} ${team.name}`;
            btn.addEventListener('click', () => this.selectTeam(index));
            container.appendChild(btn);
        });
    }
    
    selectTeam(teamIndex) {
        this.tournament.start(teamIndex);
        document.getElementById('teamMenu').classList.add('hidden');
        document.getElementById('tournamentBracket').classList.remove('hidden');
        this.startMatch();
        this.state = 'PLAYING';
        GameAudio.playWhistle();
    }
    
    startMatch() {
        this.score = { player: 0, opponent: 0 };
        this.gameTime = CONFIG.game.matchDuration;
        this.lastTime = Date.now();
        
        // Создаём команды
        this.playerTeam = [
            new Player(600, 250, true, true),
            new Player(600, 350, false, true)
        ];
        
        this.opponentTeam = [
            new Player(200, 250, true, false),
            new Player(200, 350, false, false)
        ];
        
        // Начальное владение мячом
        this.ball = new Ball();
        this.ball.pickUp(this.playerTeam[0]);
        
        // Обновляем турнирную сетку
        this.tournament.updateBracketDisplay();
    }
    
    handleInput() {
        if (this.state !== 'PLAYING') return;
        
        const speed = this.tournament.getPlayerTeam().speed;
        const player = this.playerTeam[0]; // Управляем Коляном
        
        // Движение
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            player.vx = -speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            player.vx = speed;
        }
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            player.vy = -speed;
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            player.vy = speed;
        }
        
        // Бросок
        if (this.keys[' '] && player.hasBall) {
            const targetHoop = CONFIG.hoops[1]; // Правая корзина
            this.ball.shoot(player, targetHoop);
            this.keys[' '] = false;
        }
    }
    
    updateAI() {
        const opponent = this.tournament.getCurrentOpponent();
        
        this.opponentTeam.forEach(opp => {
            // Если у противника мяч
            if (opp.hasBall) {
                const targetHoop = CONFIG.hoops[0];
                const dist = opp.distanceTo(targetHoop);
                
                // Движемся к корзине
                if (dist > 150) {
                    opp.moveTowards(targetHoop, opponent.speed);
                } else {
                    // Бросаем с учётом навыка
                    if (Math.random() < opponent.skill * 0.04) {
                        this.ball.shoot(opp, targetHoop);
                    } else {
                        opp.moveTowards(targetHoop, opponent.speed * 0.7);
                    }
                }
            }
            // Если мяч у игрока - защищаемся
            else if (this.ball.owner && this.ball.owner.isPlayerTeam) {
                const target = this.ball.owner;
                const dist = opp.distanceTo(target);
                
                if (dist > 40) {
                    opp.moveTowards(target, opponent.speed * 0.9);
                }
            }
            // Иначе идём к мячу
            else if (!this.ball.owner) {
                const dist = opp.distanceTo(this.ball);
                if (dist > 30) {
                    opp.moveTowards(this.ball, opponent.speed);
                }
            }
        });
        
        // ПалНиколаич тоже играет (простое поведение)
        const palNikolaich = this.playerTeam[1];
        if (!palNikolaich.hasBall && !this.ball.owner) {
            const dist = palNikolaich.distanceTo(this.ball);
            if (dist > 30) {
                palNikolaich.moveTowards(this.ball, opponent.speed * 0.6);
            }
        }
    }
    
    checkBallPickup() {
        if (this.ball.owner) return;
        
        const allPlayers = [...this.playerTeam, ...this.opponentTeam];
        
        allPlayers.forEach(p => {
            const dist = p.distanceTo(this.ball);
            if (dist < 30) {
                this.ball.pickUp(p);
            }
        });
    }
    
    checkScoring() {
        CONFIG.hoops.forEach(hoop => {
            const dx = this.ball.x - hoop.x;
            const dy = this.ball.y - hoop.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Улучшенная проверка попадания
            if (dist < 25 && this.ball.vy > 1 && !this.ball.owner) {
                // Правая корзина - очки игроку
                if (hoop.player && this.ball.lastScoreTeam === true) {
                    this.score.player += CONFIG.game.pointsPerBasket;
                    this.ball.reset(false); // Мяч сопернику
                    GameAudio.playScore();
                }
                // Левая корзина - очки сопернику
                else if (!hoop.player && this.ball.lastScoreTeam === false) {
                    this.score.opponent += CONFIG.game.pointsPerBasket;
                    this.ball.reset(true); // Мяч игроку
                    GameAudio.playScore();
                }
            }
        });
        
        // Отслеживаем команду владения для начисления очков
        if (this.ball.owner) {
            this.ball.lastScoreTeam = this.ball.owner.isPlayerTeam;
        }
    }
    
    update() {
        if (this.state !== 'PLAYING') return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        // Обновление таймера
        this.gameTime -= deltaTime;
        
        if (this.gameTime <= 0) {
            this.gameTime = 0;
            this.endMatch();
            return;
        }
        
        // Обработка ввода и ИИ
        this.handleInput();
        this.updateAI();
        
        // Обновление всех объектов
        [...this.playerTeam, ...this.opponentTeam].forEach(p => p.update());
        this.ball.update();
        this.kargalyga.update(this.ball, [...this.playerTeam, ...this.opponentTeam]);
        
        // Проверки
        this.checkBallPickup();
        this.checkScoring();
        
        // Досрочная победа по очкам
        if (this.score.player >= CONFIG.game.winScore || 
            this.score.opponent >= CONFIG.game.winScore) {
            this.gameTime = 0;
            this.endMatch();
        }
    }
    
    endMatch() {
        this.state = 'MATCH_END';
        
        if (this.score.player > this.score.opponent) {
            // Победа в матче
            this.tournament.wins++;
            
            if (this.tournament.nextMatch()) {
                // Следующий матч
                setTimeout(() => {
                    this.startMatch();
                    this.state = 'PLAYING';
                    GameAudio.playWhistle();
                }, 2000);
            } else {
                // Победа в турнире!
                this.showVictoryScreen();
            }
        } else {
            // Поражение
            this.showDefeatScreen();
        }
    }
    
    showVictoryScreen() {
        this.state = 'VICTORY';
        const team = this.tournament.getPlayerTeam();
        
        document.getElementById('winTitle').textContent = '🏆 ЧЕМПИОНЫ! 🏆';
        document.getElementById('winText').innerHTML = 
            `<strong>${team.emoji} ${team.name}</strong> выиграли турнир!<br>` +
            `Финальный счёт: <strong>${this.score.player}:${this.score.opponent}</strong><br>` +
            `Побед: ${this.tournament.wins} из ${CONFIG.teams.length - 1}`;
        
        // ASCII кубок
        document.getElementById('trophyArt').textContent = `
    ___________
   '._==_==_=_.'
   .-\\:      /-.
  | (|:.     |) |
   '-|:.     |-'
     \\::.    /
      '::. .'
        ) (
      _.' '._
     ═════════`;
        
        document.getElementById('winMenu').classList.remove('hidden');
        GameAudio.playWin();
    }
    
    showDefeatScreen() {
        this.state = 'DEFEAT';
        const team = this.tournament.getPlayerTeam();
        const opponent = this.tournament.getCurrentOpponent();
        
        document.getElementById('winTitle').textContent = '💔 ПОРАЖЕНИЕ 💔';
        document.getElementById('winText').innerHTML = 
            `<strong>${team.emoji} ${team.name}</strong> проиграли<br>` +
            `<strong>${opponent.emoji} ${opponent.name}</strong><br><br>` +
            `Финальный счёт: <strong>${this.score.player}:${this.score.opponent}</strong><br>` +
            `Побед в турнире: ${this.tournament.wins}`;
        
        document.getElementById('trophyArt').textContent = '';
        document.getElementById('winMenu').classList.remove('hidden');
    }
    
    draw() {
        // Очистка
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        
        if (this.state === 'PLAYING' || this.state === 'MATCH_END') {
            // Корт и корзины
            Sprites.drawCourt(this.ctx);
            Sprites.drawHoops(this.ctx);
            
            // Команды
            const opponentTeam = this.tournament.getCurrentOpponent();
            const playerTeam = this.tournament.getPlayerTeam();
            
            this.opponentTeam.forEach(p => p.draw(this.ctx, opponentTeam.color));
            this.playerTeam.forEach(p => p.draw(this.ctx, playerTeam.color));
            
            // Мяч и Каргалыга
            this.ball.draw(this.ctx);
            this.kargalyga.draw(this.ctx);
            
            // UI - счёт
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 32px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `${this.score.player} : ${this.score.opponent}`, 
                CONFIG.canvas.width / 2, 
                50
            );
            
            // Таймер
            this.ctx.font = 'bold 20px monospace';
            const timeColor = this.gameTime < 10 ? '#ff0000' : '#ffeb3b';
            this.ctx.fillStyle = timeColor;
            this.ctx.fillText(
                `⏱ ${Math.ceil(this.gameTime)}`, 
                CONFIG.canvas.width / 2, 
                80
            );
            
            // Названия команд
            this.ctx.font = '16px monospace';
            this.ctx.textAlign = 'left';
            this.ctx.fillStyle = playerTeam.color;
            this.ctx.fillText(
                `${playerTeam.emoji} ${playerTeam.name}`, 
                20, 
                30
            );
            
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = opponentTeam.color;
            this.ctx.fillText(
                `${opponentTeam.name} ${opponentTeam.emoji}`, 
                CONFIG.canvas.width - 20, 
                30
            );
            
            // Подсказки управления
            if (this.gameTime > CONFIG.game.matchDuration - 5) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.font = '14px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    'WASD/Стрелки - движение | ПРОБЕЛ - бросок', 
                    CONFIG.canvas.width / 2, 
                    CONFIG.canvas.height - 20
                );
            }
            
            // Сообщение об окончании матча
            if (this.state === 'MATCH_END') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
                
                this.ctx.fillStyle = '#16d5c2';
                this.ctx.font = 'bold 40px monospace';
                this.ctx.textAlign = 'center';
                
                if (this.score.player > this.score.opponent) {
                    this.ctx.fillText('ПОБЕДА!', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
                    this.ctx.font = '20px monospace';
                    this.ctx.fillStyle = '#fff';
                    this.ctx.fillText(
                        `Следующий матч через 2 секунды...`, 
                        CONFIG.canvas.width / 2, 
                        CONFIG.canvas.height / 2 + 40
                    );
                }
            }
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Запуск игры при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
