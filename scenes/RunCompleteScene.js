class RunCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RunCompleteScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#001122');
        this.cameras.main.fadeIn(1000, 0, 17, 34);
        
        this.gameManager = this.registry.get('gameManager');
        this.playerData = this.gameManager.getPlayerData();
        this.runProgress = this.gameManager.getRunProgress();
        
        this.createBackground();
        this.createVictoryDisplay();
        this.createRunStats();
        this.createActionButtons();
        
        this.playVictoryEffects();
    }

    createBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x003300, 0.6);
        graphics.fillRect(0, 0, 1024, 768);
        
        // Celebration particles
        for (let i = 0; i < 150; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(2, 5);
            
            const particle = this.add.circle(x, y, size, 0x00ff41);
            particle.setAlpha(Phaser.Math.FloatBetween(0.3, 0.9));
            
            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(100, 300),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 5000),
                ease: 'Power2',
                delay: Phaser.Math.Between(0, 3000)
            });
        }
    }

    createVictoryDisplay() {
        this.add.text(512, 100, 'JUSTICE SERVED', {
            fontSize: '56px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#003311',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(512, 160, 'ALL SLUGS DELETED', {
            fontSize: '24px',
            fill: '#00aa33',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.add.text(512, 200, 'The Rust Frontier is safe... for now', {
            fontSize: '14px',
            fill: '#007722',
            fontFamily: 'Courier New',
            style: { fontStyle: 'italic' }
        }).setOrigin(0.5);

        const victoryIcon = this.add.text(512, 260, '⭐🏆⭐', {
            fontSize: '60px'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: victoryIcon,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createRunStats() {
        const statsContainer = this.add.container(512, 420);
        
        const statsBorder = this.add.rectangle(0, 0, 700, 220, 0x001100);
        statsBorder.setStrokeStyle(3, 0x00ff41);
        statsContainer.add(statsBorder);

        const titleText = this.add.text(0, -90, 'RUN COMPLETE', {
            fontSize: '22px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        statsContainer.add(titleText);

        const character = this.gameManager.getSelectedCharacter();
        const characterName = character ? character.name : 'Unknown JAK';

        const statsText = this.add.text(0, -30, 
            `JAK: ${characterName}\n` +
            `\n` +
            `HP Remaining: ${this.playerData.hp} / ${this.playerData.maxHP}\n` +
            `SLUGs Defeated: ${this.runProgress.total} / ${this.runProgress.total}\n` +
            `Total Runs Won: ${this.playerData.gamesWon}\n` +
            `\n` +
            `🏆 REPUTATION EARNED: +100`, {
            fontSize: '16px',
            fill: '#00aa33',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        statsContainer.add(statsText);

        // Boss icons defeated
        const bossIcons = this.add.text(0, 80, '🏜️ ⚡ ⚔️ 👑 🪞 💀', {
            fontSize: '24px'
        }).setOrigin(0.5);
        statsContainer.add(bossIcons);
    }

    createActionButtons() {
        const playAgainButton = this.add.text(350, 650, 'NEW RUN', {
            fontSize: '22px',
            fill: '#001122',
            fontFamily: 'Courier New',
            backgroundColor: '#00ff41',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        const mainMenuButton = this.add.text(674, 650, 'MAIN MENU', {
            fontSize: '22px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            backgroundColor: '#003311',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        playAgainButton.on('pointerdown', () => {
            this.startNewRun();
        });

        playAgainButton.on('pointerover', () => {
            playAgainButton.setScale(1.05);
        });

        playAgainButton.on('pointerout', () => {
            playAgainButton.setScale(1.0);
        });

        mainMenuButton.on('pointerdown', () => {
            this.goToMainMenu();
        });

        mainMenuButton.on('pointerover', () => {
            mainMenuButton.setScale(1.05);
        });

        mainMenuButton.on('pointerout', () => {
            mainMenuButton.setScale(1.0);
        });
    }

    playVictoryEffects() {
        this.cameras.main.flash(1000, 0, 255, 65, false);
        
        // Sparkle effect
        this.time.delayedCall(500, () => {
            for (let i = 0; i < 30; i++) {
                this.time.delayedCall(i * 100, () => {
                    const x = Phaser.Math.Between(100, 924);
                    const y = Phaser.Math.Between(100, 300);
                    
                    const spark = this.add.circle(x, y, 4, 0x00ff41);
                    
                    this.tweens.add({
                        targets: spark,
                        scaleX: 0,
                        scaleY: 0,
                        alpha: 0,
                        duration: 1500,
                        ease: 'Power2'
                    });
                });
            }
        });
    }

    startNewRun() {
        console.log('Starting new run...');
        
        this.cameras.main.fade(250, 0, 17, 34);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.gameManager.resetForNewGame();
            this.gameManager.setCurrentScene('CharacterSelectScene');
            this.scene.start('CharacterSelectScene');
        });
    }

    goToMainMenu() {
        console.log('Returning to main menu...');
        
        this.cameras.main.fade(250, 0, 17, 34);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.gameManager.resetForNewGame();
            this.gameManager.setCurrentScene('StartScene');
            this.scene.start('StartScene');
        });
    }
}