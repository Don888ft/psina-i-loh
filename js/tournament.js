// Управление турниром
class Tournament {
    constructor() {
        this.playerTeamIndex = 0;
        this.opponents = [];
        this.currentOpponentIndex = 0;
        this.wins = 0;
        this.matchesPlayed = 0;
    }
    
    start(playerTeamIndex) {
        this.playerTeamIndex = playerTeamIndex;
        this.wins = 0;
        this.matchesPlayed = 0;
        
        // Создаём список противников (все команды кроме выбранной)
        this.opponents = [];
        for (let i = 0; i < CONFIG.teams.length; i++) {
            if (i !== playerTeamIndex) {
                this.opponents.push(i);
            }
        }
        
        // Перемешиваем противников
        this.shuffleOpponents();
        this.currentOpponentIndex = this.opponents[this.matchesPlayed];
    }
    
    shuffleOpponents() {
        for (let i = this.opponents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.opponents[i], this.opponents[j]] = [this.opponents[j], this.opponents[i]];
        }
    }
    
    nextMatch() {
        this.matchesPlayed++;
        
        if (this.matchesPlayed < this.opponents.length) {
            this.currentOpponentIndex = this.opponents[this.matchesPlayed];
            return true;
        }
        
        return false; // Турнир окончен
    }
    
    getCurrentOpponent() {
        return CONFIG.teams[this.currentOpponentIndex];
    }
    
    getPlayerTeam() {
        return CONFIG.teams[this.playerTeamIndex];
    }
    
    getRemainingMatches() {
        return this.opponents.length - this.matchesPlayed;
    }
    
    updateBracketDisplay() {
        const display = document.getElementById('bracketDisplay');
        if (!display) return;
        
        display.innerHTML = '';
        
        this.opponents.forEach((opponentIdx, i) => {
            const item = document.createElement('div');
            item.className = 'bracket-item';
            
            if (i < this.matchesPlayed) {
                item.classList.add('completed');
            } else if (i === this.matchesPlayed) {
                item.classList.add('current');
            }
            
            const team = CONFIG.teams[opponentIdx];
            item.textContent = `${team.emoji} ${team.name}`;
            display.appendChild(item);
        });
    }
}
