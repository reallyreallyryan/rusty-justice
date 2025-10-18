class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#001122');
        
        this.gameManager = this.registry.get('gameManager');
        
        this.createBackground();
        this.createTitle();
        this.createMenuUI();
        this.createFooterInfo();
        
        this.gameManager.initializeGameSession();
        console.log('StartScene created - Room ID:', this.gameManager.getSessionData().roomId);
    }

    createBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x003311, 0.3);
        graphics.fillRect(0, 0, 1024, 768);
        
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.8);
            
            const star = this.add.circle(x, y, size, 0x00ff41);
            star.setAlpha(alpha);
            
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createTitle() {
        this.add.text(512, 150, 'RUSTY JUSTICE', {
            fontSize: '48px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#003311',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(512, 200, 'CYBER FRONTIER BLACKJACK', {
            fontSize: '18px',
            fill: '#00aa33',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const subtitle = this.add.text(512, 240, 'Where every bet could be your last', {
            fontSize: '14px',
            fill: '#007722',
            fontFamily: 'Courier New',
            style: { fontStyle: 'italic' }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: subtitle,
            alpha: 0.5,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createMenuUI() {
        const buttonStyle = {
            fontSize: '24px',
            fill: '#001122',
            fontFamily: 'Courier New',
            backgroundColor: '#00ff41',
            padding: { x: 20, y: 10 }
        };

        const startButton = this.add.text(512, 350, 'START GAME', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const continueButton = this.add.text(512, 420, 'CONTINUE', {
            ...buttonStyle,
            fill: '#003311',
            backgroundColor: '#007722'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const settingsButton = this.add.text(512, 490, 'SETTINGS', {
            ...buttonStyle,
            fill: '#003311',
            backgroundColor: '#005511'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', () => {
            this.handleStartGame();
        });

        startButton.on('pointerover', () => {
            startButton.setScale(1.1);
            this.sound.play('buttonHover', { volume: 0.3 }).catch(() => {});
        });

        startButton.on('pointerout', () => {
            startButton.setScale(1.0);
        });

        continueButton.on('pointerdown', () => {
            this.handleContinueGame();
        });

        continueButton.on('pointerover', () => {
            continueButton.setScale(1.1);
        });

        continueButton.on('pointerout', () => {
            continueButton.setScale(1.0);
        });

        settingsButton.on('pointerdown', () => {
            this.handleSettings();
        });

        settingsButton.on('pointerover', () => {
            settingsButton.setScale(1.1);
        });

        settingsButton.on('pointerout', () => {
            settingsButton.setScale(1.0);
        });

        if (!this.hasExistingGame()) {
            continueButton.setAlpha(0.5);
            continueButton.disableInteractive();
        }
    }

    createFooterInfo() {
        const sessionData = this.gameManager.getSessionData();
        
        this.add.text(512, 650, `Room: ${sessionData.roomId}`, {
            fontSize: '12px',
            fill: '#007722',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.add.text(512, 670, 'Ready for future multiplayer expansion', {
            fontSize: '10px',
            fill: '#005511',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.add.text(512, 720, 'v1.0.0 - Built with Phaser 3', {
            fontSize: '10px',
            fill: '#003311',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
    }

    handleStartGame() {
        console.log('Starting new game...');
        this.sound.play('buttonClick', { volume: 0.5 }).catch(() => {});
        
        this.cameras.main.fade(250, 0, 17, 34);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.gameManager.setCurrentScene('CharacterSelectScene');
            this.scene.start('CharacterSelectScene');
        });
    }

    handleContinueGame() {
        if (this.hasExistingGame()) {
            console.log('Continuing existing game...');
            this.sound.play('buttonClick', { volume: 0.5 }).catch(() => {});
            
            this.cameras.main.fade(250, 0, 17, 34);
            
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.gameManager.setCurrentScene('GameScene');
                this.scene.start('GameScene');
            });
        }
    }

    handleSettings() {
        console.log('Settings menu not implemented yet');
        this.showTemporaryMessage('Settings menu coming soon!');
    }

    hasExistingGame() {
        const playerData = this.gameManager.getPlayerData();
        return playerData.gamesWon > 0 || playerData.gamesLost > 0;
    }

    showTemporaryMessage(message) {
        const messageText = this.add.text(512, 560, message, {
            fontSize: '16px',
            fill: '#ffaa00',
            fontFamily: 'Courier New',
            backgroundColor: '#001122',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: messageText,
            alpha: 0,
            y: messageText.y - 30,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                messageText.destroy();
            }
        });
    }
}