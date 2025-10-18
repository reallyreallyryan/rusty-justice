const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#001122',
    scene: [BootScene, StartScene, CharacterSelectScene, GameScene, VictoryScene, GameOverScene]
};

const game = new Phaser.Game(config);