class GameManager {
    constructor() {
        this.gameState = {
            currentScene: 'StartScene',
            selectedCharacter: null,
            playerData: {
                hp: 100,
                maxHP: 100,
                experience: 0,
                gamesWon: 0,
                gamesLost: 0
            },
            sessionData: {
                roomId: null,
                isMultiplayer: false,
                gameId: null
            },
            battleData: {
                currentBet: 10,
                roundsWon: 0,
                currentBoss: null
            }
        };
        
        this.characters = [
            {
                id: 'rusty_gunslinger',
                name: 'Rusty',
                class: 'Gunslinger',
                baseHP: 100,
                description: 'A weathered gunslinger seeking justice in the cyber frontier',
                abilities: ['Sidearm Mastery', 'Quick Draw']
            }
        ];
        
        this.bosses = [
            {
                id: 'iron_mike',
                name: 'Iron Mike',
                hp: 80,
                maxHP: 80,
                baseBet: 15,
                hitThreshold: 17,
                description: 'A cybernetic enforcer with nerves of steel',
                difficulty: 1
            }
        ];
        
        this.eventBus = new Phaser.Events.EventEmitter();
    }
    
    initializeGameSession() {
        this.gameState.sessionData.roomId = this.generateRoomId();
        this.gameState.sessionData.gameId = this.generateGameId();
        console.log(`Game session initialized - Room: ${this.gameState.sessionData.roomId}`);
    }
    
    generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateGameId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    selectCharacter(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (character) {
            this.gameState.selectedCharacter = character;
            this.gameState.playerData.hp = character.baseHP;
            this.gameState.playerData.maxHP = character.baseHP;
            console.log(`Character selected: ${character.name}`);
            return true;
        }
        return false;
    }
    
    getSelectedCharacter() {
        return this.gameState.selectedCharacter;
    }
    
    getAvailableCharacters() {
        return this.characters;
    }
    
    startBattle(bossId = 'iron_mike') {
        const boss = this.bosses.find(b => b.id === bossId);
        if (boss) {
            this.gameState.battleData.currentBoss = { ...boss };
            this.gameState.currentScene = 'GameScene';
            console.log(`Battle started against ${boss.name}`);
            return boss;
        }
        return null;
    }
    
    getBattleData() {
        return this.gameState.battleData;
    }
    
    getPlayerData() {
        return this.gameState.playerData;
    }
    
    updatePlayerHP(newHP) {
        this.gameState.playerData.hp = Math.max(0, newHP);
        this.eventBus.emit('playerHPChanged', this.gameState.playerData.hp);
    }
    
    updateBossHP(newHP) {
        if (this.gameState.battleData.currentBoss) {
            this.gameState.battleData.currentBoss.hp = Math.max(0, newHP);
            this.eventBus.emit('bossHPChanged', this.gameState.battleData.currentBoss.hp);
        }
    }
    
    handleBattleEnd(result) {
        const outcome = {
            result: result,
            playerHP: this.gameState.playerData.hp,
            bossHP: this.gameState.battleData.currentBoss ? this.gameState.battleData.currentBoss.hp : 0,
            roundsWon: this.gameState.battleData.roundsWon
        };
        
        if (result === 'victory') {
            this.gameState.playerData.gamesWon++;
            this.gameState.currentScene = 'VictoryScene';
            console.log('Battle won! Proceeding to victory screen.');
        } else if (result === 'defeat') {
            this.gameState.playerData.gamesLost++;
            this.gameState.currentScene = 'GameOverScene';
            console.log('Battle lost! Proceeding to game over screen.');
        }
        
        this.eventBus.emit('battleEnded', outcome);
        return outcome;
    }
    
    resetForNewGame() {
        this.gameState.battleData = {
            currentBet: 10,
            roundsWon: 0,
            currentBoss: null
        };
        
        if (this.gameState.selectedCharacter) {
            this.gameState.playerData.hp = this.gameState.selectedCharacter.baseHP;
        }
        
        this.gameState.currentScene = 'StartScene';
        console.log('Game state reset for new game');
    }
    
    getCurrentScene() {
        return this.gameState.currentScene;
    }
    
    setCurrentScene(sceneName) {
        this.gameState.currentScene = sceneName;
        this.eventBus.emit('sceneChanged', sceneName);
    }
    
    getSessionData() {
        return this.gameState.sessionData;
    }
    
    on(event, callback) {
        this.eventBus.on(event, callback);
    }
    
    off(event, callback) {
        this.eventBus.off(event, callback);
    }
    
    emit(event, data) {
        this.eventBus.emit(event, data);
    }
    
    getGameState() {
        return { ...this.gameState };
    }
    
    validateGameState() {
        const errors = [];
        
        if (this.gameState.playerData.hp < 0) {
            errors.push('Invalid player HP');
        }
        
        if (this.gameState.battleData.currentBoss && this.gameState.battleData.currentBoss.hp < 0) {
            errors.push('Invalid boss HP');
        }
        
        if (!this.gameState.sessionData.roomId) {
            errors.push('Missing room ID');
        }
        
        return errors.length === 0 ? null : errors;
    }
}