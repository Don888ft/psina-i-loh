// Класс мяча
class Ball {
    constructor() {
        this.reset();
        this.radius = 8;
    }
    
    reset(ownerTeam = true) {
        this.x = CONFIG.canvas.width / 2;
        this.y = CONFIG.canvas.height / 2;
        this.vx = 0;
        this.vy = 0;
        this.owner = null;
        this.lastScoreTeam = ownerTeam;
    }
    
    draw(ctx) {
        Sprites.drawBall(ctx, this.x, this.y);
    }
    
    update() {
        if (this.owner) {
            // Мяч следует за владельцем
            this.x = this.owner.x;
            this.y = this.owner.y - 20;
            this.vx = 0;
            this.vy = 0;
        } else {
            // Свободный полёт
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.98;
            this.vy *= 0.98;
            
            // Отскок от границ
            const c = CONFIG.court;
            if (this.x < c.x + this.radius || this.x > c.x + c.width - this.radius) {
                this.vx *= -0.8;
                this.x = Math.max(c.x + this.radius, Math.min(c.x + c.width - this.radius, this.x));
            }
            if (this.y < c.y + this.radius || this.y > c.y + c.height - this.radius) {
                this.vy *= -0.8;
                this.y = Math.max(c.y + this.radius, Math.min(c.y + c.height - this.radius, this.y));
            }
        }
    }
    
    shoot(shooter, targetHoop) {
        this.owner = null;
        shooter.hasBall = false;
        
        const dx = targetHoop.x - shooter.x;
        const dy = targetHoop.y - shooter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const power = 8;
        this.vx = (dx / dist) * power;
        this.vy = (dy / dist) * power;
        
        // Звук броска
        if (window.GameAudio) {
            GameAudio.playShoot();
        }
    }
    
    pickUp(player) {
        this.owner = player;
        player.hasBall = true;
        this.vx = 0;
        this.vy = 0;
    }
}
