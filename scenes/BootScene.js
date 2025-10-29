class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load all character cards for selection screen
        this.load.image('character_bang_bang', 'assets/cards/bangbang.jpeg');
        this.load.image('character_loco_motive', 'assets/cards/locomotive.jpeg');
        this.load.image('character_tre_boujie', 'assets/cards/tre-boujie.jpeg');
        this.load.image('character_eight_mm', 'assets/cards/8mm.jpeg');
        this.load.image('character_crankshaft', 'assets/cards/crankshaft.jpeg');
        this.load.image('character_bashcan', 'assets/cards/bashcan.jpeg');
        
        console.log('BootScene: Loading all 6 character assets...');
    }

    create() {
        // Start with the new game flow
        this.scene.start('StartScene');
    }
}