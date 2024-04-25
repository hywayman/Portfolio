import "./App.css";
import React from "react";
import {useState, useRef} from "react";
import StartGame from "./components/StartGame";
import GameForm from "./components/GameForm";
import HighScore from "./components/HighScore"

// We use Route in order to define the different routes of our application

 const App = () => {
  const [startGame, setStartGame] = useState(false);
  const [endGame, setEndGame] = useState(false);

  const updateStartGame = (value) => {
      setStartGame(value);
  }

  const updateEndGame = (value) => {
    setEndGame(value);

  }

 return (
   <div>
    {!startGame ? <StartGame beginGame={() => updateStartGame(true)} /> : <></>}
    {startGame && !endGame ? <GameForm endGame={() => updateEndGame(true)}/> : <></>}
    {endGame ? <HighScore /> : <></>}
    
      
   </div>
 );
};
 export default App;