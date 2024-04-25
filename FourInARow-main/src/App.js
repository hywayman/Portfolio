import {useState} from "react"

//Note board fills columns first then rows
const maxRows = 6;
const maxColumns = 7;

function Square({value, onSquareClick, squareClass}){
  const [squareColor, setSquareColor] = useState(null);
  if(squareClass !== squareColor && squareColor === null){
    setSquareColor(squareClass)
  }
  return (
    <button className= {"square " + squareClass} onClick={onSquareClick}>
      {value}
    </button>
  );
}

export default function Board() {
  const [blueIsNext, setBlueIsNext] = useState("blue");
  const [squaresValues, setSquaresValues] = useState(Array(maxRows*maxColumns).fill(null));
  const [squaresClass, setSquaresClass] = useState(Array(maxRows*maxColumns).fill(null));
  const [foundSolution, setFoundSolution] = useState(false)
  function handleClick(i, squareIndex) {
    //REMINDER Null is automatically false, if it is anything else its true
    // Returns if a solution has been found, aka a winner has already been decided
    if (foundSolution){
      return;
    }
    const nextSquareValue = squaresValues.slice();
    const nextSquareClass = squaresClass.slice();
    let newPlacedSquare = null;
    if (blueIsNext === "blue"){
      for(let v = ((maxRows*(i+1))-1); v >= (maxRows*i); v--){
        if(!nextSquareValue[v]){
          nextSquareValue[v] = "O";
          nextSquareClass[v] = "blue";
          setBlueIsNext("red")
          newPlacedSquare = v;
          console.log(v);
          break;
        }
      }
    } else if (blueIsNext === "red") {
      for(let v = ((maxRows*(i+1))-1); v >= (maxRows*i); v--){
        if(!nextSquareValue[v]){
          nextSquareValue[v] = "O"
          nextSquareClass[v] = "red";
          setBlueIsNext("blue");
          newPlacedSquare = v;
          console.log(v);
          break;
        }
      }
    }
    
    if (calculateWinner(nextSquareClass, newPlacedSquare)){
      let holder = blueIsNext;
      setBlueIsNext("Winner: " + holder);
      setFoundSolution(true);
      setSquaresValues(nextSquareValue);
      setSquaresClass(nextSquareClass);
      return;
    } else if(calculateTie(nextSquareClass)){
      setBlueIsNext("Tie!");
      setFoundSolution(true);
      setSquaresValues(nextSquareValue);
      setSquaresClass(nextSquareClass);
    }
    setSquaresValues(nextSquareValue);
    setSquaresClass(nextSquareClass);
  }
  
  return (<>
            <div className="status">{blueIsNext}</div>
            {Array(maxRows).fill(null).map((row, index) => (
              <div className="board-row">
                {Array(maxColumns).fill(null).map((column,indexCol) => (
                  <Square key={index+(indexCol*maxRows)} value={squaresValues[index+(indexCol*maxRows)]} onSquareClick={() => handleClick(indexCol,index+(indexCol*maxRows))} squareClass={squaresClass[(index+(indexCol*maxRows))]} />
                ))}
              </div>
            ))}
          </>);
}

function calculateTie(squares){
  for(let i = 0; i < squares.length; i++){
    if(squares[i] === null)
      return false;
  }
  return true;
}

function calculateWinner(squares, index) {
  const diagLeftToRightMod = maxRows + 1;
  const diagRightToLeftMod = maxRows - 1;
  const lines = [
    //Vertical line (straight down)
    [index, index+1, index+2, index+3],
    //Horizontal line
    [index, index+maxRows, index+maxRows*2, index+maxRows*3],
    [index-maxRows, index, index+maxRows, index+maxRows*2],
    [index-maxRows*2, index-maxRows, index, index+maxRows],
    [index-maxRows*3, index-maxRows*2, index-maxRows, index],
    //Diagonal top left to bottom right
    [index, index+diagLeftToRightMod, index+diagLeftToRightMod*2, index+diagLeftToRightMod*3],
    [index-diagLeftToRightMod, index, index+diagLeftToRightMod, index+diagLeftToRightMod*2],
    [index-diagLeftToRightMod*2, index-diagLeftToRightMod, index, index+diagLeftToRightMod],
    [index-diagLeftToRightMod*3, index-diagLeftToRightMod*2, index-diagLeftToRightMod, index],
    //diagonal top right to bottom left
    [index, index+diagRightToLeftMod, index+diagRightToLeftMod*2, index+diagRightToLeftMod*3],
    [index-diagRightToLeftMod, index, index+diagRightToLeftMod, index+diagRightToLeftMod*2],
    [index-diagRightToLeftMod*2, index-diagRightToLeftMod, index, index+diagRightToLeftMod],
    [index-diagRightToLeftMod*3, index-diagRightToLeftMod*2, index-diagRightToLeftMod, index],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d] = lines[i];
    console.log("InWinner")
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d]) {
      console.log("Index: " + index);
      console.log("Found solution: "+ a+ " " + b + " " + c + " " + d);
      return squares[a];
    }
  }
  return null;
}
