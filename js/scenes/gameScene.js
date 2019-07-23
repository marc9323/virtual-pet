//NOTES:  animations in phaser can be accessed from different scenes
// same as the assets
// anims, tweens, sprite, physics, etc. are different plugins
// where are they accessible from?  figure out rules

// create a new scene
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene
gameScene.init = function() {
    this.stats = {
        health: 100,
        fun: 100
    };

    this.decayRates = {
        health: -5,
        fun: -2
    };
};

// load asset files for our game
gameScene.preload = function() {};

// executed once, after assets were loaded
gameScene.create = function() {
    // game background
    let bg = this.add.sprite(0, 0, 'backyard').setInteractive();
    bg.setOrigin(0, 0);
    bg.on('pointerdown', this.placeItem, this);

    this.pet = this.add.sprite(100, 200, 'pet', 0).setInteractive();
    this.pet.depth = 1;

    // make pet draggable
    this.input.setDraggable(this.pet);

    // follow the pointer (mouse/finger) when dragging
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        // make sprite be located at the coordinates of pointer, dragXY
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    // buttons
    this.createUi();

    // show stats
    this.createHud();

    this.refreshHud();

    // decay of health and fun - TIMED EVENT
    this.timedEventStats = this.time.addEvent({
        delay: 1000,
        repeat: -1, // repeat forever
        callback: function() {
            this.updateStats(this.decayRates);
        },
        callbackScope: this
    });
};

// create ui
gameScene.createUi = function() {
    this.appleBtn = this.add.sprite(72, 570, 'apple').setInteractive();
    this.appleBtn.customStats = { health: 20, fun: 0 };
    this.appleBtn.on('pointerdown', this.pickItem);

    this.candyBtn = this.add.sprite(144, 570, 'candy').setInteractive();
    this.candyBtn.customStats = { health: -10, fun: 10 };
    this.candyBtn.on('pointerdown', this.pickItem);

    this.toyBtn = this.add.sprite(216, 570, 'toy').setInteractive();
    this.toyBtn.customStats = { health: 0, fun: 15 };
    this.toyBtn.on('pointerdown', this.pickItem);

    this.rotateBtn = this.add.sprite(288, 570, 'rotate').setInteractive();
    this.rotateBtn.customStats = { fun: 20 };
    this.rotateBtn.on('pointerdown', this.rotatePet);

    // put the buttons in an array
    this.buttons = [this.appleBtn, this.candyBtn, this.toyBtn, this.rotateBtn];

    // ui starts as not being blocked
    this.uiBlocked = false;

    // refresh ui
    this.uiReady();
};

// rotate pet
gameScene.rotatePet = function() {
    // make sure not blocked
    if (this.scene.uiBlocked) {
        return;
    }

    this.scene.uiReady();

    // block the ui
    this.scene.uiBlocked = true;
    // dim rotate icon
    this.alpha = 0.5;

    // not necessary since I use 'this' later
    let scene = this.scene;

    // rotation tween
    let rotateTween = this.scene.tweens.add(
        {
            targets: this.scene.pet,
            duration: 600,
            angle: 720,
            pause: false,
            callbackScope: this, // just pass the sprite which is context of rotatePet
            // this callback will have access to the tween and sprites
            onComplete: function(tween, sprites) {
                this.scene.updateStats(this.customStats);
                // increase the fun
                this.scene.stats.fun += this.customStats.fun;
                // set Ui to ready
                this.scene.uiReady();
                // this.scene.refreshHud();
            }
        },
        this
    );

    // for testing
    // setTimeout(() => {
    //     // set scene back to ready
    //     scene.uiReady();
    // }, 2000);

    console.log('rotate');
};

// pick item
gameScene.pickItem = function() {
    // the context here will NOT be the scene - it will be the sprite that was
    // clicked.  but we could have passed the context, then 'this' would be
    // the scene, if not scene context, then access the scene with
    // this.scene...

    // the ui must be unblocked in order to select an item
    if (this.scene.uiBlocked) {
        return;
    }

    // make sure ui ready
    this.scene.uiReady();

    // select item
    this.scene.selectedItem = this; // this corresponds to the sprite

    // change transparency
    this.alpha = 0.5;
    console.log(this.customStats + ' : ' + this.texture.key);
    console.log(this);
};

// set ui to ready state
gameScene.uiReady = function() {
    // nothing is being selected
    this.selectedItem = null;

    // set all buttons to alhpa = 1
    this.buttons.forEach(button => {
        button.alpha = 1;
    });

    // unblock the ui
    this.uiBlocked = false;
};

// place a new item on the game
gameScene.placeItem = function(pointer, localX, localY) {
    // passing the context - so this = the scene

    // if no item is selected
    if (!this.selectedItem) {
        return;
    }

    // ui must be unblocked
    if (this.uiBlocked) {
        return;
    }

    // otherwise, create a new item in the position selected(clicked)
    let newItem = this.add.sprite(
        localX,
        localY,
        this.selectedItem.texture.key
    );

    // clear the ui
    //this.uiReady();

    // block ui while the pet eats
    this.uiBlocked = true;

    // pet movement (tween)
    let petTween = this.tweens.add({
        targets: this.pet,
        duration: 500,
        x: newItem.x,
        y: newItem.y,
        paused: false,
        callbackScope: this,
        onComplete: function(tween, sprites) {
            // destroy the item
            newItem.destroy();

            // listen for when animation ends
            this.pet.on(
                'animationcomplete',
                function() {
                    // set the pet back to frame 0, neutral face
                    this.pet.setFrame(0);
                    // clear the ui
                    this.uiReady();

                    // this.refreshHud();
                },
                this
            ); // pass this or use this.scene
            // play spritesheet animation
            this.pet.play('funnyfaces');

            this.updateStats(this.selectedItem.customStats);
        }
    });

    // update pet stats
    // this.stats.health += this.selectedItem.customStats.health;
    // this.stats.fun += this.selectedItem.customStats.fun;

    // this is a better way to update the stats, particularly if we had
    // numerous different types of stats
    // go through every property and only take the ones that belong to the object
    // itself and for those, add them to the list of stats

    console.log(pointer, localX, localY);
};

// create text elements to show stats
gameScene.createHud = function() {
    // health
    this.healthText = this.add.text(20, 20, 'Health: ', {
        font: '26px Comic Sans',
        fill: '#ffffff'
    });

    // fun
    this.funText = this.add.text(20, 60, 'Fun: ', {
        font: '26px Comic Sans',
        fill: '#ffffff'
    });

    this.bemText = this.add.text(215, 20, 'Virtual Bem', {
        font: '26px comic sans',
        fill: '#ffffff'
    });
};

// show current value of health and fun
gameScene.refreshHud = function() {
    this.healthText.setText(`Health: ${this.stats.health}`);
    this.funText.setText(`Fun: ${this.stats.fun}`);
};

// stats update
gameScene.updateStats = function(statDiff) {
    // gameover flag
    let isGameOver = false;

    for (stat in statDiff) {
        if (statDiff.hasOwnProperty(stat)) {
            this.stats[stat] += statDiff[stat];

            if (this.stats[stat] < 0) {
                isGameOver = true;
                this.stats[stat] = 0;
            }
        }
    }

    // refresh HUD
    this.refreshHud();

    // did game end?
    if (isGameOver) {
        this.gameOver();
    }
};

gameScene.gameOver = function() {
    // block ui
    this.uiBlocked = true;

    // change pet frame to unhappy bem
    this.pet.setFrame(4);

    // pause before moving on
    this.time.addEvent({
        delay: 4000,
        repeat: 0,
        callback: function() {
            this.scene.start('Home');
        },
        callbackScope: this
    });
};
