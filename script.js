//konstante dimenzija objekata u igri
const BRICK_ROWS = 8;
const BRICK_COLUMNS = 10;
const BRICK_PADDING = 8;
const BRICK_WIDTH = (window.innerWidth - 270 - BRICK_PADDING * ( BRICK_COLUMNS - 1 )) / BRICK_COLUMNS;
const BRICK_HEIGHT = (window.innerHeight / 1.85 - 40  - BRICK_PADDING * ( BRICK_ROWS - 1 )) / BRICK_ROWS;

const PADDLE_WIDTH = BRICK_WIDTH * 1.5;
const PADDLE_HEIGHT = 25;

const BALL_SIZE = 13;

//varijable kojima se prati stanje tipki za pomicanje palice
var LEFT = false; //inicijalno false jer tipke nisu pritisnute
var RIGHT = false

//varijabla kojom se prati stanje igre
var gamePlaying = true; //inicijalno true jer igra odmah zapocinje

//inicijaliziranje canvas elementa
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

//postavljanje polozaja objekata u igri koji ovise o velicini canvasa
var paddle_pos_x = (canvas.width - PADDLE_WIDTH) / 2;
var ball_pos_x = canvas.width/2;
var ball_pos_y = canvas.height - PADDLE_HEIGHT - 15;

//inicijalna brzina lopte
var ball_speed_x = 4;
var ball_speed_y = -4;

//postavljanje pocetnog rezultata 
var gameScore = localStorage.getItem("gameScore") || 0;
var highScore = localStorage.getItem("highScore") || gameScore;

var maxScore = BRICK_ROWS * BRICK_COLUMNS; //maksimalan rezultat jednak je broju cigli na pocetku

//event listeneri za pritisak tipke na tipkovnici
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

//funkcija koja upravlja pritiskom na tipke lijeve i desne strelice te na tipku space
function keyDownHandler(e) 
{
	if(e.key === "ArrowLeft") LEFT = true;
	if(e.key === "ArrowRight") RIGHT = true;

    if(e.key === " " && !gamePlaying )  
    {
        //pritiskom na tipku space u slucaju kada je igra zavrsena, igra se resetira i ponovno pokrece
        resetGame();
        startGame();
    }
}

//funkcija koja postavlja varijable na false kada tipke nisu pritisnute
function keyUpHandler(e) 
{
	if(e.key == "ArrowLeft") LEFT = false;
	if(e.key == "ArrowRight") RIGHT = false;
}

//funckija koja resetira igru
function resetGame() 
{
    //resetiranje bodova 
    gameScore = 0; 
    gamePlaying = true;
    localStorage.setItem("gameScore", 0);

    //ponovno inicijaliziranje elemenata igre
    ball_pos_x = canvas.width / 2;
    ball_pos_y = canvas.height - PADDLE_HEIGHT - 15;
    ball_speed_x = -ball_speed_x;
    ball_speed_y = -ball_speed_y;

    paddle_pos_x = (canvas.width - PADDLE_WIDTH) / 2;

    bricks = [];
    for (let i = 0; i < BRICK_ROWS; i++) {
        bricks[i] = [];
        for (let j = 0; j < BRICK_COLUMNS; j++) {
            bricks[i][j] = { x: 0, y: 0, alive: 1 };
        }
    }

}

//inicijaliziranje elemenata cigli
//svaka cigla je definirana varijablama x i y koje predstavljaju polozaj cigle te varijablom alive koja poprima vrijednost 1 ili 0 ovisno o tome je li cigla unistena
let bricks = [];
for (let i = 0; i < BRICK_ROWS; i++) 
{
    bricks[i] = [];
    for(let j = 0; j < BRICK_COLUMNS; j++) 
    {
        bricks[i][j] = { x: 0, y: 0, alive: 1};
    }
}

function updateCollision() 
{
    for (let i = 0; i < BRICK_ROWS; i++) 
    {
        for(let j = 0; j < BRICK_COLUMNS; j++) 
        {
            if (bricks[i][j].alive === 1 )
            {
                var currentBrick = bricks[i][j]

                //ovdje se za svaku ciglu provjerava nalazi li se lopta unutar njenih dimenzija
                if( ball_pos_x >= currentBrick.x &&  currentBrick.x + BRICK_WIDTH >= ball_pos_x &&  
                    ball_pos_y >= currentBrick.y &&  currentBrick.y + BRICK_HEIGHT >= ball_pos_y )
                {
                    //detektirana kolizija

                    //cigla je unistena
                    currentBrick.alive = 0;

                    //dodaje se jedan bod igracu
                    gameScore++;

                    //provjerava se je li nadmasen high score
                    if(gameScore > highScore) 
                    {
                        highScore = gameScore;
                        localStorage.setItem("highScore", gameScore);
                    }

                    //mijenja se "brzina" lopte u y smjeru kako bi se simuliralo odbijanje od unistene cigle
                    ball_speed_y = -ball_speed_y;

                    //provjerava se je li broj bodova igraca jednak max broju bodova u igrici sto bi znacilo da je igra zavrsena i da je igrac pobijedio
                    if (gameScore === maxScore)
                    {
                        gamePlaying = false;
                        gameWon();
                    }
                
                }
            }
        }
    }

}
 
//funckija koja postavlja (crta) sve cigle na pocetku igre
function drawBricks() 
{
    for (let i = 0; i < BRICK_ROWS; i++) 
    {
        for(let j = 0; j < BRICK_COLUMNS; j++)
        {
            //odredivanje pozicije cigle 
            //vrijednosti 140 i 20 su dodane kao padding na rubovima zaslona
            const brick_pos_x = j * ( BRICK_WIDTH + BRICK_PADDING ) + 140 ;
            const brick_pos_y = i * ( BRICK_HEIGHT + BRICK_PADDING ) + 20;

            bricks[i][j].x = brick_pos_x;
            bricks[i][j].y = brick_pos_y;

            if(bricks[i][j].alive === 1)
            {
                ctx.beginPath();

                ctx.rect(brick_pos_x, brick_pos_y, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.fillStyle = "#F0A202";
    
                ctx.shadowBlur = 2;
                ctx.shadowColor = "#FE621D";
                ctx.shadowOffsetX = 4;
                ctx.shadowOffsetY = 4;
    
                ctx.fill();
    
                ctx.closePath();
            }           
        }
    } 

}

//funkcija koja crta loptu
function drawBall() 
{
    ctx.beginPath();
    ctx.arc(ball_pos_x, ball_pos_y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = '#3FCFDE';

    ctx.shadowBlur = 1;
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fill();
    ctx.closePath();
}

//funkcija koja crta palicu
function drawPaddle() 
{
    paddle_pos_y = (canvas.height - PADDLE_HEIGHT - 1);

    ctx.beginPath();

    ctx.rect(paddle_pos_x, paddle_pos_y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#981D26';

    ctx.shadowBlur = 15;
    ctx.shadowColor = "440E10";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fill();

    ctx.closePath();

}

//funkcija kojom se prikazuje trenutni rezultat i najveci rezultat
function drawScore()
{
    ctx.font = "18px Arial";
    ctx.textAlign = "end";
    ctx.fillText("score: " + gameScore, canvas.width - 10 , 50);
    ctx.fillText("high score: " + highScore, canvas.width - 10 , 75);
}

//funkcija koja upravlja zavrsetkom igre u slucaju kada je igrac izgubio
function gameOver()
{
    //crta se "container" radi bolje vidljivosti podataka
    ctx.shadowBlur = 5;

    bgContainerX = (canvas.width - 600) /2;
    bgContainerY = (canvas.height - 300) / 2;

    ctx.fillStyle = '#FBFBFF';
    ctx.fillRect(bgContainerX, bgContainerY, 600, 300);

    //ovdje se ispisuju potrebni podaci
    ctx.font = "bold 90px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#981D26",
    ctx.fillText("GAME OVER", canvas.width / 2, bgContainerY + 100);

    ctx.shadowColor = "transparent";

    ctx.font = " normal 20px Arial";
    ctx.fillText("your score: " + gameScore, canvas.width / 2, bgContainerY + 160);
    ctx.fillText("high score: " + highScore, canvas.width / 2, bgContainerY + 190);

    ctx.font = "20px Arial";
    ctx.fillText("PRESS SPACE TO PLAY AGAIN", canvas.width / 2, (canvas.height - 300) / 2 + 275 );
    
}

//funkcija koja upravlja zavrsetkom igre u slucaju kada igrac pobijedi
function gameWon()
{
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fontWeight = 800;
    ctx.fillText("Congrats! You won!", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("PRESS SPACE TO PLAY AGAIN", canvas.width / 2, canvas.height / 2 + 100 );
}

//funkcija koja upravlaja ažuriranjem pokreta elemenata u igri
function update() 
{
    if(!gamePlaying) return

    else 
    {
        //mijenja se pozicija lopte kako bi se simuliralo njeno kretanje
        ball_pos_x += ball_speed_x;
        ball_pos_y += ball_speed_y;

        //provjerava se kolizija lopte sa lijevim i desnim rubom zaslona 
        if(ball_pos_x + ball_speed_x  > canvas.width - BALL_SIZE || ball_pos_x + ball_speed_x < BALL_SIZE)
        {
            //lopta se odbija
            ball_speed_x = -ball_speed_x;
        }
        //provjerava se kolizija lopte sa gornjim rubom zaslona 
        if(ball_pos_y + ball_speed_y < BALL_SIZE)
        {
            //lopta se odbija
            ball_speed_y = -ball_speed_y;
        }
        //provjerava se kolizija lopte sa donjim rubom zaslona
        else if(ball_pos_y + ball_speed_y > canvas.height - BALL_SIZE - PADDLE_HEIGHT)
        {
            if (ball_pos_x >= paddle_pos_x - PADDLE_HEIGHT && ball_pos_x <= paddle_pos_x + PADDLE_WIDTH) 
            {
                //slucaj kada lopta dotakne palicu

                //pokusaj definiranja faktora udarca kako odbijanje lopte od palice ne bi uvijek bilo u istom smjeru 
                let hitfactor =  ball_pos_x - paddle_pos_x;
                if (hitfactor > PADDLE_WIDTH * 0.8)
                {
                    ball_speed_x = 4
                }
                else if (hitfactor < PADDLE_WIDTH * 0.4)
                {
                    ball_speed_x = -4;
                }

                ball_speed_y = -ball_speed_y;
            }       
        }
        if (ball_pos_y + ball_speed_y > canvas.height - BALL_SIZE )
        {
            //slucaj kada lopta dotakne pod, a ne palicu - kraj igre
            gamePlaying = false;
            gameOver();
            
        }
        
        //pomak palice na pritisak odgovarajuce tipke
        if (RIGHT && paddle_pos_x + PADDLE_WIDTH + 4 < canvas.width )
        {
            paddle_pos_x += 8;
        }
        else if (LEFT && paddle_pos_x - 4 > 0)
        {
            paddle_pos_x -= 8;
        }
    }
        
}

//funkcija kojom zapocinje igra
function startGame() 
{
    if(gamePlaying)
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawPaddle();
        drawBall();
        drawScore();
        update();
        updateCollision();
        requestAnimationFrame(startGame);
    }
    else
    {
        if (gameScore === maxScore) 
        {
            gameWon();
        } else {
            gameOver();
        }
    }

}

startGame();