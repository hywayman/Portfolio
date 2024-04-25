const express = require("express");
// const mongoose = require('mongoose');
const cors = require("cors");
const dotenv = require("dotenv");
const socketio = require("socket.io");

const app = express();
const server = require("http").Server(app);
const io = socketio(server);

dotenv.config();
const port = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world");
});

// Start server
//this is where you add the IP to listen
//server.listen(port, '0.0.0.0', () => {
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// ----------------------------------MongoDB------------------------------------

//used to connect express to DB
const app2 = express();
require("dotenv").config({ path: "./config.env" });
const port2 = process.env.PORT || 4000;
app2.use(cors());
app2.use(express.json());
app2.use(require("./routes/record"));
const dbo = require("./db/conn");
//this is where you add the IP to listen
//app2.listen(port2, '0.0.0.0', () => {
app2.listen(port2, () => {
  dbo.connectToServer(function (err) {
    if (err) {
      console.error(err);
    }
  });
  console.log(`Server is running on port: ${port2}`);
});

// -------------------------------------------------------------------------------
//is a a game running
let gamerunning = false;
let connectedPlayers = 0;
let playerIDs = { player1ID: "", player2ID: "" };
let playerCounter = 0;
let player1DrawRequest = false;
let player2DrawRequest = false;
let p1Name, p2Name;
let gamestate = {
  player1: {
    ID: "",
    hand: [],
    deck: [],
    drawDeck: [],
    uWon: false,
  },
  player2: {
    ID: "",
    hand: [],
    deck: [],
    drawDeck: [],
    uWon: false,
  },
  Board: {
    Slot1: [],
    Slot2: [],
  },
};

// Socket.IO
io.on("connection", (socket) => {
  if (playerCounter === 0) {
    playerIDs.player1ID = socket.id;
    playerCounter++;
    console.log(`Player 1 connected with ID: ${socket.id}`);
    console.log(`Players num:` + playerCounter);
    //io.to(playerIDs.player1ID).emit("player", {player: "player1"});
  } else if (playerCounter === 1) {
    playerIDs.player2ID = socket.id;
    playerCounter++;
    console.log(`Player 2 connected with ID: ${socket.id}`);
    console.log(`Players num:` + playerCounter);
    //emitGameMessage({ status: true, message: "Players connected" });
    //io.to(playerIDs.player2ID).emit("player", {player: "player2"});

    emitGameMessage({ status: false, message: "Players connected" });
  }

  console.log(`Socket ${socket.id} connected`);
  connectedPlayers++;
  console.log(`Players num:` + playerCounter);

  console.log("Connected Players: " + connectedPlayers);
  //sends player to front end one the socket they are
  socket.emit("player", {
    player: playerCounter === 1 ? "player1" : "player2",
  });

  socket.on("startGame", (message) => {
    if (connectedPlayers > 1) {
      io.emit("waitingPlayer", { status: false });
      emitGameMessage({ status: true, message: "game started" });

      //ensure that only one gamestate is created
      if (!gamerunning) {
        //Pass PlayerIDs, start/setup game then emit to players
        startGame(playerIDs.player1ID, playerIDs.player2ID);
        gamerunning = true;
      }

      //emit initial gamestate --------------------------------------------- GAME START --------------------------
      emitUpdategame();
    } else {
      console.log("Emitting");
      io.emit("waitingPlayer", { status: true });
    }
  });

  //Play a card from the players hand to the board
  //source is player1 or player2
  //destination is Slot1 or Slot2
  //card is the card object that is being played gamestate.player1.hand.cards[0]
  socket.on("playHand", (message) => {
    const { source, destination, card } = message;
    //if play us valid and completed successfully check for win
    if (playCard(source, destination, card)) {
      isWin(source);
      emitUpdategame();
      player1DrawRequest = false;
      player2DrawRequest = false;
      console.log("playCard call")
      console.log(`p1DR is: ${player1DrawRequest} and p2DR is: ${player2DrawRequest}`);
    } else {
      io.to(socket.id).emit("gameMessage", {
        status: true,
        message: "Invalid Play",
      });
    }

    //this could be used to emit gamestate even if there are no changes
    //emitUpdategame();
  });

  //flip cards due to a stalemate
  socket.on("stalemate", (message) => {
    const source = message.player;
    if (source === "player1"){
      player1DrawRequest = true;
    } else if (source === "player2"){
      player2DrawRequest = true;
    }
   
    console.log("stalemate call")
    console.log(`p1DR is: ${player1DrawRequest} and p2DR is: ${player2DrawRequest}`);
    if(player1DrawRequest && player2DrawRequest){
      player1DrawRequest = false;
      player2DrawRequest = false;
      flip();
      emitUpdategame();
    }
  });

  /*   //reshuffle and redeal existing play slot and deck cards
  socket.on("reShuffle", (message) => {
    reShuffle();
    emitUpdategame();
  }); */

  // database update on win
  socket.on("updateDatabase", async (data) => {
    console.log("updateDatabase has been called")
    
    if(data.player === "player1"){
      p1Name = data.name;
    }else{
      p2Name = data.name;
    }
    console.log(`${p1Name} ${p2Name}`)
    if(p1Name && p2Name){
      try {
        await updateDataBase( p1Name, p2Name);
        socket.emit("updateSuccess", "Database updated successfully");
      } catch (err) {
        socket.emit("updateError", "Failed to update database");
        console.error("Error updating database:", err);
      }
    }
  });

  // getDB data for user
  socket.on("getHS", async (data) => {
    console.log(`getHS has been called`);
    if(data.player === "player1"){
      p1Name = data.name;
      console.log(`p1Name is ${p1Name}`);
    }else{
      p2Name = data.name;
      console.log(`p2Name is ${p2Name}`);
    }

    if(p1Name && p2Name){
      try {
        const resultPlayer1 = await getHS(p1Name);
        const resultPlayer2 = await getHS(p2Name);
        if (data.ID === gamestate.player1.ID) {
          socket.emit("endmessage", resultPlayer1);
        } else if (data.ID === gamestate.player2.ID) {
          socket.emit("endmessage", resultPlayer2);
        }
      } catch (err) {
        socket.emit("endmessage", "Failed to query database");
        console.error("Error querying database:", err);
      }
    }
  });

  socket.on("disconnect", () => {
    connectedPlayers--;
    playerCounter--;
    //clears game state
    reset();
    gamerunning = false;

    emitGameMessage({ status: false, message: "Disconnected player" });
    io.emit("waitingPlayer", { status: true });

    console.log(`Socket ${socket.id} disconnected`);
    console.log("Connected Players: " + connectedPlayers);
  });
});

function emitGameMessage(state) {
  io.emit("gameMessage", state);
}

//Sednd the gamestate to the players
function emitUpdategame() {
  /*   io.to(playerIDs.player1ID).emit('gamestate', gamestate);
  io.to(playerIDs.player2ID).emit('gamestate', gamestate); */
  //console.log(gamestate);
  io.emit("gamestate", gamestate);
}

async function updateDataBase(player1Name, player2Name) {
  try {
    const db_connect = await dbo.getDb();

    const player1CardsLeft =
      gamestate.player1.hand.cards.length + gamestate.player1.deck.cards.length;
    const player2CardsLeft =
      gamestate.player2.hand.cards.length + gamestate.player2.deck.cards.length;

    const messageForPlayer1 = gamestate.player1.uWon
      ? `You won, and your opponent has ${player2CardsLeft} cards left.`
      : `You lost, and you had ${player1CardsLeft} cards left.`;

    const messageForPlayer2 = gamestate.player2.uWon
      ? `You won, and your opponent has ${player1CardsLeft} cards left.`
      : `You lost, and you had ${player2CardsLeft} cards left.`;

    // Create records
    const recordForPlayer1 = {
      playerID: gamestate.player1.ID,
      Name: player1Name,
      Result: messageForPlayer1,
      playedAt: new Date(),
    };

    const recordForPlayer2 = {
      playerID: gamestate.player2.ID,
      Name: player2Name,
      Result: messageForPlayer2,
      playedAt: new Date(),
    };

    // Insert or update records in the database
    //this only takes one record for each name
    await db_connect
      .collection("Game")
      .updateOne(
        { Name: player1Name },
        { $set: recordForPlayer1 },
        { upsert: true }
      );

      await db_connect
      .collection("Game")
      .updateOne(
        { Name: player2Name },
        { $set: recordForPlayer2 },
        { upsert: true }
      );

    console.log("Database update for both players completed successfully.");
  } catch (err) {
    console.error("Failed to update database for players", err);
    throw err;
  }
}

async function getHS(playerName) {
  try {
      const db_connect = await dbo.getDb();
      const result = await db_connect.collection("Game").findOne({ Name: playerName });
      console.log('getHS Results: ', result);
      return result ? result.Result : "No record found";
    } catch (err) {
      throw err;
    }
};

//-------------------------------------  GAME LOGIC    -------------------------------------------

const Deck = require("./Deck.js");

let player1hand;
let player2hand;
let player1Deck;
let player2Deck;
let player1DrawDeck;
let player2DrawDeck;
let slot1;
let slot2;

function startGame(player1ID, player2ID) {
  //create deck and shuffle it
  const deck = new Deck();
  deck.shuffle();
  //deal the deck to the players
  Deal(deck, player1ID, player2ID);
}

function Deal(deck, player1ID, player2ID) {
  player1hand = new Deck(deck.cards.slice(0, 5));
  player2hand = new Deck(deck.cards.slice(5, 10));
  player1Deck = new Deck(deck.cards.slice(10, 15));
  player2Deck = new Deck(deck.cards.slice(15, 20));
  player1DrawDeck = new Deck(deck.cards.slice(20, 35));
  player2DrawDeck = new Deck(deck.cards.slice(35, 50));
  slot1 = new Deck(deck.cards.slice(50, 51));
  slot2 = new Deck(deck.cards.slice(51, 52));
  /*   console.log(slot1);
  console.log(slot2); */

  gamestate = {
    player1: {
      ID: player1ID,
      hand: player1hand,
      deck: player1Deck,
      drawDeck: player1DrawDeck,
      uWon: false,
    },
    player2: {
      ID: player2ID,
      hand: player2hand,
      deck: player2Deck,
      drawDeck: player2DrawDeck,
      uWon: false,
    },
    Board: {
      Slot1: slot1,
      Slot2: slot2,
    },
  };

  // -------------------------------------------- UNIT TESTING ONLY ----------------------------------------------------

  /*   //check initial state
  console.log('Starting state:', JSON.stringify(gamestate, null, 2)); */

  /*   //reshuffel is working
  console.log("reShuffle: ")
  reShuffle();  */

  /*   //Flip is working
  flip(); */

/*   //updateDatabase is working
  updateDataBase("Test1", "Test2"); */

/*   //updateDatabase is working
  getHS("Test1");
  getHS("Test2") */

  /*   //Validation of move is working
  validatePlay("Slot1", gamestate.player1.hand.cards[2]); */

  /*   //Play card is working with validation
  playCard("player1", "Slot1", gamestate.player1.hand.cards[2]);
  //console.log('playedCard state: ' , JSON.stringify(gamestate, null, 2)) */

  /*    //DrawingToHand is working, to be used with play valid play
  drawCardToHand('player1');
  //console.log('DrawCard  state: ' , JSON.stringify(gamestate, null, 2)) */

  //-----------------------------------------------------------------------------------------------------------------------
}

// Reset gamestate to its initial, empty state
function reset() {
  gamestate = {
    player1: {
      ID: "",
      hand: [],
      deck: [],
      drawDeck: [],
      uWon: false,
    },
    player2: {
      ID: "",
      hand: [],
      deck: [],
      drawDeck: [],
      uWon: false,
    },
    Board: {
      Slot1: [],
      Slot2: [],
    },
  };
}

// Function to update the game state based on a move
function playCard(source, destination, card) {
  if (!source || !destination || !card || gamestate.player1.uWon || gamestate.player2.uWon ) {
    return false;
  } else {
    //find index
    /*     const cardIndex = gamestate[source].hand.cards.findIndex(c => c.value === card.value && c.suit === card.suit);
    console.log("Found card index:", cardIndex); */

    const cardIndex = gamestate[source].hand.cards.findIndex((c, index) => {
      const isMatch = c.value === card.value && c.suit === card.suit;
      console.log(`Index ${index}:`, c, `Searching for:`, card, `Match:`, isMatch );
      return isMatch;
    });

    console.log("play card: ", card);
    console.log("cardIndex: ", cardIndex);
    console.log("destination: ", destination);
    console.log("source: ", source);

    if (cardIndex !== -1 && validatePlay(destination, card)) {
      //place played card on destination pile
      gamestate.Board[destination].push(card);

      if(gamestate[source].drawDeck.numOfCards === 0)
      {
        // Remove the card from the hand using its index
        gamestate[source].hand.cards.splice(cardIndex, 1);
      }
      else{
        //console.log("Hand before replacement:", gamestate[source].hand.cards);
        drawCardToHand(source, cardIndex);
        //console.log("Hand after replacement:", gamestate[source].hand.cards);
      }
      
      return true;
    }
  }
  return false;
}

//draw cards to users hand after playing a card
function drawCardToHand(source, cardIndex) {
  if (gamestate[source].drawDeck.numOfCards > 0) {
    const newcard = gamestate[source].drawDeck.drawCard();
    // Add the drawn card to the player's hand
    gamestate[source].hand.cards[cardIndex] = newcard;
    //console.log(gamestate[player].hand);

    return true; // Indicate success
  } else {
    console.log("Draw deck is empty");
    return false; // Indicate failure
  }
}

//validate the play
function validatePlay(destination, card) {
  console.log("validation card:", card);

  // Ensure the destination is one of the valid board slots
  if (destination !== "Slot1" && destination !== "Slot2") {
    console.log("Invalid destination");
    return false;
  }

  // Get the top card of the destination pile
  const destinationPile = gamestate.Board[destination].cards;
  const topCard =
    destinationPile.length > 0
      ? destinationPile[destinationPile.length - 1]
      : null;

  if (!topCard) {
    return false;
  }

  // Convert card values to numbers for comparison
  const cardValue = parseInt(card.value, 10);
  const topCardValue = parseInt(topCard.value, 10);

  /*  //test values for logic
   const cardValue = 1;
  const topCardValue = 13;   */

  console.log("cardValue: " + cardValue);
  console.log("topCardValue: " + topCardValue);

  // Check if the card is one value higher or lower than the top card or if a value of 01 beats 13
  const isValidMove =
    Math.abs(cardValue - topCardValue) === 1 ||
    (cardValue === 1 && topCardValue === 13) ||
    (cardValue === 13 && topCardValue === 1);

  console.log("isValidMove: " + isValidMove);
  return isValidMove;
}

//this is uese to draw a card from one array and move another array
function flip() {
  if (
    gamestate.player1.deck.numOfCards === 0 &&
    gamestate.player2.deck.numOfCards === 0
  ) {
    console.log("One or both decks are empty");
    reShuffle();
  } else {
    let flipCard1 = gamestate.player1.deck.drawCard();
    let flipCard2 = gamestate.player2.deck.drawCard();
    gamestate.Board.Slot1.push(flipCard1);
    gamestate.Board.Slot2.push(flipCard2);
  }
}

//redeal the slot1/2 and decks if the players are out of cards
function reShuffle() {
  if (
    gamestate.player1.deck.numOfCards === 0 &&
    gamestate.player2.deck.numOfCards === 0
  ) {
    // Creating a new Deck by combining the cards from Slot1 and Slot2
    const newDeck = new Deck([...gamestate.Board.Slot1.cards, ...gamestate.Board.Slot2.cards]);

    newDeck.shuffle();
    reDeal(newDeck);
  } else {
    console.log("Deck is not empty");
  }
}

//redeal the slot1/2 and decks if the players are out of cards
function reDeal(newDeck) {
  //deal first cards to game slot
  let reslot1 = new Deck(newDeck.cards.slice(0, 1));
  let reslot2 = new Deck(newDeck.cards.slice(1, 2));

  //find midle of the remaining deck and deal it out
  let middle = Math.ceil(newDeck.numOfCards / 2);
  let replayer1Deck = new Deck(newDeck.cards.slice(2, middle + 1));
  let replayer2Deck = new Deck(newDeck.cards.slice(middle + 1, newDeck.numOfCards));

  gamestate = {
    ...gamestate,
    player1: {
      ...gamestate.player1,
      deck: replayer1Deck,
    },
    player2: {
      ...gamestate.player2,
      deck: replayer2Deck,
    },
    Board: {
      ...gamestate.Board,
      Slot1: reslot1.cards,
      Slot2: reslot2.cards,
    },
  };
}

//check for a winner
function isWin(source) {
  //console.log(`Checking Hand size is ${gamestate[source].hand.numOfCards}`);

  // Check if players hand is empty
  if (gamestate[source].hand.numOfCards === 0) {
    gamestate[source].uWon = true;
    console.log(`Player ${source} wins!`);
    return true;
  }

  return false;
}
