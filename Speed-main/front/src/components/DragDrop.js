import React from "react";

import Card from "./Card";
import "../App.css";
import { useState, useEffect } from "react";
import { useDrop } from "react-dnd";

function DragDrop(props) {
  const [dis1, setDis1] = useState([]);
  const [dis2, setDis2] = useState([]);
  const [CardList, setCardList] = useState([]);
  const player = props.player;
  const [drawDeck, setDrawDeck] = useState([]);
  const [noMove, setNoMove] = useState([true]);
  const [slot1, setSlot1] = useState([]);
  const [slot2, setSlot2] = useState([]);

  useEffect(() => {
    //console.log("DRAG AND DROP RERENDERING");
    // I think this is where we will get all of the player data
    // Unpack the game state information
    const { player1, player2, Board } = props.gameData;

    // Access individual properties as needed
    const player1ID = player1.ID;
    const player1Deck = player1.deck;
    const player1DrawDeck = player1.drawDeck;
    const player1Won = player1.uWon;
    const player2ID = player2.ID;
    const player2hand = player2.hand;
    const player2Deck = player2.deck;
    const player2Won = player2.uWon;
    let canPlay = false;

    if (player === "player1") {
    //   console.log(player1.hand.cards);
      setCardList(player1.hand.cards);
      setDrawDeck(player1.drawDeck.cards);
    }
    if (player === "player2") {
      setCardList(player2.hand.cards);
      setDrawDeck(player2.drawDeck.cards);
    }
    

    // setDis1(Board.Slot1.cards[0].value + Board.Slot1.cards[0].suit);
    if (Board.Slot1 && Board.Slot1.cards && Board.Slot1.cards.length > 0) {
      // Set dis1 when Board.Slot1 is set
      setSlot1(Board.Slot1.cards[Board.Slot1.cards.length - 1].value);
      setDis1(
        slot1 +
        // Board.Slot1.cards[Board.Slot1.cards.length - 1].value +
          Board.Slot1.cards[Board.Slot1.cards.length - 1].suit
      );
    }
    // setDis2(Board.Slot2.cards[0].value + Board.Slot2.cards[0].suit);
    if (Board.Slot2 && Board.Slot2.cards && Board.Slot2.cards.length > 0) {
      // Set dis2 when Board.Slot2 is set
      setSlot2(Board.Slot2.cards[Board.Slot2.cards.length - 1].value);
      setDis2(
        slot2 + 
        // Board.Slot2.cards[Board.Slot2.cards.length - 1].value +
          Board.Slot2.cards[Board.Slot2.cards.length - 1].suit
      );
    }
    

    for(let i = 0; i < CardList.length; i++){
        let card = CardList[i];
        let cardValue = parseInt(card.value, 10);
        let slot1int = parseInt(slot1, 10);
        let slot2int = parseInt(slot2, 10);
        
        if(
            slot1int === cardValue + 1 ||
            slot1int === cardValue - 1 ||
            slot2int === cardValue + 1 ||
            slot2int === cardValue - 1 
        ){
            canPlay = true;
            break;
        }
    }
    setNoMove(!canPlay);


  }, [
    props.gameData,
    CardList,
    dis1,
    dis2,
    props.gameData.player1.hand.cards,
    props.gameData.player2.hand.cards,
  ]);

  const [{ isOverDis1 }, drop1] = useDrop(
    () => ({
      accept: "image",
      drop: (item) => addCardToDis1(item.value, item.suit, item.id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [CardList]
  );
  const [{ isOverDis2 }, drop2] = useDrop(
    () => ({
      accept: "image",
      drop: (item) => addCardToDis2(item.value, item.suit, item.id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [CardList]
  );

  const addCardToDis1 = (value, suit, id) => {
    console.log(
      `Player ${player} played card ${value}${suit} id: ${id} onto dis1.`
    );
    props.playHand(player, "Slot1", { value: value, suit: suit });
  };
  const addCardToDis2 = (value, suit, id) => {
    console.log(
      `Player ${player} played card ${value}${suit} id: ${id} onto dis2.`
    );
    props.playHand(player, "Slot2", { value: value, suit: suit });
  };

  const handleClick = () => {
    console.log(`Player ${player} wants to draw a card`);
    props.drawCard(player);
  }

  return (
    <>
      <div className="game-board">
        <div className="top-row">
          <div className="card-spot facedown">
            <img className="Cards" src="../Cards/00.png" />
          </div>
          <div className="card-spot face-up" ref={drop1}>
            <img src={`../Cards/${dis1}.png`} />
          </div>
          <div className="card-spot face-up" ref={drop2}>
            <img src={`../Cards/${dis2}.png`} />
          </div>
          <div className="card-spot face-down">
            <img className="Cards" src="../Cards/00.png" />
          </div>
          { noMove ? (
              <button onClick={handleClick}>Draw Card</button>  
            ):(
                <div></div>
            )}
        </div>
        <div>Your Hand</div>
        <div className="midd-row">
          <div className="Cards">
            {CardList.map((card, index) => {
              return <Card value={card.value} suit={card.suit} id={index} />;
            })}
          </div>
        </div>
        <div className="bottom-row">
          <div className="card-spot face-down">
            <div className="deck-info">Cards Left: {drawDeck.length}</div>
            <div className="card-image-container">
                {drawDeck.length > 0 ? (
                    <img className="Cards" src="../Cards/00.png" />
                ) : (
                    <img className="noCards" src="../Cards/noCard.jpg"  />
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DragDrop;
