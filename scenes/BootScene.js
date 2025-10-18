class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        
    }

    create() {
        // Start with the new game flow
        this.scene.start('StartScene');
    }
}