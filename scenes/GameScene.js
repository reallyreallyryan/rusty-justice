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
        
        // Green/Gear suit (complete set)
        for (let i = 0; i <= 10; i++) {
            this.load.image(`card_${i}_gear`, `assets/cards/green${i}.png`);
        }
        
        // Orange/Sun suit (complete set)
        for (let i = 0; i <= 10; i++) {
            this.load.image(`card_${i}_sun`, `assets/cards/orange${i}.png`);
        }
        
        // Purple/Bolt suit (complete set)
        for (let i = 0; i <= 10; i++) {
            this.load.image(`card_${i}_bolt`, `assets/cards/purple${i}.png`);
        }
        
        // Character cards
        this.load.image('character_rusty', 'assets/cards/bangbang.jpeg');
        
        // Boss cards - each boss has their unique card asset
        this.load.image('boss_nasa', 'assets/cards/nasa-gamecrafter.jpg');
        this.load.image('boss_scuzz_bucket', 'assets/cards/scuzz-bucket.jpeg');
        this.load.image('boss_pistol_plink', 'assets/cards/pistol-plink.jpeg');
        this.load.image('boss_piglet', 'assets/cards/piglet.jpeg');
        this.load.image('boss_null', 'assets/cards/null.jpeg');
        this.load.image('boss_wheeze', 'assets/cards/wheeze.jpeg');
        
        // Debug successful loads
        this.load.on('filecomplete', (key) => {
            if (key.startsWith('card_') || key.startsWith('character_') || key.startsWith('boss_')) {
                console.log(`✅ Loaded sprite: ${key}`);
            }
        });
        
        this.load.on('loaderror', (file) => {
            console.error('❌ Failed to load:', file.src);
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
        
        // Semi-transparent background for card area
        this.add.rectangle(512, 180, 700, 80, 0x000000, 0.5);
        
        this.add.text(512, 120, 'BOSS TABLE', {
            fontSize: '16px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const boss = this.battleManager.getBoss();
        
        // Boss character card display
        this.createBossCharacterCard();
        
        this.bossHPText = this.add.text(250, 140, `${boss.name} HP: ${boss.hp}`, {
            fontSize: '16px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        });

        // NEW: Show bust number!
        this.bossBustText = this.add.text(250, 160, `Busts at: ${boss.bustNumber}`, {
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

        // Boss score on the right side with background
        this.bossScoreBg = this.add.rectangle(850, 150, 120, 50, 0x000000, 0.7);
        this.bossScoreBg.setStrokeStyle(2, 0x00ff41);
        
        this.bossValueText = this.add.text(850, 150, '', {
            fontSize: '24px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.bossCardsContainer = this.add.container(512, 220);
    }

    createPlayerArea() {
        this.add.rectangle(512, 480, 800, 180, 0x220000).setStrokeStyle(2, 0x00ff41);
        
        // Semi-transparent background for card area
        this.add.rectangle(512, 520, 700, 80, 0x000000, 0.5);
        
        this.add.text(512, 400, 'PLAYER TABLE', {
            fontSize: '16px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const player = this.battleManager.getPlayer();
        
        // Player character card display
        this.createPlayerCharacterCard();
        
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

        // Player score on the right side with background
        this.playerScoreBg = this.add.rectangle(850, 540, 120, 50, 0x000000, 0.7);
        this.playerScoreBg.setStrokeStyle(2, 0x00ff41);
        
        this.playerValueText = this.add.text(850, 540, '', {
            fontSize: '24px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.playerCardsContainer = this.add.container(512, 500);

        this.createSidearmDisplay();
    }

    createBossCharacterCard() {
        // Container for boss character card - positioned horizontally next to boss info
        const cardX = 120;  // Positioned to the left to avoid overlapping boss HP text
        const cardY = 150;  // Aligned horizontally with boss name and HP
        
        // Background for character card - wider for rotated horizontal card
        const cardBg = this.add.rectangle(cardX, cardY, 140, 100, 0x220000, 0.8);
        cardBg.setStrokeStyle(2, 0x00ff41);
        
        // Boss character card - map boss name to image key
        const boss = this.battleManager.getBoss();
        const bossCardMap = {
            'NASA': 'boss_nasa',
            'SCUZZ BUCKET': 'boss_scuzz_bucket',
            'PISTOL PLINK': 'boss_pistol_plink',
            'PIGLET': 'boss_piglet',
            'NULL': 'boss_null',
            'WHEEZE': 'boss_wheeze'
        };
        
        const bossKey = bossCardMap[boss.name] || 'boss_nasa';
        if (this.textures.exists(bossKey)) {
            this.bossCharacterCard = this.add.image(cardX, cardY, bossKey);
            this.bossCharacterCard.setScale(0.15); // Original scale size
            this.bossCharacterCard.setRotation(Math.PI / 2); // Rotate 90 degrees clockwise
            this.bossCharacterCard.setDepth(1);
        }
    }
    
    createPlayerCharacterCard() {
        // Container for player character card
        const cardX = 120;
        const cardY = 520;
        
        // Background for character card
        const cardBg = this.add.rectangle(cardX, cardY, 100, 140, 0x000022, 0.8);
        cardBg.setStrokeStyle(2, 0x00ff41);
        
        // Player character card - get selected character data
        const playerData = this.gameManager.getPlayerData();
        const selectedCharacter = this.gameManager.getSelectedCharacter();
        
        const characterCardMap = {
            'bang_bang': 'character_bang_bang',
            'loco_motive': 'character_loco_motive',
            'tre_boujie': 'character_tre_boujie',
            'eight_mm': 'character_eight_mm',
            'crankshaft': 'character_crankshaft',
            'bashcan': 'character_bashcan'
        };
        
        const characterKey = characterCardMap[selectedCharacter?.id] || 'character_rusty';
        if (this.textures.exists(characterKey)) {
            this.playerCharacterCard = this.add.image(cardX, cardY, characterKey);
            this.playerCharacterCard.setScale(0.15); // Adjust scale to fit
            this.playerCharacterCard.setDepth(1);
        }
        
        // Character name - display selected character name
        const characterName = selectedCharacter?.name || 'UNKNOWN';
        this.add.text(cardX, cardY + 80, characterName, {
            fontSize: '12px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
    }
    
    createSidearmDisplay() {
        this.sidearmContainer = this.add.container(850, 430);
        
        const sidearmBg = this.add.rectangle(0, 0, 140, 160, 0x004400, 0.8);
        sidearmBg.setStrokeStyle(2, 0x00ff41);
        this.sidearmContainer.add(sidearmBg);

        this.sidearmTitle = this.add.text(0, -65, 'SIDEARM', {
            fontSize: '14px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.sidearmContainer.add(this.sidearmTitle);

        // Placeholder for card sprite
        this.sidearmCardSprite = null;

        this.sidearmStatusText = this.add.text(0, 60, '', {
            fontSize: '12px',
            fill: '#00aa33',
            fontFamily: 'Courier New',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        this.sidearmContainer.add(this.sidearmStatusText);
    }

    createControlArea() {
        this.betContainer = this.add.container(100, 650);
        
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

        this.dealButton = this.add.text(350, 700, 'DEAL', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.hitButton = this.add.text(450, 700, 'HIT', {
            ...buttonStyle,
            backgroundColor: '#ff6644'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.stayButton = this.add.text(550, 700, 'STAY', {
            ...buttonStyle,
            backgroundColor: '#4466ff'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.sidearmButton = this.add.text(680, 700, 'USE SIDEARM', {
            ...buttonStyle,
            backgroundColor: '#ffaa00'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.setupButtonEvents();
    }

    createBettingControls() {
        this.betUpButton = this.add.text(200, 630, '+1', {
            fontSize: '14px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            backgroundColor: '#003311',
            padding: { x: 10, y: 5 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.betDownButton = this.add.text(200, 670, '-1', {
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
        this.messageText = this.add.text(512, 320, 'Place your bet and click DEAL to start!', {
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
                // Clear all card sprites before new round
                this.clearAllCardSprites();
                
                this.battleManager.startNewRound();
                
                // Set bet to 1 for next round
                const nextBet = 1;
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
        console.log('Player HP:', this.battleManager.getPlayer().hp);
        
        // Calculate new bet
        let newBet = currentBet + amount;
        
        // Ensure bet stays within valid range
        if (newBet < minBet) {
            newBet = minBet;
        } else if (newBet > maxBet) {
            newBet = maxBet;
        }
        
        console.log('After adjustment - New bet:', newBet);
        
        this.battleManager.currentBet = newBet;
        this.updateBetDisplay(newBet);
        
        // Show betting constraints
        this.updateMessage(`Bet ${minBet}-${maxBet} chips`);
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
        
        // Also clear when starting new round
        if (hand.length === 0) {
            return;
        }
        
        // Create sprites for cards that have them
        hand.forEach((card, index) => {
            if (this.hasCardSprite(card)) {
                const imageKey = this.getCardImageKey(card);
                const baseX = 512;  // Center horizontally
                const baseY = owner === 'player' ? 520 : 180;  // Moved cards away from UI elements
                
                // Dynamic spacing based on number of cards
                const maxSpacing = 80;  // No overlap
                const minSpacing = 40;  // Some overlap for many cards
                const spacing = Math.min(maxSpacing, Math.max(minSpacing, 600 / hand.length));
                
                const offsetX = (index - (hand.length - 1) / 2) * spacing;
                
                const cardSprite = this.add.image(baseX + offsetX, baseY, imageKey);
                cardSprite.setScale(0.12); // Much smaller cards (12% of original 825x1125)
                cardSprite.setDepth(2 + index); // Higher depth for cards on the right
                
                this[`${owner}CardSprites`].push(cardSprite);
                
                console.log(`Displayed sprite for ${card.rank}${card.suit} at ${baseX + offsetX}, ${baseY} (scale: 0.12)`);
            }
        });
    }

    updateSidearmDisplay() {
        const player = this.battleManager.getPlayer();
        
        // Clear previous card sprite
        if (this.sidearmCardSprite) {
            this.sidearmCardSprite.destroy();
            this.sidearmCardSprite = null;
        }
        
        if (player.sidearm) {
            // Display card sprite if available
            if (this.hasCardSprite(player.sidearm)) {
                const imageKey = this.getCardImageKey(player.sidearm);
                this.sidearmCardSprite = this.add.image(850, 430, imageKey);
                this.sidearmCardSprite.setScale(0.10);
                this.sidearmCardSprite.setDepth(3);
                
                // Add glow effect if ready to use
                if (!player.sidearmUsed) {
                    this.tweens.add({
                        targets: this.sidearmCardSprite,
                        scaleX: 0.11,
                        scaleY: 0.11,
                        duration: 1000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
            
            this.sidearmStatusText.setText(player.sidearmUsed ? 'USED' : 'READY');
            this.sidearmStatusText.setFill(player.sidearmUsed ? '#aa0000' : '#00ff00');
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
            const minBet = this.battleManager.getMinBet();
            const maxBet = this.battleManager.getMaxBet();
            
            this.updateMessage(`Bet ${minBet}-${maxBet} chips`);
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
    
    // Clear all card sprites from the board
    clearAllCardSprites() {
        if (this.playerCardSprites) {
            this.playerCardSprites.forEach(sprite => sprite.destroy());
            this.playerCardSprites = [];
        }
        if (this.bossCardSprites) {
            this.bossCardSprites.forEach(sprite => sprite.destroy());
            this.bossCardSprites = [];
        }
    }
}