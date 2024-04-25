const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
const randomWord = require('random-word');


//------------------------Working -------------------------------------------------------
// This section will help you create a new record. and create random number
recordRoutes.route("/add").post(async function (req, res) {
  try {
    const db_connect = await dbo.getDb();
    const { userName, length} = req.body;

    //selects word of the given length
//    let random = Math.floor(Math.random() * 3) + 1;
    const emptyArr = new Array(length).fill("_");
    
    //static list word generation
/*     let Tarword = await db_connect.collection("word").findOne({ Length : length, Number : random });
    const arr = Tarword.Word.split(''); */


    // Generate a random word of the given length using the random-word library
    const generateRandomWord = (length) => {
      let word = randomWord();
      while (word.length !== length) {
        word = randomWord();
      }
      return word;
    };

    
    const randomWordGenerated = generateRandomWord(length).toUpperCase(); 
    
    const ranArr = randomWordGenerated.split(''); 
    console.log('randomWordGenerated:' + randomWordGenerated);
    console.log('ranArr:' + ranArr);


     
    const player = {
      userName: userName,
      length: length,
      guess : emptyArr,
      //tar : arr,
      tar: ranArr,
      uWon: false,
      validGuess: false,
      numGuesses: 0,
    }

    // Save user to database
    const result = await db_connect.collection("Player").insertOne(player);
    const insertedId = result.insertedId;

    req.session.userName = player.userName;
    req.session.length = player.length;
    req.session.uWon = player.uWon;
    req.session.startWord = player.guess;
  
    console.log('userName:' + userName);
    console.log('Length:' + length);
    //console.log('random:' + random);
    //console.log('Tarword:' + Tarword);
    console.log('emptyArr:' + emptyArr);
    //console.log('tar:' + arr);
    console.log('tar:' + ranArr);

  
    //use navigate instead of bcheck to redirect to success page
    res.json({ bcheck: (insertedId ? true : false) });
    //res.redirect('/front/components/success');
  } catch (err) {
    res.status(500).json({ message: 'Route /add failed', error: err.message });
  }
});



recordRoutes.route("/checkGuess").post(async function (req, res){
  try{
    const db_connect = await dbo.getDb();
    const {guess} = req.body;
    const upperGuess = guess.toUpperCase();
    console.log(`The guess from req is: ${guess}`)
    const userName = req.session.userName;
    const player = await db_connect.collection("Player").findOne({userName});
    const length = player.length
    const tar = player.tar
    let guessWord = player.guess
    let uWon = false;
    let gameOver = false;
    let validGuess = false;
    let counter = 0;
    let numGuesses = player.numGuesses + 1;
    let guessCheck = 0;

    console.log(`The target word is ${tar}`);
    console.log(`The first letter of the target word is ${tar[0]}`);
    console.log(`The guess was ${guess}`);
    console.log(`The upper guess is ${upperGuess}`);
    console.log(`The length is ${tar.length}`);
    
    //guess check
    for (let i = 0; i < length; i++ ){
      console.log("guess check started");
      console.log(`Compairing ${upperGuess} with ${tar[i]}`);      
      if(upperGuess == tar[i]){  //check if the guess is the same as a char in the array
        guessWord[i] = upperGuess; //add guess to the word to display
        guessCheck++;
      }
    }
    //guess state
    validGuess = guessCheck > 0;

    //win state
    guessWord.forEach(element => {
      if(player.tar.includes(element)){
        counter ++;
      }
    });
    //win check
    if (counter === length) uWon = true;
      
    //loose check
    if(numGuesses >= 5) gameOver = true;
    
    console.log(`The word was ${player.tar}`);
    console.log(`The updated word is ${guessWord}`);
    console.log(`Was the guess valid? ${validGuess}`);
    console.log(`Is the game won? ${uWon}`);
    
    await db_connect.collection("Player").updateOne(
      {userName: userName},
      {
        $set: {
          guess: guessWord,
          validGuess: validGuess,
          numGuesses: numGuesses,
          uWon: uWon
        }
      }
    );
    
    if(gameOver){
      res.json({ message: "Guess checked successfully", guessWord: guessWord, validGuess: validGuess, uWon: uWon, gameOver: gameOver, tarWord: tar,})
    }else{
      res.json({ message: "Guess checked successfully", guessWord: guessWord, validGuess: validGuess, uWon: uWon, gameOver: gameOver,})
    }

  } catch (err) {
      res.status(500).json({ message: 'Route /CheckGuess failed', error: err.message });
    }
  }); 


  recordRoutes.route("/HighScore").get(async function (req, res) {
    try {
      const db_connect = await dbo.getDb();
      const { userName, length} = req.body;
      // Query for a record with the provided username
      const result = await db_connect.collection("Player").find({}).toArray();
  
      // username does not exist
      if (!result) 
      {
        return res.status(404).json({ message: 'Data not found' });
      }

      // Filter records where uWon is greater than 0
      const filteredRecords = result.filter(record => record.uWon > 0, record => record.length = length);
        
      // Sort records by numGuess in ascending order
      filteredRecords.sort((a, b) => a.numGuesses - b.numGuesses);

      // Get the first ten records
      const firstTenRecords = filteredRecords.slice(0, 10);
      
      res.json(firstTenRecords);
    
    } catch (err) {
      res.status(500).json({ message: 'Route /HighScore failed', error: err.message });
    }


  });










//-------------------------Sessions code-------------------------------

// handles session routing
recordRoutes.route("/setSession").get(async function (req, res) {
  console.log("Session is: " + req.session.userName);
  if (!req.session.userName) {
    //req.session.userName = "test";
    console.log("Session set");
  } else {
    console.log("Session already existed");
  }
  res.json("{}");
});


recordRoutes.route("/getSession").get(async function (req, res) {

  if (!req.session.userName) {

    res.json({message: "No user"});
  } else {

    res.json({startWord: req.session.startWord});
  }
  
});




//check to see if the session exists, returns loggedin status
recordRoutes.route("/checkSession").get(async function (req, res) {
  try {
    
  // Check if the user is authenticated
  if (req.session && req.session.userName) {
    // User is authenticated, send back the profile data
    console.log("A seeeion: " + req.session);
    console.log("A User is: " + req.session.userName);
    console.log("A Logged in: " + req.session.login);

    res.json({ loginStatus: req.session.login });
  } else {
    // User is not authenticated, send a 401 Unauthorized status code
    console.log("NA seeeion: " + req.session);
    console.log("NA User is: " + req.session.userName);
    console.log("NA Logged in: " + req.session.login);

    res.status(401).json({ message: 'Unauthorized' });
  }
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});






 module.exports = recordRoutes;