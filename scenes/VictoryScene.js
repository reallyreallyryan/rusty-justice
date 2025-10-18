class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#001122');
        this.cameras.main.fadeIn(500, 0, 17, 34);
        
        this.gameManager = this.registry.get('gameManager');
        this.playerData = this.gameManager.getPlayerData();
        this.battleData = this.gameManager.getBattleData();
        
        this.createBackground();
        this.createVictoryDisplay();
        this.createStatsDisplay();
        this.createActionButtons();
        
        this.playVictoryEffects();
    }

    createBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x003300, 0.4);
        graphics.fillRect(0, 0, 1024, 768);
        
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(2, 4);
            
            const particle = this.add.circle(x, y, size, 0x00ff41);
            particle.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
            
            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(50, 150),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Power2',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    createVictoryDisplay() {
        this.add.text(512, 120, 'JUSTICE SERVED', {
            fontSize: '48px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#003311',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(512, 180, 'The cyber frontier is a little safer today', {
            fontSize: '18px',
            fill: '#00aa33',
            fontFamily: 'Courier New',
            style: { fontStyle: 'italic' }
        }).setOrigin(0.5);

        const bossName = this.battleData.currentBoss ? this.battleData.currentBoss.name : 'Unknown Boss';
        this.add.text(512, 220, `${bossName} has been defeated!`, {
            fontSize: '20px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const victoryIcon = this.add.text(512, 280, '⭐', {
            fontSize: '60px'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: victoryIcon,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createStatsDisplay() {
        const statsContainer = this.add.container(512, 400);
        
        const statsBorder = this.add.rectangle(0, 0, 600, 200, 0x001100);
        statsBorder.setStrokeStyle(2, 0x00ff41);
        statsContainer.add(statsBorder);

        const titleText = this.add.text(0, -80, 'BATTLE SUMMARY', {
            fontSize: '20px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        statsContainer.add(titleText);

        const character = this.gameManager.getSelectedCharacter();
        const characterName = character ? character.name : 'Unknown';

        const leftStats = this.add.text(-200, -20, 
            `GUNSLINGER: ${characterName}\n` +
            `HP Remaining: ${this.playerData.hp}/${this.playerData.maxHP}\n` +
            `Rounds Won: ${this.battleData.roundsWon}\n` +
            `Total Victories: ${this.playerData.gamesWon}`, {
            fontSize: '14px',
            fill: '#00aa33',
            fontFamily: 'Courier New',
            align: 'left'
        });
        statsContainer.add(leftStats);

        const rightStats = this.add.text(200, -20,
            `BOSS: ${bossName}\n` +
            `Final Boss HP: 0\n` +
            `Difficulty: ${this.battleData.currentBoss ? this.battleData.currentBoss.difficulty : 1}\n` +
            `Status: DEFEATED`, {
            fontSize: '14px',
            fill: '#00aa33',
            fontFamily: 'Courier New',
            align: 'right'
        }).setOrigin(1, 0);
        statsContainer.add(rightStats);

        const rewardText = this.add.text(0, 60, 
            `🏆 REWARD: Experience Gained\n` +
            `💰 Reputation Increased`, {
            fontSize: '16px',
            fill: '#ffaa00',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        statsContainer.add(rewardText);
    }

    createActionButtons() {
        const playAgainButton = this.add.text(350, 600, 'PLAY AGAIN', {
            fontSize: '20px',
            fill: '#001122',
            fontFamily: 'Courier New',
            backgroundColor: '#00ff41',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        const mainMenuButton = this.add.text(674, 600, 'MAIN MENU', {
            fontSize: '20px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            backgroundColor: '#003311',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        playAgainButton.on('pointerdown', () => {
            this.playAgain();
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

        this.add.text(512, 680, 'Press any key to continue...', {
            fontSize: '12px',
            fill: '#007722',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown', () => {
            this.playAgain();
        });
    }

    playVictoryEffects() {
        this.sound.play('victory', { volume: 0.8 }).catch(() => {});
        
        this.cameras.main.flash(500, 0, 255, 65, false);
        
        this.time.delayedCall(500, () => {
            for (let i = 0; i < 20; i++) {
                this.time.delayedCall(i * 100, () => {
                    const x = Phaser.Math.Between(100, 924);
                    const y = Phaser.Math.Between(100, 200);
                    
                    const spark = this.add.circle(x, y, 3, 0x00ff41);
                    
                    this.tweens.add({
                        targets: spark,
                        scaleX: 0,
                        scaleY: 0,
                        alpha: 0,
                        duration: 1000,
                        ease: 'Power2'
                    });
                });
            }
        });
    }

    playAgain() {
        console.log('Starting new game...');
        this.sound.play('buttonClick', { volume: 0.5 }).catch(() => {});
        
        this.cameras.main.fade(250, 0, 17, 34);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.gameManager.resetForNewGame();
            this.gameManager.setCurrentScene('CharacterSelectScene');
            this.scene.start('CharacterSelectScene');
        });
    }

    goToMainMenu() {
        console.log('Returning to main menu...');
        this.sound.play('buttonClick', { volume: 0.5 }).catch(() => {});
        
        this.cameras.main.fade(250, 0, 17, 34);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.gameManager.resetForNewGame();
            this.gameManager.setCurrentScene('StartScene');
            this.scene.start('StartScene');
        });
    }
}