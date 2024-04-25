import React from "react";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DragDrop from "./components/DragDrop";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd",
  },
  transports: ["websocket"],
});

//this socket is working and will listen for the gamestate Json

function App() {
  const [opponent, setOpponent] = useState();
  // const [player, setPlayer] = useState()
  //const [playerID, setPlayerID] = useState();
  const [gameStatus, setGameStatus] = useState();
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(false);
  const [endGameMessage, setEndGameMessage] = useState([])
  const [playerName, setPlayerName] = useState([]);
  const [showForm, setShowForm] = useState(true);
  
  const [gameState, setGameState] = useState({
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
  });

  useEffect(() => {
    socket.on("waitingPlayer", (status) => {
      //console.log(status);
      if (status.status) {
        setGameStatus("Waiting on Player");
        setGameStarted(false);
      } else {
        setGameStatus("Connecting to player");
        setGameStarted(false);
        loadingGame();
      }
    });

    socket.on("player", (player) => {
      //console.log("Player designated: " + player.player);

      setOpponent(player.player);
      //console.log("Player ID: " + opponent);
    });

    socket.on("gamestate", (gamestate) => {
      const newGameState = gamestate;
      let p1Winner = newGameState.player1.uWon;
      let p2Winner = newGameState.player2.uWon;
      console.log(`p1Winner ${p1Winner}, p2Winner ${p2Winner}`)
      console.log("Game state updated:", gamestate);
      // if ( opponent === "player1") {
      //   setWinnerMessage(p1Winner);
      // } else {
      //   setWinnerMessage(p2Winner);
      // }
      setGameStarted(true);
      setGameState(newGameState);
      if(p1Winner){
        setWinner("player1");
      }else if (p2Winner){
        setWinner("player2");
      }else {
        setWinner(false);
      }
      
    });

    socket.on("gameMessage", (mssg) => {
      if (mssg.message === "game started") {
        return;
      }
      setGameStarted(mssg.status);
      setGameStatus(mssg.message);
    });

    socket.emit("startGame");
    
    socket.on("endmessage", (data) => {
      console.log(`This is the endmessage data ${data}`);

      if(opponent === "player1") {
        setEndGameMessage(data)
      }else{
        setEndGameMessage(data)
      }
      //here is some stuff

    })
    
    return () => {
      socket.off("waitingPlayer");
      socket.off("player");
      socket.off("gamestate");
      socket.off("gameMessage");
    };


  }, []);

  const playHand = (source, destination, card) => {
    socket.emit("playHand", {
      source: source,
      destination: destination,
      card: card,
    });
    setGameStatus("Played Card: " + card.value + card.suit);
  };

  const loadingGame = () => {
    setGameStarted(false);
    const timer = setTimeout(() => {
      setGameStatus("Starting game now");
      setGameStarted(true);
    }, 5000);
    return () => clearTimeout(timer);
  };

  const drawCard = (player) => {
    socket.emit("stalemate", {player: player})
  }

  const handlePlayerNameSubmit = (e) => {
    e.preventDefault();
    setShowForm(false);
    console.log(opponent);
    socket.emit('updateDatabase', {name: playerName, player: opponent});
    if(opponent === "player1"){
      socket.emit('getHS', {name: playerName, ID: gameState.player1.ID, player: opponent});
    }else{
      socket.emit('getHS', {name: playerName, ID: gameState.player2.ID, player: opponent});
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1>Speed Card Game</h1>
        {gameStarted ? <div>This worked</div> : <></>}
        <h1>Status: {gameStatus}</h1>
        <div>This is {opponent}</div>

        {gameStarted && !winner ? (
          <DragDrop
            gameData={gameState}
            playHand={playHand}
            player={opponent}
            key={gameState}
            drawCard={drawCard}
          />
        ) : (
          <></>
        )}
        {winner ? (
          <div>
          <h1>The winner is {winner}</h1>
          <h2>{endGameMessage}</h2>
          { showForm ? (
            <form onSubmit={handlePlayerNameSubmit}>
              <label>
                Enter your name:
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </label>
              <button type="submit">Submit</button>
            </form>
          ) : (
            <></>
          )}
          </div>
        ) : (
          <></>
        )}
      </div>
    </DndProvider>
  );
}

export default App;
