// Каргалыга - пёс-вредитель
class Kargalyga {
    constructor() {
        this.x = -100;
        this.y = 300;
        this.active = false;
        this.timer = 0;
        this.direction = 1;
        this.stealingBall = false;
    }
    
    draw(ctx) {
        if (!this.active) return;
        Sprites.drawKargalyga(ctx, this.x, this.y);
    }
    
    update(ball, players) {
        this.timer++;
        
        // Случайное появление
        if (!this.active && this.timer > CONFIG.kargalyga.spawnInterval && 
            Math.random() < CONFIG.kargalyga.spawnChance) {
            this.spawn();
        }
        
        if (this.active) {
            // Движение через корт
            this.x += this.direction * CONFIG.kargalyga.speed;
            
            // Взаимодействие с мячом
            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < CONFIG.kargalyga.disruptRadius) {
                if (!ball.owner) {
                    // Пинает свободный мяч
                    ball.vx += (Math.random() - 0.5) * 12;
                    ball.vy += (Math.random() - 0.5) * 12;
                    
                    if (window.GameAudio) {
                        GameAudio.playBark();
                    }
                } else if (Math.random() < 0.02) {
                    // Крадёт мяч у игрока!
                    ball.owner.hasBall = false;
                    ball.owner = null;
                    ball.vx = this.direction * 6;
                    ball.vy = (Math.random() - 0.5) * 8;
                    this.stealingBall = true;
                    
                    if (window.GameAudio) {
                        GameAudio.playBark();
                    }
                }
            }
            
            // Выталкивание игроков
            players.forEach(player => {
                const pdx = player.x - this.x;
                const pdy = player.y - this.y;
                const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
                
                if (pdist < 40) {
                    player.vx += (pdx / pdist) * 3;
                    player.vy += (pdy / pdist) * 3;
                }
            });
            
            // Убегает за пределы экрана
            if ((this.direction > 0 && this.x > CONFIG.canvas.width + 50) || 
                (this.direction < 0 && this.x < -50)) {
                this.active = false;
                this.stealingBall = false;
                this.direction *= -1;
                this.timer = 0;
            }
        }
    }
    
    spawn() {
        this.active = true;
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.x = this.direction > 0 ? -50 : CONFIG.canvas.width + 50;
        this.y = CONFIG.court.y + 50 + Math.random() * (CONFIG.court.height - 100);
        this.timer = 0;
        this.stealingBall = false;
        
        if (window.GameAudio) {
            GameAudio.playBark();
        }
    }
}
