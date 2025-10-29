class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
        this.selectedCharacterIndex = 0;
    }

    create() {
        this.cameras.main.setBackgroundColor('#001122');
        this.cameras.main.fadeIn(250, 0, 17, 34);
        
        this.gameManager = this.registry.get('gameManager');
        this.characters = this.gameManager.getAvailableCharacters();
        
        this.createBackground();
        this.createTitle();
        this.createCharacterDisplay();
        this.createCharacterInfo();
        this.createNavigationControls();
        this.createActionButtons();
        
        this.selectCharacter(0);
    }

    createBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x002211, 0.4);
        graphics.fillRect(0, 0, 1024, 768);
        
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(1, 2);
            
            const star = this.add.circle(x, y, size, 0x00ff41);
            star.setAlpha(0.6);
            
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(3000, 5000),
                yoyo: true,
                repeat: -1
            });
        }
    }

    createTitle() {
        this.add.text(512, 80, 'SELECT YOUR GUNSLINGER', {
            fontSize: '32px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            stroke: '#003311',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(512, 120, 'Choose wisely - your life depends on it', {
            fontSize: '14px',
            fill: '#00aa33',
            fontFamily: 'Courier New',
            style: { fontStyle: 'italic' }
        }).setOrigin(0.5);
    }

    createCharacterDisplay() {
        this.characterContainer = this.add.container(512, 300);
        
        const characterBorder = this.add.rectangle(0, 0, 300, 200, 0x000000);
        characterBorder.setStrokeStyle(3, 0x00ff41);
        this.characterContainer.add(characterBorder);
        
        this.characterPortrait = this.add.rectangle(0, -20, 120, 160, 0x003311);
        this.characterPortrait.setStrokeStyle(2, 0x00ff41);
        this.characterContainer.add(this.characterPortrait);
        
        // Character card image (will be set dynamically)
        this.characterCard = null;
        
        this.characterName = this.add.text(0, 60, '', {
            fontSize: '20px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.characterContainer.add(this.characterName);
        
        this.characterClass = this.add.text(0, 85, '', {
            fontSize: '14px',
            fill: '#00aa33',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.characterContainer.add(this.characterClass);
    }

    createCharacterInfo() {
        this.infoContainer = this.add.container(512, 480);
        
        const infoBorder = this.add.rectangle(0, 0, 600, 140, 0x001122);
        infoBorder.setStrokeStyle(2, 0x007722);
        this.infoContainer.add(infoBorder);
        
        this.characterDescription = this.add.text(0, -40, '', {
            fontSize: '14px',
            fill: '#00aa33',
            fontFamily: 'Courier New',
            align: 'center',
            wordWrap: { width: 550 }
        }).setOrigin(0.5);
        this.infoContainer.add(this.characterDescription);
        
        this.characterStats = this.add.text(-200, 20, '', {
            fontSize: '12px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            align: 'left'
        }).setOrigin(0, 0.5);
        this.infoContainer.add(this.characterStats);
        
        this.characterAbilities = this.add.text(200, 20, '', {
            fontSize: '12px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            align: 'right'
        }).setOrigin(1, 0.5);
        this.infoContainer.add(this.characterAbilities);
    }

    createNavigationControls() {
        const leftArrow = this.add.text(300, 300, '◀', {
            fontSize: '40px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        const rightArrow = this.add.text(724, 300, '▶', {
            fontSize: '40px',
            fill: '#00ff41',
            fontFamily: 'Courier New'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        leftArrow.on('pointerdown', () => {
            this.previousCharacter();
        });

        rightArrow.on('pointerdown', () => {
            this.nextCharacter();
        });

        leftArrow.on('pointerover', () => {
            leftArrow.setScale(1.2);
        });

        leftArrow.on('pointerout', () => {
            leftArrow.setScale(1.0);
        });

        rightArrow.on('pointerover', () => {
            rightArrow.setScale(1.2);
        });

        rightArrow.on('pointerout', () => {
            rightArrow.setScale(1.0);
        });

        if (this.characters.length <= 1) {
            leftArrow.setAlpha(0.3);
            rightArrow.setAlpha(0.3);
            leftArrow.disableInteractive();
            rightArrow.disableInteractive();
        }

        this.characterCounter = this.add.text(512, 420, '', {
            fontSize: '12px',
            fill: '#007722',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
    }

    createActionButtons() {
        const selectButton = this.add.text(412, 650, 'SELECT GUNSLINGER', {
            fontSize: '20px',
            fill: '#001122',
            fontFamily: 'Courier New',
            backgroundColor: '#00ff41',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        const backButton = this.add.text(612, 650, 'BACK', {
            fontSize: '20px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            backgroundColor: '#003311',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        selectButton.on('pointerdown', () => {
            this.confirmSelection();
        });

        selectButton.on('pointerover', () => {
            selectButton.setScale(1.05);
        });

        selectButton.on('pointerout', () => {
            selectButton.setScale(1.0);
        });

        backButton.on('pointerdown', () => {
            this.goBack();
        });

        backButton.on('pointerover', () => {
            backButton.setScale(1.05);
        });

        backButton.on('pointerout', () => {
            backButton.setScale(1.0);
        });
    }

    selectCharacter(index) {
        if (index < 0 || index >= this.characters.length) return;
        
        this.selectedCharacterIndex = index;
        const character = this.characters[index];
        
        // Update character card image
        if (this.characterCard) {
            this.characterCard.destroy();
        }
        
        // Display character card based on character ID
        const characterCardMap = {
            'bang_bang': 'character_bang_bang',
            'loco_motive': 'character_loco_motive',
            'tre_boujie': 'character_tre_boujie',
            'eight_mm': 'character_eight_mm',
            'crankshaft': 'character_crankshaft',
            'bashcan': 'character_bashcan'
        };
        
        const characterCardKey = characterCardMap[character.id] || 'character_rusty';
        if (this.textures.exists(characterCardKey)) {
            this.characterCard = this.add.image(512, 280, characterCardKey);
            this.characterCard.setScale(0.2); // Scale to fit in portrait area
            this.characterCard.setDepth(1);
        }
        
        this.characterName.setText(character.name);
        this.characterClass.setText(character.class);
        this.characterDescription.setText(character.description);
        
        this.characterStats.setText(
            `Base HP: ${character.baseHP}\n` +
            `Difficulty: Beginner`
        );
        
        this.characterAbilities.setText(
            `Abilities:\n${character.abilities.join('\n')}`
        );
        
        this.characterCounter.setText(`${index + 1} / ${this.characters.length}`);
        
        this.tweens.add({
            targets: this.characterContainer,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }

    previousCharacter() {
        const newIndex = this.selectedCharacterIndex - 1;
        if (newIndex >= 0) {
            this.selectCharacter(newIndex);
        }
    }

    nextCharacter() {
        const newIndex = this.selectedCharacterIndex + 1;
        if (newIndex < this.characters.length) {
            this.selectCharacter(newIndex);
        }
    }

    confirmSelection() {
        const selectedCharacter = this.characters[this.selectedCharacterIndex];
        const success = this.gameManager.selectCharacter(selectedCharacter.id);
        
        if (success) {
            console.log(`Character selected: ${selectedCharacter.name}`);
            // Audio removed
            
            this.showConfirmation(`${selectedCharacter.name} selected!`);
            
            this.time.delayedCall(1000, () => {
                this.cameras.main.fade(250, 0, 17, 34);
                
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.gameManager.setCurrentScene('GameScene');
                    this.scene.start('GameScene');
                });
            });
        } else {
            this.showError('Failed to select character!');
        }
    }

    goBack() {
        console.log('Returning to start screen...');
        // Audio removed
        
        this.cameras.main.fade(250, 0, 17, 34);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.gameManager.setCurrentScene('StartScene');
            this.scene.start('StartScene');
        });
    }

    showConfirmation(message) {
        const confirmText = this.add.text(512, 720, message, {
            fontSize: '16px',
            fill: '#00ff41',
            fontFamily: 'Courier New',
            backgroundColor: '#001122',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: confirmText,
            alpha: 0,
            y: confirmText.y - 30,
            duration: 1000,
            ease: 'Power2'
        });
    }

    showError(message) {
        const errorText = this.add.text(512, 720, message, {
            fontSize: '16px',
            fill: '#ff4444',
            fontFamily: 'Courier New',
            backgroundColor: '#220011',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: errorText,
            alpha: 0,
            y: errorText.y - 30,
            duration: 2000,
            ease: 'Power2'
        });
    }
}