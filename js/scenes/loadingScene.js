let loadingScene = new Phaser.Scene('Loading');

loadingScene.preload = function() {
    // show logo
    let logo = this.add.sprite(game.config.width / 2, 250, 'logo');

    // progress bar background
    let bgBar = this.add.graphics();

    // origin by default in graphics is the top left
    let barW = 150;
    let barH = 30;

    bgBar.setPosition(
        game.config.width / 2 - barW / 2,
        game.config.height / 2 - barH / 2
    );
    bgBar.fillStyle(0xf5f5f5, 1);
    /// we already set the position so we are starting from the origin
    bgBar.fillRect(0, 0, barW, barH);

    // progress bar
    let progressBar = this.add.graphics();
    progressBar.setPosition(
        game.config.width / 2 - barW / 2,
        game.config.height / 2 - barH / 2
    );

    // listen for 'progress' event triggered as files are being loaded
    // value is a number between 0 and 1 representing the amount loaded already
    this.load.on(
        'progress',
        function(value) {
            // clearing progress bar so we can draw it again
            progressBar.clear();

            // fillstyle color
            progressBar.fillStyle(0x9ad98d);

            // draw rectangle / progress bar
            progressBar.fillRect(0, 0, value * barW, barH);
        },
        this
    );

    // load assets
    this.load.image('backyard', 'assets/images/backyard.png');
    this.load.image('apple', 'assets/images/apple.png');
    this.load.image('candy', 'assets/images/candy.png');
    this.load.image('rotate', 'assets/images/rotate.png');
    this.load.image('toy', 'assets/images/rubber_duck.png');

    // load spritesheet
    this.load.spritesheet('pet', 'assets/images/pet.png', {
        frameWidth: 97,
        frameHeight: 83,
        margin: 1,
        spacing: 1
    });
};

loadingScene.create = function() {
    // animation definition for pet
    // frames will go: 1, 2, 3... yoyo back
    // place the anims in create of the loading scene so that the asset is
    // loaded prior to the animation
    this.anims.create({
        key: 'funnyfaces',
        frames: this.anims.generateFrameNames('pet', { frames: [1, 2, 3] }),
        frameRate: 7,
        yoyo: true,
        repeat: 0 // to repeat once 1, play forever, -1
    });

    this.scene.start('Home');
};
