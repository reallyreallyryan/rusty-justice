class BattleManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.blackjackLogic = new BlackjackLogic();
        this.deck = new Deck();
        
        this.battleState = 'inactive';
        this.currentBet = 10;
        this.minBet = 5;
        this.maxBet = 100;
        
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
            this.boss = new Boss(this.scene, battleData.currentBoss.hp);
            this.boss.name = battleData.currentBoss.name;
            this.boss.currentBet = battleData.currentBoss.baseBet;
        } else {
            this.gameManager.startBattle('iron_mike');
            this.boss = new Boss(this.scene, this.gameManager.getBattleData().currentBoss.hp);
        }
        
        this.currentBet = battleData.currentBet || 10;
        this.battleState = 'betting';
        
        console.log('Battle initialized:', {
            playerHP: this.player.hp,
            bossHP: this.boss.hp,
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
        
        if (amount < this.minBet || amount > this.maxBet) {
            console.warn('Bet amount out of range:', amount);
            return false;
        }
        
        if (amount > this.player.hp) {
            console.warn('Cannot bet more than current HP');
            return false;
        }
        
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
            
            if (this.blackjackLogic.isBust(this.boss.hand)) {
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
        const bossBust = this.blackjackLogic.isBust(this.boss.hand);
        
        let result = 'tie';
        let playerDamage = 0;
        let bossDamage = 0;
        
        if (playerBust && bossBust) {
            result = 'tie';
        } else if (playerBust) {
            result = 'bossWin';
            playerDamage = this.currentBet + 10;
        } else if (bossBust) {
            result = 'playerWin';
            bossDamage = this.currentBet;
        } else {
            const comparison = this.blackjackLogic.compareHands(this.player.hand, this.boss.hand);
            if (comparison > 0) {
                result = 'playerWin';
                bossDamage = this.currentBet;
            } else if (comparison < 0) {
                result = 'bossWin';
                playerDamage = this.currentBet;
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
                this.scene.scene.start('VictoryScene');
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
        return this.minBet;
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
        return this.blackjackLogic.isBust(this.boss.hand);
    }
    
    canPlayerUseSidearm() {
        return this.player.sidearm && !this.player.sidearmUsed && this.battleState === 'playerTurn';
    }
    
    logHandValues() {
        console.log(`Player hand value: ${this.getPlayerHandValue()}, Boss hand value: ${this.getBossHandValue()}`);
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