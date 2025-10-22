class IntermissionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntermissionScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#001122');
        this.cameras.main.fadeIn(500, 0, 17, 34);
        
        this.gameManager = this.registry.get('gameManager');
        this.playerData = this.gameManager.getPlayerData();
        this.runProgress = this.gameManager.getRunProgress();
        
        this.createBackground();
        this.createProgressDisplay();
        this.createPlayerStatus();
        this.createNextBossPreview();
        this.createContinueButton();
    }

    createBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x002211, 0.5);
        graphics.fillRect(0, 0, 1024, 768);
        
        // Animated stars
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(1, 2);
            
            const star = this.add.circle(x, y, size, 0x00ff41);
            star.setAlpha(0.4);
            
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1
            });
        }
    }

    createProgressDisplay() {
        this.add.text(512, 80, 'SLUG DELETED', {
            fontSize: '42px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#003311',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(512, 130, `Progress: ${this.runProgress.current} / ${this.runProgress.total}`, {
            fontSize: '18px',
            fill: '#00aa33',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Progress bar
        const barWidth = 600;
        const barHeight = 30;
        const progress = this.runProgress.current / this.runProgress.total;
        
        const barBg = this.add.rectangle(512, 170, barWidth, barHeight, 0x003311);
        barBg.setStrokeStyle(2, 0x00ff41);
        
        const barFill = this.add.rectangle(
            512 - (barWidth / 2) + (barWidth * progress / 2), 
            170, 
            barWidth * progress, 
            barHeight - 4, 
            0x00ff41
        );
    }

    createPlayerStatus() {
        const statusContainer = this.add.container(512, 280);
        
        const statusBorder = this.add.rectangle(0, 0, 500, 120, 0x001100);
        statusBorder.setStrokeStyle(2, 0x00ff41);
        statusContainer.add(statusBorder);

        const title = this.add.text(0, -40, 'JAK STATUS', {
            fontSize: '18px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        statusContainer.add(title);

        const hpText = this.add.text(0, 0, `HP: ${this.playerData.hp} / ${this.playerData.maxHP}`, {
            fontSize: '24px',
            fill: this.playerData.hp > 10 ? '#00ff41' : '#ff4444',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        statusContainer.add(hpText);

        const warningText = this.add.text(0, 35, 
            this.playerData.hp <= 10 ? '⚠️ LOW HP - NO HEALING AVAILABLE' : 'Ready to continue', {
            fontSize: '12px',
            fill: this.playerData.hp <= 10 ? '#ff4444' : '#00aa33',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        statusContainer.add(warningText);
    }

    createNextBossPreview() {
        const nextBoss = this.gameManager.advanceToNextBoss();
        
        if (!nextBoss) return;

        const previewContainer = this.add.container(512, 450);
        
        const previewBorder = this.add.rectangle(0, 0, 600, 180, 0x110000);
        previewBorder.setStrokeStyle(3, 0xff4444);
        previewContainer.add(previewBorder);

        const title = this.add.text(0, -70, 'NEXT SLUG DETECTED', {
            fontSize: '20px',
            fill: '#ff4444',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        previewContainer.add(title);

        const bossIcon = this.add.text(-200, 0, nextBoss.icon || '💀', {
            fontSize: '60px'
        }).setOrigin(0.5);
        previewContainer.add(bossIcon);

        const bossInfo = this.add.text(50, -20, 
            `${nextBoss.name}\n` +
            `HP: ${nextBoss.hp}\n` +
            `Bust Number: ${nextBoss.bustNumber}\n` +
            `Base Bet: ${nextBoss.baseBet}`, {
            fontSize: '16px',
            fill: '#ff4444',
            fontFamily: 'Courier New',
            align: 'left'
        });
        previewContainer.add(bossInfo);

        const description = this.add.text(0, 60, nextBoss.description, {
            fontSize: '12px',
            fill: '#aa3322',
            fontFamily: 'Courier New',
            style: { fontStyle: 'italic' }
        }).setOrigin(0.5);
        previewContainer.add(description);

        // Pulse effect
        this.tweens.add({
            targets: previewBorder,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    createContinueButton() {
        const continueButton = this.add.text(512, 650, 'CONTINUE RUN', {
            fontSize: '24px',
            fill: '#001122',
            fontFamily: 'Courier New',
            backgroundColor: '#00ff41',
            padding: { x: 30, y: 12 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        continueButton.on('pointerdown', () => {
            this.continueRun();
        });

        continueButton.on('pointerover', () => {
            continueButton.setScale(1.05);
        });

        continueButton.on('pointerout', () => {
            continueButton.setScale(1.0);
        });

        // Pulse animation
        this.tweens.add({
            targets: continueButton,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(512, 710, 'Press any key to continue...', {
            fontSize: '12px',
            fill: '#007722',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown', () => {
            this.continueRun();
        });
    }

    continueRun() {
        console.log('Continuing run to next boss...');
        
        this.cameras.main.fade(250, 0, 17, 34);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.gameManager.setCurrentScene('GameScene');
            this.scene.start('GameScene');
        });
    }
}