import Stage0 from "../../src/assets/Stage0.jpg";
import Stage1 from "../../src/assets/Stage1.jpg";
import Stage2 from "../../src/assets/Stage2.jpg";
import Stage3 from "../../src/assets/Stage3.jpg";
import Stage4 from "../../src/assets/Stage4.jpg";
import Stage5 from "../../src/assets/Stage5.jpg";
import Stage6 from "../../src/assets/Stage6.jpg";
import {useState, useEffect, useRef} from "react";

const GameForm = (props) => {
  const gameMax = 6;
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const userGuess = useRef();
  const [gameState,setGameState] = useState(0);
  const [hangImage, setHangImage] = useState(Stage0);
  const gameStateArray = [Stage0,Stage1,Stage2,Stage3,Stage4,Stage5,Stage6]
  const [guessesLeft, setGuessesLeft] = useState(6);
  const [word, setWord] = useState([]); // RH This is the word variable
  const [hangState, setHangState] = useState(0);
  const [message, setMessage] = useState(0);

  // RH This gets the guess word the first time the page loads
  useEffect(() => {
    getWord(); 
  }, []);


  // KW Not sure if this is needed. there is no "data.Startword"
  // RH This is how the guess word is gathered the first time
  const getWord = async () => {

    try {
      const response = await fetch("http://localhost:5000/getSession", {
        method: "GET",
        credentials: "include",
      });
      
      const data = await response.json();
      console.log(data.startWord);
      setWord(data.startWord);
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  }

  const onSubmitHandler = async () => {
    setGameStatus("");

    let newGuessesLeft = guessesLeft;
    let newHangState = hangState;

    for(let i = 0; i < guessedLetters.length; i++){
      if(userGuess.current.value.toUpperCase() === guessedLetters[i]){
        setGameStatus("Letter already guessed");
        return;
      }
    }
    // RH This is to connect to the checkGuess route
    try {
      const response = await fetch("http://localhost:5000/checkGuess",{
        method: "POST",
        headers: {"Content-Type": "application/json",},
        credentials: "include",
        body: JSON.stringify({"guess": userGuess.current.value})
      });

      const data = await response.json();
      let validGuess = data.validGuess;
      let uWon = data.uWon;
      let uloss = data.gameOver;
      let tarWord = data.tarWord;
      let tempGuessedLetters = guessedLetters;
      tempGuessedLetters = [...tempGuessedLetters, userGuess.current.value.toUpperCase()];
      setGuessedLetters(tempGuessedLetters);
      setWord(data.guessWord)
      
      if (!validGuess) {
        newGuessesLeft = newGuessesLeft -1;
        newHangState = newHangState + 1;
        
      }
      
      if(uWon){
        setMessage("Congragulations! You Win!");
        gameOver();
      }
      if(newGuessesLeft === 0){
        setMessage(`Game Over! The correct word is ${tarWord}`)
        gameOver();
      }
      

    } catch (error) {
      console.error("Error checking authentication:", error);
    }
    setHangState(newHangState);
    setGuessesLeft(newGuessesLeft);
    setHangImage(gameStateArray[newHangState]);
  }
  
  const gameOver = async () =>{
    const timer = setTimeout(() => {  
      props.endGame();
    }, 5000);
    return () => clearTimeout(timer);
  }

  return (
  <>
    <h1>Hanged Man!</h1>
    <div><img src={hangImage} alt="Hang Man"/></div>
    <div>Current Word: {word.join(' ')}</div>
    <div>Guessed Letters: {guessedLetters}</div>
    <div>Tries Left: {guessesLeft}</div>
    <div>
        <label>Guess a Letter:</label>
        <input type="text" maxLength="1" ref={userGuess} style={{textTransform: "uppercase"}}/>
    </div>
    <div><b>{gameStatus}</b></div>
    <button onClick={onSubmitHandler}>Submit Guess!</button>
    <div>{message}</div>
  </>);
}

export default GameForm