// Класс игрока
class Player {
    constructor(x, y, isKolyan, isPlayerTeam) {
        this.x = x;
        this.y = y;
        this.isKolyan = isKolyan;
        this.isPlayerTeam = isPlayerTeam;
        this.vx = 0;
        this.vy = 0;
        this.hasBall = false;
        this.width = 24;
        this.height = 40;
    }
    
    draw(ctx, color) {
        Sprites.drawPlayer(ctx, this.x, this.y, this.isKolyan, color, this.hasBall);
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Границы корта
        const c = CONFIG.court;
        this.x = Math.max(c.x + 20, Math.min(c.x + c.width - 20, this.x));
        this.y = Math.max(c.y + 30, Math.min(c.y + c.height - 30, this.y));
        
        // Трение
        this.vx *= 0.85;
        this.vy *= 0.85;
    }
    
    distanceTo(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    moveTowards(target, speed) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
        }
    }
}
