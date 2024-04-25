const iSuites = ["♠", "♥", "♦", "♣"]; // image version
const cSuites = ["H", "D", "C", "S"]; //text version
const cValues = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];

class Deck {
  constructor(cards = createDeck()) {
    this.cards = cards;
  }

  get numOfCards() {
    return this.cards.length;
  }

  shuffle() {
    for (let i = 0; i < this.numOfCards; i++) {
      const randomIndex = Math.ceil(Math.random() * (i + 1));
      const temp = this.cards[randomIndex];
      this.cards[randomIndex] = this.cards[i];
      this.cards[i] = temp;
    }
  }


  drawCard() {
    // Removes the top card from the deck and returns it
    return this.cards.pop();
  }
  
  // Take from top of deck
  pop() {
    if (this.numOfCards === 0) {
      return null; // Return null if no cards left
    }
    return this.cards.shift(); // Use pop() to get the last card in the deck
  }

  // Add card to top of pile
  push(card) {
    this.cards.push(card);
  }
}

class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
  }
}

function createDeck() {
  return cSuites.flatMap((suit) =>
    cValues.map((value) => new Card(value, suit))
  );
}

module.exports = Deck;