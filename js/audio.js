// 8-битные звуки на Web Audio API
const GameAudio = {
    audioContext: null,
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API не поддерживается');
        }
    },
    
    playTone(frequency, duration, type = 'square') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },
    
    playShoot() {
        this.playTone(200, 0.1, 'sine');
        setTimeout(() => this.playTone(300, 0.1, 'sine'), 50);
    },
    
    playScore() {
        this.playTone(523, 0.1, 'square');
        setTimeout(() => this.playTone(659, 0.1, 'square'), 100);
        setTimeout(() => this.playTone(784, 0.2, 'square'), 200);
    },
    
    playBark() {
        this.playTone(150, 0.15, 'sawtooth');
        setTimeout(() => this.playTone(120, 0.15, 'sawtooth'), 80);
    },
    
    playWhistle() {
        this.playTone(800, 0.3, 'sine');
    },
    
    playWin() {
        const notes = [523, 587, 659, 784, 880, 1047];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.2, 'square'), i * 100);
        });
    }
};
