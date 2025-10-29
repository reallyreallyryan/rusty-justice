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
        
        // Simple betting validation - always bet 1 to 6 (or max HP)
        const minBet = 1;
        const maxBet = Math.min(this.maxBet, this.player.hp);
        
        if (amount < minBet || amount > maxBet) {
            console.warn(`Bet must be between ${minBet} and ${maxBet}, got:`, amount);
            return false;
        }
        
        // Boss betting progression: [1, 3, 4, 5, 7, 9, 11, 13]
        const bossBettingProgression = [1, 3, 4, 5, 7, 9, 11, 13];
        const bosseBetIndex = Math.min(this.roundNumber - 1, bossBettingProgression.length - 1);
        this.boss.currentBet = bossBettingProgression[bosseBetIndex];
        
        console.log(`Round ${this.roundNumber}: Boss bets ${this.boss.currentBet} chips`);
        
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
        // Always minimum bet of 1
        return 1;
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