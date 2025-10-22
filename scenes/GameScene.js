class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        console.log('Loading your existing card sprites...');
        
        // Black/Skull suit (complete set)
        for (let i = 0; i <= 10; i++) {
            this.load.image(`card_${i}_skull`, `assets/cards/black${i}.png`);
        }
        
        // Green/Gear suit (partial set)
        this.load.image('card_0_gear', 'assets/cards/green0.png');
        this.load.image('card_1_gear', 'assets/cards/green1.png');
        this.load.image('card_10_gear', 'assets/cards/green10.png');
        
        // Debug successful loads
        this.load.on('filecomplete', (key) => {
            if (key.startsWith('card_')) {
                console.log(`✅ Loaded card sprite: ${key}`);
            }
        });
        
        this.load.on('loaderror', (file) => {
            console.error('❌ Failed to load card:', file.src);
        });
    }

    create() {
        this.cameras.main.setBackgroundColor('#001122');
        this.cameras.main.fadeIn(250, 0, 17, 34);
        
        
        this.gameManager = this.registry.get('gameManager');
        this.battleManager = new BattleManager(this, this.gameManager);
        
        this.createBackground();
        this.createUI();
        this.setupBattleEventListeners();
        
        this.battleManager.startNewRound();
        console.log('Battle scene initialized');
    }

    createBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x001122, 0.8);
        graphics.fillRect(0, 0, 1024, 768);
        
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(1, 2);
            
            const star = this.add.circle(x, y, size, 0x00ff41);
            star.setAlpha(0.3);
            
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1
            });
        }
    }

    createUI() {
        this.add.text(512, 50, 'RUSTY JUSTICE', {
            fontSize: '32px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#003311',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(512, 85, 'BLACKJACK SHOWDOWN', {
            fontSize: '14px',
            fill: '#00aa33',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.createBossArea();
        this.createPlayerArea();
        this.createControlArea();
        this.createStatusDisplay();
    }

    createBossArea() {
        this.add.rectangle(512, 200, 800, 180, 0x002200).setStrokeStyle(2, 0x00ff41);
        this.add.text(512, 120, 'BOSS TABLE', {
            fontSize: '16px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const boss = this.battleManager.getBoss();
        this.bossHPText = this.add.text(120, 130, `${boss.name} HP: ${boss.hp}`, {
            fontSize: '16px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        });

        // NEW: Show bust number!
        this.bossBustText = this.add.text(120, 150, `Busts at: ${boss.bustNumber}`, {
            fontSize: '14px',
            fill: '#ff4444',
            fontFamily: 'Courier New'
        });

        this.bossHandText = this.add.text(512, 160, '', {
            fontSize: '14px',
            fill: '#00aa33',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);

        this.bossValueText = this.add.text(512, 180, '', {
            fontSize: '18px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.bossCardsContainer = this.add.container(512, 220);
    }

    createPlayerArea() {
        this.add.rectangle(512, 480, 800, 180, 0x220000).setStrokeStyle(2, 0x00ff41);
        this.add.text(512, 400, 'PLAYER TABLE', {
            fontSize: '16px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const player = this.battleManager.getPlayer();
        this.playerHPText = this.add.text(120, 410, `HP: ${player.hp}`, {
            fontSize: '16px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        });

        this.playerHandText = this.add.text(512, 440, '', {
            fontSize: '14px',
            fill: '#00aa33',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);

        this.playerValueText = this.add.text(512, 460, '', {
            fontSize: '18px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.playerCardsContainer = this.add.container(512, 500);

        this.createSidearmDisplay();
    }

    createSidearmDisplay() {
        this.sidearmContainer = this.add.container(200, 520);
        
        const sidearmBg = this.add.rectangle(0, 0, 120, 80, 0x004400);
        sidearmBg.setStrokeStyle(2, 0x00ff41);
        this.sidearmContainer.add(sidearmBg);

        this.sidearmTitle = this.add.text(0, -30, 'SIDEARM', {
            fontSize: '12px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.sidearmContainer.add(this.sidearmTitle);

        this.sidearmCardText = this.add.text(0, 0, '', {
            fontSize: '16px',
            fill: '#ffff00',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.sidearmContainer.add(this.sidearmCardText);

        this.sidearmStatusText = this.add.text(0, 25, '', {
            fontSize: '10px',
            fill: '#00aa33',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.sidearmContainer.add(this.sidearmStatusText);
    }

    createControlArea() {
        this.betContainer = this.add.container(150, 650);
        
        this.betLabel = this.add.text(0, -30, 'CURRENT BET', {
            fontSize: '12px',
            fill: '#ffaa00',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.betContainer.add(this.betLabel);

        this.betAmountText = this.add.text(0, 0, '1', {
            fontSize: '20px',
            fill: '#ffff00',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.betContainer.add(this.betAmountText);

        this.createActionButtons();
        this.createBettingControls();
    }

    createActionButtons() {
        const buttonStyle = {
            fontSize: '16px',
            fill: '#001122',
            fontFamily: 'Courier New',
            backgroundColor: '#00ff41',
            padding: { x: 15, y: 8 }
        };

        this.dealButton = this.add.text(400, 650, 'DEAL', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.hitButton = this.add.text(500, 650, 'HIT', {
            ...buttonStyle,
            backgroundColor: '#ff6644'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.stayButton = this.add.text(600, 650, 'STAY', {
            ...buttonStyle,
            backgroundColor: '#4466ff'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.sidearmButton = this.add.text(700, 650, 'USE SIDEARM', {
            ...buttonStyle,
            backgroundColor: '#ffaa00'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.setupButtonEvents();
    }

    createBettingControls() {
        this.betUpButton = this.add.text(300, 630, '+1', {
            fontSize: '14px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            backgroundColor: '#003311',
            padding: { x: 10, y: 5 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.betDownButton = this.add.text(300, 670, '-1', {
            fontSize: '14px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            backgroundColor: '#331100',
            padding: { x: 10, y: 5 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.betUpButton.on('pointerdown', () => this.adjustBet(1));
        this.betDownButton.on('pointerdown', () => this.adjustBet(-1));
    }

    createStatusDisplay() {
        this.messageText = this.add.text(512, 350, 'Place your bet and click DEAL to start!', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Courier New',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        this.add.text(800, 730, 'Room: ' + this.gameManager.getSessionData().roomId.slice(-8), {
            fontSize: '10px',
            fill: '#007722',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
    }

    setupButtonEvents() {
        this.dealButton.on('pointerdown', () => this.handleDeal());
        this.hitButton.on('pointerdown', () => this.handleHit());
        this.stayButton.on('pointerdown', () => this.handleStay());
        this.sidearmButton.on('pointerdown', () => this.handleSidearm());

        [this.dealButton, this.hitButton, this.stayButton, this.sidearmButton].forEach(button => {
            button.on('pointerover', () => button.setScale(1.05));
            button.on('pointerout', () => button.setScale(1.0));
        });
    }

    setupBattleEventListeners() {
        this.battleManager.on('betPlaced', (amount) => {
            this.updateMessage(`Bet placed: ${amount} chips. Cards dealt!`);
            this.updateBetDisplay(amount);
        });

        this.battleManager.on('cardsDealt', () => {
            this.updateHandDisplays();
            this.updateSidearmDisplay();
            this.updateButtonStates();
        });

        this.battleManager.on('playerHit', (card) => {
            this.updateMessage(`Drew: ${card.rank}${card.suit}`);
            this.updateHandDisplays();
        });

        this.battleManager.on('sidearmUsed', (card) => {
            this.updateMessage(`Sidearm used: ${card.rank}${card.suit}`);
            this.updateHandDisplays();
            this.updateSidearmDisplay();
        });

        this.battleManager.on('playerBusted', () => {
            this.updateMessage('BUST! You went over 21!');
        });

        this.battleManager.on('playerStayed', () => {
            this.updateMessage('You stayed. Boss\'s turn...');
        });

        this.battleManager.on('bossHit', (card) => {
            this.updateMessage(`Boss drew: ${card.rank}${card.suit}`);
            this.updateHandDisplays();
        });

        this.battleManager.on('roundResolved', (result) => {
            this.handleRoundResult(result);
        });

        this.battleManager.on('readyForNewRound', () => {
            this.time.delayedCall(2000, () => {
                this.battleManager.startNewRound();
                
                // Set bet to minimum for next round
                const nextRoundMin = Math.max(1, this.battleManager.roundNumber + 1);
                const playerHP = this.battleManager.getPlayer().hp;
                const nextBet = Math.min(nextRoundMin, playerHP);
                this.battleManager.currentBet = nextBet;
                this.updateBetDisplay(nextBet);
                
                this.updateButtonStates();
            });
        });
    }

    handleDeal() {
        const currentBet = this.battleManager.getCurrentBet();
        const success = this.battleManager.placeBet(currentBet);
        
        if (!success) {
            this.updateMessage('Cannot place bet! Check your HP and bet amount.');
        }
    }

    handleHit() {
        this.battleManager.playerHit();
    }

    handleStay() {
        this.battleManager.playerStay();
    }

    handleSidearm() {
        const success = this.battleManager.playerUseSidearm();
        if (!success) {
            this.updateMessage('Sidearm not available or already used!');
        }
    }

    adjustBet(amount) {
        if (this.battleManager.getBattleState() !== 'betting') return;
        
        const currentBet = this.battleManager.getCurrentBet();
        const minBet = this.battleManager.getMinBet();
        const maxBet = this.battleManager.getMaxBet();
        
        console.log('Before adjust - Current:', currentBet, 'Min:', minBet, 'Max:', maxBet, 'Amount:', amount);
        
        // Calculate new bet
        let newBet = currentBet + amount;
        
        // Clamp to valid range
        newBet = Phaser.Math.Clamp(newBet, minBet, maxBet);
        
        console.log('After clamp - New bet:', newBet);
        
        this.battleManager.currentBet = newBet;
        this.updateBetDisplay(newBet);
        
        // Show betting constraints
        const roundNum = this.battleManager.roundNumber + 1; // +1 because round increments on bet
        this.updateMessage(`Round ${roundNum}: Bet ${minBet}-${maxBet} chips`);
    }

    updateHandDisplays() {
        const player = this.battleManager.getPlayer();
        const boss = this.battleManager.getBoss();
        
        // Update text displays (hybrid system)
        this.playerHandText.setText(this.formatHandWithSprites(player.hand));
        this.playerValueText.setText(`Value: ${this.battleManager.getPlayerHandValue()}`);
        
        this.bossHandText.setText(this.formatHandWithSprites(boss.hand));
        this.bossValueText.setText(`Value: ${this.battleManager.getBossHandValue()}`);
        
        this.playerHPText.setText(`HP: ${player.hp}`);
        this.bossHPText.setText(`${boss.name} HP: ${boss.hp}`);
        
        // Display card sprites (for testing)
        this.displayCardSprites(player.hand, 'player');
        this.displayCardSprites(boss.hand, 'boss');
    }
    
    formatHandWithSprites(hand) {
        return hand.map(card => {
            if (this.hasCardSprite(card)) {
                return `[${card.rank}${card.suit}]`; // Mark cards with sprites
            } else {
                return `${card.rank}${card.suit}`;
            }
        }).join(' ');
    }
    
    displayCardSprites(hand, owner) {
        // Clear existing sprites for this hand
        if (this[`${owner}CardSprites`]) {
            this[`${owner}CardSprites`].forEach(sprite => sprite.destroy());
        }
        this[`${owner}CardSprites`] = [];
        
        // Create sprites for cards that have them
        hand.forEach((card, index) => {
            if (this.hasCardSprite(card)) {
                const imageKey = this.getCardImageKey(card);
                const baseX = owner === 'player' ? 400 : 400;  // Center horizontally
                const baseY = owner === 'player' ? 580 : 120;  // Player bottom, boss top
                const offsetX = (index - (hand.length - 1) / 2) * 60; // Center spread
                
                const cardSprite = this.add.image(baseX + offsetX, baseY, imageKey);
                cardSprite.setScale(0.25); // Much smaller cards
                cardSprite.setDepth(2); // Above other UI elements
                
                this[`${owner}CardSprites`].push(cardSprite);
                
                console.log(`Displayed sprite for ${card.rank}${card.suit} at ${baseX + offsetX}, ${baseY} (scale: 0.25)`);
            }
        });
    }

    updateSidearmDisplay() {
        const player = this.battleManager.getPlayer();
        
        if (player.sidearm) {
            this.sidearmCardText.setText(`${player.sidearm.rank}${player.sidearm.suit}`);
            this.sidearmStatusText.setText(player.sidearmUsed ? 'USED' : 'READY');
        }
    }

    updateBetDisplay(amount) {
        this.betAmountText.setText(amount.toString());
    }

    updateButtonStates() {
        const battleState = this.battleManager.getBattleState();
        
        this.dealButton.setVisible(battleState === 'betting');
        this.hitButton.setVisible(battleState === 'playerTurn');
        this.stayButton.setVisible(battleState === 'playerTurn');
        this.sidearmButton.setVisible(battleState === 'playerTurn' && this.battleManager.canPlayerUseSidearm());
        
        this.betUpButton.setVisible(battleState === 'betting');
        this.betDownButton.setVisible(battleState === 'betting');
        
        // Show betting constraints when in betting phase
        if (battleState === 'betting') {
            const roundNum = this.battleManager.roundNumber + 1;
            const minBet = this.battleManager.getMinBet();
            const maxBet = this.battleManager.getMaxBet();
            const player = this.battleManager.getPlayer();
            
            if (player.hp < roundNum) {
                this.updateMessage(`Round ${roundNum}: Must go ALL-IN with ${player.hp} chips!`);
            } else {
                this.updateMessage(`Round ${roundNum}: Bet ${minBet}-${maxBet} chips`);
            }
        }
    }

    handleRoundResult(result) {
        let message = '';
        
        switch (result.result) {
            case 'playerWin':
                message = `You win! Boss takes ${result.bossDamage} damage.`;
                break;
            case 'bossWin':
                message = `Boss wins! You take ${result.playerDamage} damage.`;
                break;
            case 'tie':
                message = 'It\'s a tie! No damage dealt.';
                break;
        }
        
        this.updateMessage(message);
        this.updateHandDisplays();
    }

    updateMessage(text) {
        this.messageText.setText(text);
        
        this.tweens.add({
            targets: this.messageText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }

    formatHand(hand) {
        return hand.map(card => `${card.rank}${card.suit}`).join(' ');
    }
    
    // Helper method to get card color for future sprite system
    getCardColor(card) {
        return card.color || '#ffffff';
    }
    
    // Map card object to sprite image key
    getCardImageKey(card) {
        const suitNames = {
            '💀': 'skull',  // black cards
            '⚙': 'gear',   // green cards  
            '☀': 'sun',    // orange cards
            '⚡': 'bolt'   // purple cards
        };
        const key = `card_${card.rank}_${suitNames[card.suit]}`;
        console.log(`Generated key for ${card.rank}${card.suit}: ${key}`);
        return key;
    }
    
    // Check if sprite exists for this card
    hasCardSprite(card) {
        const imageKey = this.getCardImageKey(card);
        const exists = this.textures.exists(imageKey);
        console.log(`Checking sprite ${imageKey}: ${exists ? '✅ exists' : '❌ missing'}`);
        return exists;
    }
}