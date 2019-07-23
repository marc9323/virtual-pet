// create a new scene
let homeScene = new Phaser.Scene('Home');

homeScene.create = function() {
    // game background, with active input
    // tap anywhere start game
    let bg = this.add.sprite(0, 0, 'backyard').setInteractive();
    bg.setOrigin(0, 0);

    // welcome text
    let text = this.add.text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2 - 200,
        '😻 SIM BEM!',
        {
            font: '40px Arial',
            fill: '#ffffff'
        }
    );

    let gameW = this.sys.game.config.width;
    let gameH = this.sys.game.config.height;

    let text1 = this.add.text(
        this.sys.game.config.width / 2 - 35,
        this.sys.game.config.height / 2 - 150,
        'YAY',
        {
            font: '40px Arial',
            fill: '#ffffff'
        }
    );

    text.setOrigin(0.5, 0.5);

    // text background
    let textBg = this.add.graphics();
    textBg.fillStyle(0x000000, 0.6);
    textBg.fillRect(41, 100, text.width + 25, text.height * 3);

    textBg.setDepth(0);
    text.setDepth(1);
    text1.setDepth(2);

    bg.on(
        'pointerdown',
        function() {
            this.scene.start('Game');
        },
        this
    );
};
