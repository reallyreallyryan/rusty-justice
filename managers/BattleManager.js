class BattleManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.blackjackLogic = new BlackjackLogic();
        this.deck = new Deck();
        
        this.battleState = 'inactive';
        this.currentBet = 1;
        this.minBet = 1;
        this.maxBet = 6;
        this.roundNumber = 0; // Track current round
        
        this.player = null;
        this.boss = null;
        
        this.eventBus = new Phaser.Events.EventEmitter();
        
        this.initializeBattle();
    }
    
    initializeBattle() {
        const playerData = this.gameManager.getPlayerData();
        const battleData = this.gameManager.getBattleData();
        
        this.player = new Player(this.scene, playerData.hp);
        
        if (battleData.currentBoss) {
            // Create boss with custom bust number!
            this.boss = new Boss(
                this.scene, 
                battleData.currentBoss.hp,
                battleData.currentBoss.bustNumber, // Pass bust number!
                battleData.currentBoss.stayNumber  // Pass stay number!
            );
            this.boss.name = battleData.currentBoss.name;
            this.boss.currentBet = 1; // Start at 1 chip for round 1
        } else {
            this.gameManager.startRun();
            const bossData = this.gameManager.getBattleData().currentBoss;
            this.boss = new Boss(
                this.scene, 
                bossData.hp,
                bossData.bustNumber,
                bossData.stayNumber
            );
            this.boss.name = bossData.name;
            this.boss.currentBet = 1; // Start at 1 chip for round 1
        }
        
        this.currentBet = battleData.currentBet || 1;
        this.battleState = 'betting';
        this.roundNumber = 0; // Reset round counter for new battle
        
        console.log('Battle initialized:', {
            playerHP: this.player.hp,
            bossHP: this.boss.hp,
            bossName: this.boss.name,
            bustNumber: this.boss.bustNumber, // NEW!
            currentBet: this.currentBet
        });
    }
    
    startNewRound() {
        this.player.clearHand();
        this.boss.clearHand();
        this.deck.shuffle();
        
        this.player.setSidearm(this.deck.drawCard());
        
        this.battleState = 'betting';
        this.eventBus.emit('roundStarted');
        
        console.log('New round started');
    }
    
    placeBet(amount) {
        if (this.battleState !== 'betting') {
            console.warn('Cannot place bet - not in betting phase');
            return false;
        }
        
        // Increment round at the start of each new round
        this.roundNumber++;
        
        // Calculate dynamic min bet based on round
        const dynamicMinBet = this.roundNumber;
        
        // If player has fewer chips than round number, must go all-in
        if (this.player.hp < dynamicMinBet) {
            amount = this.player.hp; // Force all-in
            console.log(`Round ${this.roundNumber}: Player forced all-in with ${amount} chips`);
        } else {
            // Normal betting validation
            if (amount < dynamicMinBet || amount > this.maxBet) {
                console.warn(`Bet must be between ${dynamicMinBet} and ${this.maxBet}, got:`, amount);
                return false;
            }
            
            if (amount > this.player.hp) {
                console.warn('Cannot bet more than current HP');
                return false;
            }
        }
        
        // Update boss bet based on round number
        this.boss.currentBet = this.roundNumber;
        
        this.currentBet = amount;
        this.battleState = 'dealing';
        
        this.dealInitialCards();
        this.eventBus.emit('betPlaced', amount);
        
        return true;
    }
    
    dealInitialCards() {
        this.player.addCard(this.deck.drawCard());
        this.boss.addCard(this.deck.drawCard());
        this.player.addCard(this.deck.drawCard());
        this.boss.addCard(this.deck.drawCard());
        
        this.battleState = 'playerTurn';
        this.eventBus.emit('cardsDealt');
        
        console.log('Initial cards dealt');
        this.logHandValues();
    }
    
    playerHit() {
        if (this.battleState !== 'playerTurn') {
            console.warn('Cannot hit - not player turn');
            return false;
        }
        
        const card = this.deck.drawCard();
        this.player.addCard(card);
        
        this.eventBus.emit('playerHit', card);
        
        if (this.blackjackLogic.isBust(this.player.hand)) {
            this.handlePlayerBust();
        }
        
        this.logHandValues();
        return true;
    }
    
    playerUseSidearm() {
        if (this.battleState !== 'playerTurn') {
            console.warn('Cannot use sidearm - not player turn');
            return false;
        }
        
        const sidearmCard = this.player.useSidearm();
        if (!sidearmCard) {
            console.warn('No sidearm available or already used');
            return false;
        }
        
        this.eventBus.emit('sidearmUsed', sidearmCard);
        
        if (this.blackjackLogic.isBust(this.player.hand)) {
            this.handlePlayerBust();
        }
        
        this.logHandValues();
        return true;
    }
    
    playerStay() {
        if (this.battleState !== 'playerTurn') {
            console.warn('Cannot stay - not player turn');
            return false;
        }
        
        this.battleState = 'bossTurn';
        this.eventBus.emit('playerStayed');
        
        this.executeBossTurn();
        return true;
    }
    
    executeBossTurn() {
        if (this.battleState !== 'bossTurn') return;
        
        while (this.boss.shouldHit()) {
            const card = this.deck.drawCard();
            this.boss.addCard(card);
            this.eventBus.emit('bossHit', card);
            
            if (this.boss.isBust()) { // Use boss's custom bust check!
                break;
            }
        }
        
        this.eventBus.emit('bossFinished');
        this.resolveRound();
    }
    
    resolveRound() {
        const playerValue = this.blackjackLogic.calculateHandValue(this.player.hand);
        const bossValue = this.blackjackLogic.calculateHandValue(this.boss.hand);
        
        const playerBust = this.blackjackLogic.isBust(this.player.hand);
        const bossBust = this.boss.isBust(); // Use boss's custom bust check!
        
        let result = 'tie';
        let playerDamage = 0;
        let bossDamage = 0;
        
        if (playerBust && bossBust) {
            result = 'tie';
            // Both bust - each takes damage from both bets
            playerDamage = this.currentBet + this.boss.currentBet;
            bossDamage = this.boss.currentBet + this.currentBet;
        } else if (playerBust) {
            result = 'bossWin';
            playerDamage = this.currentBet + this.boss.currentBet; // Player takes both bets as damage
        } else if (bossBust) {
            result = 'playerWin';
            bossDamage = this.boss.currentBet + this.currentBet; // Boss takes both bets as damage
        } else {
            const comparison = this.blackjackLogic.compareHands(this.player.hand, this.boss.hand);
            if (comparison > 0) {
                result = 'playerWin';
                bossDamage = this.currentBet;
            } else if (comparison < 0) {
                result = 'bossWin';
                playerDamage = this.boss.currentBet;
            } else {
                result = 'tie';
            }
        }
        
        this.applyDamage(playerDamage, bossDamage);
        
        const roundResult = {
            result: result,
            playerValue: playerValue,
            bossValue: bossValue,
            playerBust: playerBust,
            bossBust: bossBust,
            playerDamage: playerDamage,
            bossDamage: bossDamage,
            bet: this.currentBet
        };
        
        this.eventBus.emit('roundResolved', roundResult);
        
        if (this.player.hp <= 0) {
            this.handleBattleEnd('defeat');
        } else if (this.boss.hp <= 0) {
            this.handleBattleEnd('victory');
        } else {
            this.battleState = 'betting';
            this.eventBus.emit('readyForNewRound');
        }
        
        console.log('Round resolved:', roundResult);
    }
    
    handlePlayerBust() {
        this.battleState = 'roundEnd';
        this.eventBus.emit('playerBusted');
        
        setTimeout(() => {
            this.resolveRound();
        }, 1000);
    }
    
    applyDamage(playerDamage, bossDamage) {
        if (playerDamage > 0) {
            this.player.hp = Math.max(0, this.player.hp - playerDamage);
            this.gameManager.updatePlayerHP(this.player.hp);
        }
        
        if (bossDamage > 0) {
            this.boss.hp = Math.max(0, this.boss.hp - bossDamage);
            this.gameManager.updateBossHP(this.boss.hp);
        }
    }
    
    handleBattleEnd(result) {
        this.battleState = 'battleEnd';
        
        const battleOutcome = this.gameManager.handleBattleEnd(result);
        this.eventBus.emit('battleEnded', battleOutcome);
        
        setTimeout(() => {
            if (result === 'victory') {
                // Check if run is complete
                if (this.gameManager.isRunComplete()) {
                    this.scene.scene.start('RunCompleteScene');
                } else {
                    this.scene.scene.start('IntermissionScene');
                }
            } else {
                this.scene.scene.start('GameOverScene');
            }
        }, 2000);
    }
    
    getBattleState() {
        return this.battleState;
    }
    
    getPlayer() {
        return this.player;
    }
    
    getBoss() {
        return this.boss;
    }
    
    getCurrentBet() {
        return this.currentBet;
    }
    
    getMinBet() {
        // Dynamic min bet based on round, but can go all-in if chips are lower
        const roundMinBet = Math.max(1, this.roundNumber);
        return Math.min(roundMinBet, this.player.hp);
    }
    
    getMaxBet() {
        return Math.min(this.maxBet, this.player.hp);
    }
    
    getPlayerHandValue() {
        return this.blackjackLogic.calculateHandValue(this.player.hand);
    }
    
    getBossHandValue() {
        return this.blackjackLogic.calculateHandValue(this.boss.hand);
    }
    
    isPlayerBust() {
        return this.blackjackLogic.isBust(this.player.hand);
    }
    
    isBossBust() {
        return this.boss.isBust(); // Use boss's custom check
    }
    
    canPlayerUseSidearm() {
        return this.player.sidearm && !this.player.sidearmUsed && this.battleState === 'playerTurn';
    }
    
    logHandValues() {
        console.log(`Player: ${this.getPlayerHandValue()}, Boss: ${this.getBossHandValue()} (busts at ${this.boss.bustNumber})`);
    }
    
    on(event, callback) {
        this.eventBus.on(event, callback);
    }
    
    off(event, callback) {
        this.eventBus.off(event, callback);
    }
    
    destroy() {
        this.eventBus.removeAllListeners();
        this.eventBus.destroy();
    }
}