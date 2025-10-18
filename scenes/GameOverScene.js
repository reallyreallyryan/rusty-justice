class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#221100');
        this.cameras.main.fadeIn(500, 34, 17, 0);
        
        this.gameManager = this.registry.get('gameManager');
        this.playerData = this.gameManager.getPlayerData();
        this.battleData = this.gameManager.getBattleData();
        
        this.createBackground();
        this.createGameOverDisplay();
        this.createStatsDisplay();
        this.createActionButtons();
        
        this.playGameOverEffects();
    }

    createBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x330000, 0.4);
        graphics.fillRect(0, 0, 1024, 768);
        
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(1, 3);
            
            const ember = this.add.circle(x, y, size, 0xff4444);
            ember.setAlpha(Phaser.Math.FloatBetween(0.3, 0.7));
            
            this.tweens.add({
                targets: ember,
                y: y + Phaser.Math.Between(50, 150),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Power2',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    createGameOverDisplay() {
        this.add.text(512, 120, 'JUSTICE DENIED', {
            fontSize: '48px',
            fill: '#ff4444',
            fontFamily: 'Courier New',
            stroke: '#331100',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(512, 180, 'The frontier claims another soul', {
            fontSize: '18px',
            fill: '#aa3322',
            fontFamily: 'Courier New',
            style: { fontStyle: 'italic' }
        }).setOrigin(0.5);

        const bossName = this.battleData.currentBoss ? this.battleData.currentBoss.name : 'Unknown Boss';
        this.add.text(512, 220, `${bossName} has proven superior`, {
            fontSize: '20px',
            fill: '#ff4444',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const gameOverIcon = this.add.text(512, 280, '💀', {
            fontSize: '60px'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: gameOverIcon,
            alpha: 0.3,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createStatsDisplay() {
        const statsContainer = this.add.container(512, 400);
        
        const statsBorder = this.add.rectangle(0, 0, 600, 200, 0x110000);
        statsBorder.setStrokeStyle(2, 0xff4444);
        statsContainer.add(statsBorder);

        const titleText = this.add.text(0, -80, 'FINAL MOMENTS', {
            fontSize: '20px',
            fill: '#ff4444',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        statsContainer.add(titleText);

        const character = this.gameManager.getSelectedCharacter();
        const characterName = character ? character.name : 'Unknown';

        const leftStats = this.add.text(-200, -20, 
            `GUNSLINGER: ${characterName}\n` +
            `Final HP: ${this.playerData.hp}/${this.playerData.maxHP}\n` +
            `Rounds Won: ${this.battleData.roundsWon}\n` +
            `Total Victories: ${this.playerData.gamesWon}`, {
            fontSize: '14px',
            fill: '#aa3322',
            fontFamily: 'Courier New',
            align: 'left'
        });
        statsContainer.add(leftStats);

        const bossName = this.battleData.currentBoss ? this.battleData.currentBoss.name : 'Unknown Boss';
        const bossHP = this.battleData.currentBoss ? this.battleData.currentBoss.hp : 0;
        
        const rightStats = this.add.text(200, -20,
            `BOSS: ${bossName}\n` +
            `Remaining HP: ${bossHP}\n` +
            `Difficulty: ${this.battleData.currentBoss ? this.battleData.currentBoss.difficulty : 1}\n` +
            `Status: VICTORIOUS`, {
            fontSize: '14px',
            fill: '#aa3322',
            fontFamily: 'Courier New',
            align: 'right'
        }).setOrigin(1, 0);
        statsContainer.add(rightStats);

        const causeText = this.add.text(0, 60, 
            this.determineCauseOfDeath(), {
            fontSize: '16px',
            fill: '#ffaa44',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        statsContainer.add(causeText);
    }

    createActionButtons() {
        const tryAgainButton = this.add.text(350, 600, 'TRY AGAIN', {
            fontSize: '20px',
            fill: '#221100',
            fontFamily: 'Courier New',
            backgroundColor: '#ff6644',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        const mainMenuButton = this.add.text(674, 600, 'MAIN MENU', {
            fontSize: '20px',
            fill: '#ff4444',
            fontFamily: 'Courier New',
            backgroundColor: '#331100',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        tryAgainButton.on('pointerdown', () => {
            this.tryAgain();
        });

        tryAgainButton.on('pointerover', () => {
            tryAgainButton.setScale(1.05);
        });

        tryAgainButton.on('pointerout', () => {
            tryAgainButton.setScale(1.0);
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
            fill: '#773322',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown', () => {
            this.tryAgain();
        });
    }

    playGameOverEffects() {
        this.sound.play('gameOver', { volume: 0.8 }).catch(() => {});
        
        this.cameras.main.shake(500, 0.02);
        
        this.time.delayedCall(300, () => {
            this.cameras.main.flash(200, 255, 68, 68, false);
        });
    }

    determineCauseOfDeath() {
        if (this.playerData.hp <= 0) {
            return '⚰️ CAUSE: HP DEPLETED\n"Bet too much, lost everything"';
        } else if (this.battleData.currentBoss && this.battleData.currentBoss.hp > 0) {
            return '🃏 CAUSE: OUTPLAYED\n"The cards weren\'t in your favor"';
        } else {
            return '💔 CAUSE: UNKNOWN\n"The frontier is unforgiving"';
        }
    }

    tryAgain() {
        console.log('Trying again...');
        this.sound.play('buttonClick', { volume: 0.5 }).catch(() => {});
        
        this.cameras.main.fade(250, 34, 17, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.gameManager.resetForNewGame();
            this.gameManager.setCurrentScene('CharacterSelectScene');
            this.scene.start('CharacterSelectScene');
        });
    }

    goToMainMenu() {
        console.log('Returning to main menu...');
        this.sound.play('buttonClick', { volume: 0.5 }).catch(() => {});
        
        this.cameras.main.fade(250, 34, 17, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.gameManager.resetForNewGame();
            this.gameManager.setCurrentScene('StartScene');
            this.scene.start('StartScene');
        });
    }
}