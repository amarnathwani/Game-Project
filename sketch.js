/*

a game by Amar Nathwani

*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;
var mountains;
var canyons;
var collectables;
var ground;
var trees_x;

var game_score;
var flagpole;

var lives;

var platforms;
var isContact;

var enemies;

var jumpSound;
var hopSound;
var music;
var collectSound;
var tryAgainSound;
var winSound;
var cheerSound;
var winSoundPlaying;

var myFont;

var tree1;
var tree2;
var tree3;
var tree4;
var bg;
var platform;
var ground1;
var ground2;
var ground3;
var ground4;
var ground5;
var mountain;


function preload()
{
    soundFormats('wav', 'm4a');
    
    // load sounds here
    jumpSound = loadSound('assets/jumpsound.wav');
    hopSound = loadSound('assets/hopsound.wav');
    music = loadSound('assets/busride.m4a');
    collectSound = loadSound('assets/collect.wav');
    tryAgainSound = loadSound('assets/tryagain.wav');
    winSound = loadSound('assets/win.wav');
    cheerSound = loadSound('assets/badalala.wav');
    
    // sound settings
    jumpSound.setVolume(0.6);
    hopSound.setVolume(0.04);
    collectSound.setVolume(0.4);
    tryAgainSound.setVolume(0.4);
    winSound.setVolume(0.4);
    winSoundPlaying = false;
    
    // load images and assets here
    bg = loadImage('assets/sky.png');
    mountain = loadImage('assets/mountain.png');
    tree1 = loadImage('assets/tree1.png');
    tree2 = loadImage('assets/tree2.png');
    tree3 = loadImage('assets/tree3.png');
    tree4 = loadImage('assets/tree4.png');
    ground1 = loadImage('assets/ground1.png');
    ground2 = loadImage('assets/ground2.png');
    ground3 = loadImage('assets/ground3.png');
    ground4 = loadImage('assets/ground4.png');
    ground5 = loadImage('assets/ground5.png');
    platform = loadImage('assets/ground.png');
    
    // load font for text
    myFont = loadFont('assets/PressStart2P-Regular.ttf');
}


function setup()
{
    // Create Canvas
	createCanvas(1024, 576);

    // Initialise floor and lives
	floorPos_y = height * 3/4;
    lives = 3;
    
    // Initialise collectables in setup to remember when picked up if character dies
    collectables = [{x_pos: -600, y_pos: 400, size: 20, isFound: false},
                    {x_pos: -200, y_pos: 260, size: 20, isFound: false}, 
                    {x_pos: -312, y_pos: 400, size: 20, isFound: false},
                    {x_pos: 312, y_pos: 400, size: 20, isFound: false}, 
                    {x_pos: 830, y_pos: 400, size: 20, isFound: false},
                    {x_pos: 1050, y_pos: 190, size: 20, isFound: false},
                    {x_pos: 1500, y_pos: 400, size: 20, isFound: false},
                    {x_pos: 1765, y_pos: 330, size: 20, isFound: false},
                    {x_pos: 2050, y_pos: 290, size: 20, isFound: false},
                    {x_pos: 2540, y_pos: 190, size: 20, isFound: false}];
    
    // Initialise score and count in setup to remember score when character dies
    game_score = 0;
    
    // Start Game function
    startGame();
    
    // Music loop (not in start game to avoid restarting every character death)
    music.loop();
}


function draw()
{
    // Sky 
	background(bg);

    // Ground
	noStroke();
    fill(108, 83, 37);
    rect(0, floorPos_y, width, height/4);
    fill(123, 197, 59);
    rect(0, floorPos_y, width, height/18);
    
    // Start Translate Instruction
    push();
    translate(scrollPos, 0);

	// Draw clouds.
    drawClouds();

	// Draw mountains.
    drawMountains();
    
	// Draw trees.
    drawTrees();
    
    // Draw ground objects.
    drawGroundObjects();
    
    // Draw platforms.
    for(var i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

	// Draw canyons.
    for(var i = 0; i < canyons.length; i++) {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
        
        // If Canyon Collision
        if (isPlummeting == true) {
        gameChar_y += 3;
        }
    }

	// Draw collectable items.
    for(var i = 0; i < collectables.length; i++) {
        
        if(!collectables[i].isFound) {
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]);
        } else {}
        
    }          

    // Draw Flagpole
    renderFlagpole();
    
    // Draw enemies
    for(var i = 0; i < enemies.length; i++) {
        enemies[i].draw();
        var isEnemyContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
        
        if(isEnemyContact) {
            if(lives > 0) {
                lives -= 1;
                tryAgainSound.play();
                startGame();
                break;
            }
        }
    }
    
    // End Translate Instruction
    pop();
    
    
	// Draw game character.
	drawGameChar();
    
    // Draw game_score
    fill(255);
    noStroke();
    textFont(myFont);
    text("score: " + game_score, 20, 30);
    
    // Draw lives
    text("lives: ", 150, 30);
    for(var i = 0; i < lives; i++) {
        push();
        fill(255);
        noStroke();
        ellipse(250 + i * 40, 25, 23, 20);
        fill(0);
        ellipse(245 + i * 40, 24, 6, 5);
        ellipse(255 + i * 40, 24, 6, 5);
        stroke(0);
        line(245 + i * 40, 25, 255 + i * 40, 25);
        pop();
    }

    // Draw game over
    if(lives < 1) {
        push();
        textAlign(CENTER);
        textSize(40);
        fill(0);
        textFont(myFont);
        text("GAME OVER.", width/2, height/3);
        textSize(30);
        text('Refresh the page to play again.', width/2, height/3 + 75)
        pop();
        music.setVolume(0, 3.5);
        gameChar_y = height * 2;
        return;
    }
    
    // Draw level complete
    if(flagpole.isReached) {
        push();
        textAlign(CENTER);
        textSize(40);
        fill(0);
        textFont(myFont);
        text("LEVEL COMPLETE!", width/2, height/3);
        textSize(30);
        text('Score: ' + game_score + ' / 10', width/2, height/3 + 75);
        pop();
        gameChar_y = floorPos_y - 0.1;
        music.setVolume(0, 4);
        
        if(!winSoundPlaying) {
            winSound.play();
            cheerSound.play();
            winSoundPlaying = true;
        }
        
        return;
    }
    
    
	// Logic to make the game character move or the background scroll.
	if(isLeft) 
    {
		if(gameChar_x > width * 0.3) 
        {
			gameChar_x -= 5;
		}
		else 
        {
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.7)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
        if (gameChar_y < floorPos_y) {
            
            isContact = false;
            // Check if game character is over the platform
            for(var i = 0; i < platforms.length; i++) {
                if(platforms[i].checkContact(gameChar_world_x, gameChar_y)){
                    isContact = true;
                    isFalling = false;
                    break;
                }
            }
            if(isContact == false) {
                isFalling = true;
                gameChar_y = constrain(gameChar_y += 3.83, 0, floorPos_y);
            }

        } else {
            isFalling = false;
        }

    // Check Player Die
    checkPlayerDie();
    
    // Check Win State if not reached
    if(!flagpole.isReached) {
        checkFlagpole();
    }

    
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed(){
    
    // left arrow
    if (keyCode == 37) {
        isLeft = true;
    }
    
    // right arrow
    else if (keyCode == 39) {
        isRight = true;
    }
    
    // space (jump)
    else if (keyCode == 32 && (gameChar_y == floorPos_y || isContact)) {
        gameChar_y -= 100;
        jumpSound.play();
        hopSound.play();
    }
    
    // down arrow (if on platform, come down)
    else if (keyCode == 40 && isContact) {
        gameChar_y = gameChar_y + 7;
    }

}

function keyReleased()
{

    // stop moving left
    if (keyCode == 37) {
        isLeft = false;
    }
    
    // stop moving right
    else if (keyCode == 39) {
        isRight = false;
    }

}


// ------------------------------
// Game character render function
// ------------------------------


// Function to draw the game character.

function drawGameChar()
{
	// States of the game character
    
    // jumping left
	if(isLeft && isFalling)
	{
        
        fill(255);
        stroke(0);
        strokeWeight(0.4);
        //legs
        ellipse(gameChar_x, gameChar_y - 6, 12, 18);

        strokeWeight(0.5);
        //body
        ellipse(gameChar_x, gameChar_y - 27, 39, 52);

        strokeWeight(0.4);
        //arms
        ellipse(gameChar_x, gameChar_y - 22, 10, 30);

        //head
        ellipse(gameChar_x - 1, gameChar_y - 53, 25, 20);

        //eye-mouth-eye
        fill(0);
        strokeWeight(0.7);
        ellipse(gameChar_x - 7, gameChar_y - 52, 4, 4);
        line(gameChar_x - 7, gameChar_y - 51, gameChar_x - 12, gameChar_y - 50);
        
	}
    
    // jumping right
	else if(isRight && isFalling)
	{

        fill(255);
        stroke(0);
        strokeWeight(0.4);
        //legs
        ellipse(gameChar_x, gameChar_y - 6, 12, 18);

        strokeWeight(0.5);
        //body
        ellipse(gameChar_x, gameChar_y - 27, 39, 52);

        strokeWeight(0.4);
        //arms
        ellipse(gameChar_x, gameChar_y - 22, 10, 30);

        //head
        ellipse(gameChar_x + 1, gameChar_y - 53, 25, 20);

        //eye-mouth-eye
        fill(0);
        strokeWeight(0.7);
        ellipse(gameChar_x + 7, gameChar_y - 52, 4, 4);
        line(gameChar_x + 7, gameChar_y - 51, gameChar_x + 12, gameChar_y - 50);
        
	}
    
    // walking left
	else if(isLeft)
	{

        fill(255);
        stroke(0);
        strokeWeight(0.4);
        //legs
        ellipse(gameChar_x, gameChar_y - 6, 12, 18);

        strokeWeight(0.5);
        //body
        ellipse(gameChar_x, gameChar_y - 30, 39, 52);

        strokeWeight(0.4);
        //arms
        ellipse(gameChar_x, gameChar_y - 30, 10, 30);

        //head
        ellipse(gameChar_x, gameChar_y - 57, 25, 20);

        //eye-mouth-eye
        fill(0);
        strokeWeight(0.7);
        ellipse(gameChar_x - 7, gameChar_y - 58, 4, 4);
        line(gameChar_x - 7, gameChar_y - 57, gameChar_x - 12, gameChar_y - 57);

	}
    
    // walking right
	else if(isRight)
	{

        fill(255);
        stroke(0);
        strokeWeight(0.4);
        //legs
        ellipse(gameChar_x, gameChar_y - 6, 12, 18);

        strokeWeight(0.5);
        //body
        ellipse(gameChar_x, gameChar_y - 30, 39, 52);

        strokeWeight(0.4);
        //arms
        ellipse(gameChar_x, gameChar_y - 30, 10, 30);

        //head
        ellipse(gameChar_x, gameChar_y - 57, 25, 20);

        //eye-mouth-eye
        fill(0);
        strokeWeight(0.7);
        ellipse(gameChar_x + 7, gameChar_y - 58, 4, 4);
        line(gameChar_x + 7, gameChar_y - 57, gameChar_x + 12, gameChar_y - 57);

	}
    
    // jumping face-forward
	else if(isFalling || isPlummeting)
	{

        fill(255);
        stroke(0);
        strokeWeight(0.4);
        //legs
        ellipse(gameChar_x - 5, gameChar_y - 6, 12, 18);
        ellipse(gameChar_x + 5, gameChar_y - 6, 12, 18);

        //arms
        ellipse(gameChar_x - 18, gameChar_y - 24, 10, 30);
        ellipse(gameChar_x + 18, gameChar_y - 24, 10, 30);

        strokeWeight(0.5);
        //body
        ellipse(gameChar_x, gameChar_y - 27, 39, 52);

        strokeWeight(0.4);
        //head
        ellipse(gameChar_x, gameChar_y - 52, 25, 20);

        //eye-mouth-eye
        fill(0);
        strokeWeight(0.7);
        ellipse(gameChar_x - 5, gameChar_y - 48, 4, 4);
        line(gameChar_x - 5, gameChar_y - 47, gameChar_x + 5, gameChar_y - 47);
        ellipse(gameChar_x + 5, gameChar_y - 48, 4, 4);
    
	}
    
    // front-facing
	else
	{

        fill(255);
        stroke(0);
        strokeWeight(0.4);
        //legs
        ellipse(gameChar_x - 5, gameChar_y - 6, 12, 18);
        ellipse(gameChar_x + 5, gameChar_y - 6, 12, 18);

        //arms
        ellipse(gameChar_x - 18, gameChar_y - 30, 10, 30);
        ellipse(gameChar_x + 18, gameChar_y - 30, 10, 30);

        strokeWeight(0.5);
        //body
        ellipse(gameChar_x, gameChar_y - 30, 39, 52);

        strokeWeight(0.4);
        //head
        ellipse(gameChar_x, gameChar_y - 57, 25, 20);

        //eye-mouth-eye
        fill(0);
        strokeWeight(0.7);
        ellipse(gameChar_x - 5, gameChar_y - 58, 4, 4);
        line(gameChar_x - 5, gameChar_y - 57, gameChar_x + 5, gameChar_y - 57);
        ellipse(gameChar_x + 5, gameChar_y - 58, 4, 4);

	}

}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.

function drawClouds() {
    
    for(var i = 0; i < clouds.length; i++) {
        fill(253,245,230);
        ellipse(clouds[i].x_pos - 50 * clouds[i].scale, clouds[i].y_pos, 70 * clouds[i].scale)
        ellipse(clouds[i].x_pos, clouds[i].y_pos, 100 * clouds[i].scale);
        ellipse(clouds[i].x_pos + 50 * clouds[i].scale, clouds[i].y_pos, 70 * clouds[i].scale)
    }
    
}

// Function to draw mountains objects.

function drawMountains() {
    
    for(var i = 0; i < mountains.length; i++) {
        image(mountain, mountains[i].x_pos, mountains[i].y_pos, mountains[i].size, mountains[i].size);
    }
    
}

// Function to draw trees objects.

function drawTrees() {
    
    for(var i = 0; i < trees_x.length; i++) {
        image(trees_x[i].img, trees_x[i].xPos, trees_x[i].yPos, trees_x[i].size, trees_x[i].size);
    }
    
}

// Function to draw ground objects.

function drawGroundObjects() {
    
    for(var i = 0; i < ground.length; i++) {
        image(ground[i].img, ground[i].xPos, ground[i].yPos, ground[i].size, ground[i].size);
    }
    
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
    fill(61, 43, 31);
    rect(t_canyon.x_pos, floorPos_y, t_canyon.width, floorPos_y + 200);
    fill(44, 31, 22);
    rect(t_canyon.x_pos, floorPos_y + 50, t_canyon.width, floorPos_y + 200);
    fill(27, 19, 14);
    rect(t_canyon.x_pos, floorPos_y + 90, t_canyon.width, floorPos_y + 200);
    fill(10, 7, 5);
    rect(t_canyon.x_pos, floorPos_y + 120, t_canyon.width, floorPos_y + 200);        
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
    if (gameChar_world_x > t_canyon.x_pos + 10 && gameChar_world_x < t_canyon.x_pos + t_canyon.width - 10 && gameChar_y >= floorPos_y) {
        isPlummeting = true;
        isFalling = true;
        isRight = false;
        isLeft = false;
    } 
}


// ----------------------------------
// Collectable items render and check functions
// ----------------------------------


// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
    fill(255, 215, 0);
    ellipse(t_collectable.x_pos, t_collectable.y_pos, t_collectable.size);        
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
    if (dist(t_collectable.x_pos, t_collectable.y_pos, gameChar_world_x, gameChar_y - 20) < 20) {
        t_collectable.isFound = true;
        collectSound.play();
        game_score += 1;
    }
}

// Function to render flagpole

function renderFlagpole() {
        
    push();
    strokeWeight(5);
    stroke(0);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 150);
    fill(220, 53, 53);
    noStroke();
    
              
    if(flagpole.isReached) {
        rect(flagpole.x_pos, floorPos_y - 150, 50, 50);
    } else {
        rect(flagpole.x_pos, floorPos_y - 50, 50, 50);
    }
    
    pop();
}

// Function to check if flagpole reached

function checkFlagpole() {
    var d = abs(gameChar_world_x - flagpole.x_pos);
    
    if(d < 15) {
        flagpole.isReached = true;
    }
}

// Function to check if player dies

function checkPlayerDie() {
    if(gameChar_y > height * 1.5 && lives > 0) {
        lives -= 1;
        tryAgainSound.play();
        if(lives >=1) {
            startGame();
        }
    } else {}
    
}


// ----------------------------------
// Start Game Function, Platforms & Enemies
// ----------------------------------

// Start game: initialise character position, objects in the environment, enemies, and other variables

function startGame() {
    gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
    isContact = false;

	// Initialise arrays of scenery objects.
    // Trees array, containing image selection (from tree 1, 2, 3 and 4), x pos, y pos, and size
    trees_x = [{img: tree1, xPos: 400, yPos: floorPos_y - 285, size: 285},
               {img: tree2, xPos: -640, yPos: floorPos_y - 300, size: 300},
              {img: tree4, xPos: -243, yPos: floorPos_y - 260, size: 260},
              {img: tree3, xPos: 150, yPos: floorPos_y - 220, size: 220},
              {img: tree2, xPos: 762, yPos: floorPos_y - 262, size: 262},
              {img: tree1, xPos: 1032, yPos: floorPos_y - 290, size: 290},
              {img: tree4, xPos: 1387, yPos: floorPos_y - 270, size: 270},
              {img: tree3, xPos: 2072, yPos: floorPos_y - 254, size: 254},
              {img: tree4, xPos: 2232, yPos: floorPos_y - 240, size: 240},
              {img: tree2, xPos: 2482, yPos: floorPos_y - 273, size: 273},
              {img: tree3, xPos: 2782, yPos: floorPos_y - 230, size: 230},
              {img: tree1, xPos: 3077, yPos: floorPos_y - 298, size: 298}];
    
    // Initialise ground objects, rocks and stumps
    ground = [{img: ground3, xPos: 400, yPos: floorPos_y - 52, size: 80},
               {img: ground5, xPos: -640, yPos: floorPos_y - 110, size: 140},
              {img: ground2, xPos: -243, yPos: floorPos_y - 65, size: 89},
              {img: ground4, xPos: 3107, yPos: floorPos_y - 76, size: 80},
              {img: ground1, xPos: 762, yPos: floorPos_y - 80, size: 82},
              {img: ground5, xPos: 1032, yPos: floorPos_y - 60, size: 78},
              {img: ground4, xPos: 1187, yPos: floorPos_y - 88, size: 93},
              {img: ground2, xPos: 2042, yPos: floorPos_y - 69, size: 94},
              {img: ground3, xPos: 2232, yPos: floorPos_y - 63, size: 96},
              {img: ground5, xPos: 2482, yPos: floorPos_y - 73, size: 94}];
    
    // Clouds array
    clouds = [{x_pos: 100, y_pos: 150, scale: 1.2}, 
              {x_pos: 800, y_pos: 100, scale: 1}, 
              {x_pos: 1200, y_pos: 150, scale: 1.5},
              {x_pos: 1600, y_pos: 150, scale: 1},
              {x_pos: 1900, y_pos: 150, scale: 2},
              {x_pos: 2500, y_pos: 150, scale: 1.4}];
    
    // Mountains array
    mountains = [{x_pos: 260, y_pos: floorPos_y - 1040, size: 1040}, 
                 {x_pos: -600, y_pos: floorPos_y - 860, size: 860}, 
                 {x_pos: 1300, y_pos: floorPos_y - 1070, size: 1070}, 
                 {x_pos: 2370, y_pos: floorPos_y - 850, size: 850},
                 {x_pos: 3220, y_pos: floorPos_y - 750, size: 750}];
    
    // Canyons array
    canyons = [{x_pos: 100, width: 70}, 
               {x_pos: 600, width: 70}, 
               {x_pos: 1700, width: 300}, 
               {x_pos: 3000, width: 70}];
    
    // Platforms array & create platforms
    platforms = [];
    platforms.push(createPlatforms(-138, floorPos_y - 70, 100));
    platforms.push(createPlatforms(-250, floorPos_y - 140, 100));
    platforms.push(createPlatforms(-362, floorPos_y - 70, 100));
    platforms.push(createPlatforms(1000, floorPos_y - 70, 100));
    platforms.push(createPlatforms(1710, floorPos_y - 70, 110));
    platforms.push(createPlatforms(1890, floorPos_y - 70, 110));
    platforms.push(createPlatforms(1112, floorPos_y - 140, 100))
    platforms.push(createPlatforms(1000, floorPos_y - 210, 100));
    platforms.push(createPlatforms(1300, floorPos_y - 70, 100));
    platforms.push(createPlatforms(2250, floorPos_y - 70, 100));
    platforms.push(createPlatforms(2370, floorPos_y - 140, 100));
    platforms.push(createPlatforms(2490, floorPos_y - 210, 100));
    platforms.push(createPlatforms(2610, floorPos_y - 140, 100));
    platforms.push(createPlatforms(2730, floorPos_y - 70, 100));
    
    // Initialise flagpole
    flagpole = {isReached: false, x_pos: 3400};
    
    // Initialise enemies array & create enemies
    enemies = [];
    enemies.push(new Enemy(-350, floorPos_y - 15, 300));
    enemies.push(new Enemy(1000, floorPos_y - 15, 200));
    enemies.push(new Enemy(1300, floorPos_y - 15, 250));
    enemies.push(new Enemy(2250, floorPos_y - 15, 100));
    enemies.push(new Enemy(2400, floorPos_y - 15, 83));
    enemies.push(new Enemy(2560, floorPos_y - 15, 152));
    enemies.push(new Enemy(2600, floorPos_y - 15, 82));
    enemies.push(new Enemy(2700, floorPos_y - 15, 183));
}

// Function to create platforms using the Factory Pattern 

function createPlatforms(x, y, length) {
    var p = {
        x: x,
        y: y, 
        length: length,
        draw: function() {
            image(platform, this.x, this.y, this.length, 20);
        },
        checkContact: function(gc_x, gc_y) {
            if(gc_x > this.x - 12 && gc_x < this.x + this.length + 12) {
                var d = this.y - gc_y;
                if(d >= 0 && d < 5) {
                    return true;
                }
            }
            return false;
        }
    }
    return p;
}

// Function to create enemies using constructor function

function Enemy(x, y, range) {
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.inc = 1;
    
    this.update = function() {
        this.currentX += this.inc;
        
        if(this.currentX >= (this.x + this.range)) {
            this.inc = -1;
        }
        else if(this.currentX < this.x) {
            this.inc = 1;
        }
    }
    
    this.draw = function() {
        this.update();
        var dir = this.inc;
        push();
        fill(0);
        ellipse(this.currentX, this.y, 30);
        fill(255);
        ellipse(this.currentX + 9 * dir, this.y - 4.5, 9);
        fill(0);
        ellipse(this.currentX + 9 * dir, this.y - 4.5, 4.5);
        fill(255);
        ellipse(this.currentX + 9 * dir, this.y - 5.1, 1.5);
        pop();
    }
    
    this.checkContact = function(gc_x, gc_y) {
        var d = dist(gc_x, gc_y, this.currentX, this.y);
        
        if(d < 30) {
            return true;
        }
        return false;
    }
}
