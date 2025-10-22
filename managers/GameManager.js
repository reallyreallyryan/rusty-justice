class GameManager {
    constructor() {
        this.gameState = {
            currentScene: 'StartScene',
            selectedCharacter: null,
            playerData: {
                hp: 21,  // Changed to 21 to match JAK rules
                maxHP: 21,
                experience: 0,
                gamesWon: 0,
                gamesLost: 0,
                reputation: 0  // NEW: Meta currency
            },
            sessionData: {
                roomId: null,
                isMultiplayer: false,
                gameId: null
            },
            battleData: {
                currentBet: 6,
                roundsWon: 0,
                currentBoss: null,
                currentBossIndex: 0,  // NEW: Track position in boss chain
                bossesDefeated: [],   // NEW: Track which bosses beaten
                runActive: false      // NEW: Is a run in progress?
            }
        };
        
        this.characters = [
            {
                id: 'rusty_gunslinger',
                name: 'Rusty',
                class: 'Gunslinger',
                baseHP: 21,  // Changed to 21
                description: 'A weathered gunslinger seeking justice in the cyber frontier',
                abilities: ['Sidearm Mastery', 'Quick Draw']
            }
        ];
        
        // ALL 6 SLUGS!
        this.bosses = [
            {
                id: 'slugjaw',
                name: 'Slugjaw',
                hp: 21,
                maxHP: 21,
                stayNumber: 17,
                bustNumber: 21,
                ability: {
                    name: 'Desert Mirage',
                    description: 'Once per battle, force player to discard highest card'
                },
                description: 'Sand-fused Bandit AI',
                difficulty: 1,
                icon: '🏜️'
            },
            {
                id: 'circuit_saint',
                name: 'Circuit Saint',
                hp: 21,
                maxHP: 21,
                stayNumber: 18,
                bustNumber: 22,
                ability: {
                    name: 'Surge',
                    description: 'Can reach 22 without busting'
                },
                description: 'Zealot Preacher Algorithm',
                difficulty: 2,
                icon: '⚡'
            },
            {
                id: 'pit_king',
                name: 'Pit King',
                hp: 21,
                maxHP: 21,
                stayNumber: 19,
                bustNumber: 23,
                ability: {
                    name: 'Gladiator\'s Gambit',
                    description: 'Double damage on natural 21'
                },
                description: 'Gladiator Bot of the Pit Circuits',
                difficulty: 3,
                icon: '⚔️'
            },
            {
                id: 'queen_scylla',
                name: 'Queen Scylla',
                hp: 21,
                maxHP: 21,
                stayNumber: 17,
                bustNumber: 22,
                ability: {
                    name: 'Swarm',
                    description: 'Draws 2 cards at start'
                },
                description: 'Hive-Mind Drone Mother',
                difficulty: 4,
                icon: '👑'
            },
            {
                id: 'the_proxy',
                name: 'The Proxy',
                hp: 21,
                maxHP: 21,
                stayNumber: 16,
                bustNumber: 21,
                ability: {
                    name: 'Mirror',
                    description: 'Copies player\'s last action'
                },
                description: 'Your Digital Mirror',
                difficulty: 5,
                icon: '🪞'
            },
            {
                id: 'slug_prime',
                name: 'SLUG PRIME',
                hp: 21,
                maxHP: 21,
                stayNumber: 20,
                bustNumber: 24,
                ability: {
                    name: 'Override',
                    description: 'Can change one card value by ±1'
                },
                description: 'The Rustfather — origin of the collapse',
                difficulty: 6,
                icon: '💀'
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
    
    // NEW: Start a full run
    startRun() {
        this.gameState.battleData.currentBossIndex = 0;
        this.gameState.battleData.bossesDefeated = [];
        this.gameState.battleData.runActive = true;
        
        // Start with first boss
        return this.advanceToNextBoss();
    }
    
    // NEW: Get next boss in chain
    advanceToNextBoss() {
        const index = this.gameState.battleData.currentBossIndex;
        
        if (index >= this.bosses.length) {
            console.log('All bosses defeated! Run complete!');
            return null; // All bosses defeated!
        }
        
        const boss = this.bosses[index];
        this.gameState.battleData.currentBoss = { ...boss };
        
        console.log(`Advancing to boss ${index + 1}/6: ${boss.name}`);
        return boss;
    }
    
    // NEW: Mark current boss as defeated and advance
    defeatCurrentBoss() {
        const currentBoss = this.gameState.battleData.currentBoss;
        if (currentBoss) {
            this.gameState.battleData.bossesDefeated.push(currentBoss.id);
            this.gameState.battleData.currentBossIndex++;
            console.log(`Boss defeated: ${currentBoss.name}. Progress: ${this.gameState.battleData.currentBossIndex}/6`);
        }
    }
    
    // NEW: Check if run is complete
    isRunComplete() {
        return this.gameState.battleData.currentBossIndex >= this.bosses.length;
    }
    
    // NEW: Get run progress
    getRunProgress() {
        return {
            current: this.gameState.battleData.currentBossIndex,
            total: this.bosses.length,
            defeated: this.gameState.battleData.bossesDefeated
        };
    }
    
    // DEPRECATED - keeping for backward compatibility
    startBattle(bossId = null) {
        if (!this.gameState.battleData.runActive) {
            return this.startRun();
        }
        return this.gameState.battleData.currentBoss;
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
            roundsWon: this.gameState.battleData.roundsWon,
            bossName: this.gameState.battleData.currentBoss ? this.gameState.battleData.currentBoss.name : 'Unknown'
        };
        
        if (result === 'victory') {
            this.defeatCurrentBoss();
            
            // Check if run is complete
            if (this.isRunComplete()) {
                this.gameState.playerData.gamesWon++;
                this.gameState.playerData.reputation += 100; // Reward for full run!
                this.gameState.battleData.runActive = false;
                this.gameState.currentScene = 'RunCompleteScene';
                console.log('RUN COMPLETE! All bosses defeated!');
            } else {
                // More bosses to fight - go to intermission
                this.gameState.currentScene = 'IntermissionScene';
                console.log('Boss defeated! Moving to intermission...');
            }
        } else if (result === 'defeat') {
            this.gameState.playerData.gamesLost++;
            this.gameState.battleData.runActive = false;
            this.gameState.currentScene = 'GameOverScene';
            console.log('Battle lost! Run failed.');
        }
        
        this.eventBus.emit('battleEnded', outcome);
        return outcome;
    }
    
    resetForNewGame() {
        this.gameState.battleData = {
            currentBet: 6,
            roundsWon: 0,
            currentBoss: null,
            currentBossIndex: 0,
            bossesDefeated: [],
            runActive: false
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