import classes from "./StartGame.module.css";
import {useState, useRef} from "react";

const StartGame = (props) => {
    const playerName = useRef();
    const wordLength = useRef();
    const [statusCode, setStatusCode] = useState("");

    const onSubmitHandler = async (event) =>{
        event.preventDefault();
        setStatusCode("");

        const response = await fetch("http://localhost:5000/add", {
            method: "POST",
            headers: {"Content-Type": "application/json",},
            credentials: "include",
            body: JSON.stringify({"userName": playerName.current.value,"length":Number(wordLength.current.value)})
        });

        const result = await response.json();
        if(!result.bcheck || result.status === 404 || result.status === 500){
            setStatusCode("Error starting game!");
        } else {
            console.log("GameStarted");
            props.beginGame();
        }
        
    };

    return (
    <>
        <form onSubmit={onSubmitHandler}>
            <div className={classes.title}>Hangman Game!</div>
            <div className={classes.controlHolder}>
                <label htmlFor="name">Player Name:</label>
                <input type="text" ref={playerName}/>
            </div>
            <div className={classes.controlHolder}>
                <label htmlFor="wordLength">Word Length:</label>
                <select name="wordLength" id="wordLength" ref={wordLength}>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                </select>
            </div>
            <div>
                <button>Start Game</button>
            </div>
            <div className={classes.title}>{statusCode}</div>
        </form>
    </>);

}

export default StartGame;