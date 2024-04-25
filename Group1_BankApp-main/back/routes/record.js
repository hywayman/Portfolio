const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;


//for generating salt
const crypto = require('crypto');


//----------------------------- Hash  ----------------------------


//generated hased password
function Hash(password, salt) 
{
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}




//------------------------Working -------------------------------------------------------
// This section will help you create a new record. and create random number
recordRoutes.route("/add").post(async function (req, res) {
  try {
    const db_connect = await dbo.getDb();
    const { userName, userPassword} = req.body;

    // Check if the username is already in use
    const existingUser = await db_connect.collection("Bank").findOne({ userName });

    if (existingUser) {
      // Username is already in use
      return res.status(409).json({ message: 'Username already in use. Please try again' });
    }

    // Generate random salt
    const rSalt = crypto.randomBytes(16).toString('hex');
    
    // Hash password with salt
    const hashWord = Hash(userPassword, rSalt);
    
    let num = Math.floor(Math.random() * 99);
    let check = await db_connect.collection("Bank").findOne({ AccountNum: num });
  
    while (check) {
      num = Math.floor(Math.random() * 99);
      check = await db_connect.collection("Bank").findOne({ AccountNum: num });
    }

    // Construct object
    const myobj = {
      userName: userName,
      userPassword: hashWord,
      rSalt: rSalt,
      AccountNum: num,
      Checking: 0,
      Savings: 0,
      Investments: 0
    };


    // Save user to database
    const result = await db_connect.collection("Bank").insertOne(myobj);
    const insertedId = result.insertedId;

    req.session.userName = myobj.userName; // Store user object in session
    req.session.login = true; // Set login to true

    

    console.log('session usernanme:' + req.session.userName);
    console.log('session password:' + userPassword);
    console.log('session Loggedin:' + req.session.login);
    console.log('legger account number ' + leg.AccountNum);
  
    //use navigate instead of bcheck to redirect to success page
    res.json({ bcheck: (insertedId ? true : false) });
    //res.redirect('/front/components/success');
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});



recordRoutes.route("/c").post(async function (req, res) {
  try {

    //console.log("In /c, req session is" + req.session);

    const db_connect = await dbo.getDb();
    const { userName, userPassword } = req.body;

    // Query for a record with the provided username
    const userRecord = await db_connect.collection("Bank").findOne({ userName });

    // username does not exist
    if (!userRecord) 
    {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the provided password with the salt from the database
    const hashedPassword = Hash(userPassword, userRecord.rSalt);


    if (hashedPassword === userRecord.userPassword) {


      req.session.userName = userName;
      req.session.login = true; 
      res.json({ Hashcheck: true });
    } else {
      // Passwords don't match, authentication failed
      req.session.login = false;
      res.json({ Hashcheck: false });
    }
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});



//check to see if the session exists, returns loggedin status
recordRoutes.route("/logout").get(async function (req, res) {
  
  //console.log("In /logout, req session is" + req.session);
  
  try {
    if (req.session) 
    {
      // Clear session data
      req.session.destroy((err) => 
      {
        if (err) 
        {
          console.error('Error destroying session:', err);
          res.status(500).json({ message: 'Logout failed' });
        } 
        else 
        {
          // Send a response indicating successful logout
          res.clearCookie('session-id'); // Clear session cookie
          res.json({ message: 'Logout successful' });
          //res.redirect('/');
          console.log("In /logout, req session cookie cleared");
        }
      });
    } 
    else 
    {
      res.status(401).json({ message: 'Not logged in' });
    }
  } catch (err) 
  {
    res.status(500).json({ message: 'Registration failed', error: err.message });
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









//-------------------------testing of sessions not needed for assigment---------------------------

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

    res.json({loggedIn: false, userName: req.session.userName});
  } else {

    res.json({loggedIn: true, userName: req.session.userName});
  }
  
});

recordRoutes.route("/getBank").get(async function (req, res) {
  try {
    const db_connect = await dbo.getDb();
    const userName = req.session.userName;
    // Query for a record with the provided username
    const userRecord = await db_connect.collection("Bank").findOne({ userName });

    // username does not exist
    if (!userRecord) 
    {
      return res.status(404).json({ message: 'User not found' });
    }
    const userData = {"AccountNum": userRecord.AccountNum, "Checking": userRecord.Checking, "Savings": userRecord.Savings,"Investments": userRecord.Investments}
    res.json(userData);
  
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});



recordRoutes.route("/transfer").post(async function (req, res) {
  try {
    const db_connect = await dbo.getDb();
    const {fromAccount, toAccount, amount} = req.body;
    let userName = req.session.userName;
    // Check if the username is already in use
    const existingUser = await db_connect.collection("Bank").findOne({ userName });

    if (fromAccount === toAccount) {
      return res.status(409).json({ message: 'From and to accounts must be different' });
    }

    // Check if there are sufficient funds in the fromAccount
    if (existingUser[fromAccount] < amount) {
      return res.status(400).json({ message: 'Insufficient funds in the from account' });
    }

    // Update the account balances based on the transaction
    const updatedFromAccount = existingUser[fromAccount] - amount;
    const updatedToAccount = existingUser[toAccount] + amount;

    // Update the user's account balances in the database
    await db_connect.collection("Bank").updateOne(
      { userName: userName },
      { $set: { [fromAccount]: updatedFromAccount, [toAccount]: updatedToAccount } }
    );

    let legdate = new Date().toLocaleString();

    // Create a ledger entry for the transaction
    const leg = {
      Date: legdate,
      AccountNum: existingUser.AccountNum,
      Action: userName + ' transfered ' + amount + ' from ' + fromAccount + ' to ' + toAccount
    };

    const result = await db_connect.collection("Legger").insertOne(leg);
    
    const insertedId = result.insertedId
  
    //use navigate instead of bcheck to redirect to success page
    res.json({ bcheck: (insertedId ? true : false) });
    //res.redirect('/front/components/success');
  } catch (err) {
    res.status(500).json({ message: 'Transfer failed', error: err.message });
  }
});




recordRoutes.route("/withdrawl").post(async function (req, res) {
  try {
    const db_connect = await dbo.getDb();
    const { fromAccount, amount} = req.body;
    let userName = req.session.userName;
    // Check if the username is already in use
    const existingUser = await db_connect.collection("Bank").findOne({ userName });

    // Check if there are sufficient funds in the fromAccount
    if (existingUser[fromAccount] < amount) {
      return res.status(400).json({ message: 'Insufficient funds in the from account' });
    }

    // Update the account balances based on the transaction
    const updatedFromAccount = existingUser[fromAccount] - amount;

    // Update the user's account balances in the database
    await db_connect.collection("Bank").updateOne(
      { userName: userName },
      { $set: { [fromAccount]: updatedFromAccount} }
    );

    let legdate = new Date().toLocaleString();

    // Create a ledger entry for the transaction
    const leg = {
      Date: legdate,
      AccountNum: existingUser.AccountNum,
      Action: userName + ' withdrew ' + amount + ' from ' + fromAccount 
    };

    const result = await db_connect.collection("Legger").insertOne(leg);
    const insertedId = result.insertedId
  
    //use navigate instead of bcheck to redirect to success page
    res.json({ bcheck: (insertedId ? true : false) });
    //res.redirect('/front/components/success');
  } catch (err) {
    res.status(500).json({ message: 'Withdrawl failed', error: err.message });
  }
});


recordRoutes.route("/deposit").post(async function (req, res) {
  try {
    const db_connect = await dbo.getDb();
    const {toAccount, amount} = req.body;
    let userName = req.session.userName;
    // Check if the username is already in use
    const existingUser = await db_connect.collection("Bank").findOne({ userName });

    // Update the account balances based on the transaction
    const updatedToAccount = existingUser[toAccount] + amount;

    // Update the user's account balances in the database
    await db_connect.collection("Bank").updateOne(
      { userName: userName },
      { $set: { [toAccount]: updatedToAccount} }
    );

    let legdate = new Date().toLocaleString();

    // Create a ledger entry for the transaction
    const leg = {
      Date: legdate,
      AccountNum: existingUser.AccountNum,
      Action: userName + ' deposited ' + amount + ' in ' + toAccount 
    };

    const result = await db_connect.collection("Legger").insertOne(leg);
    const insertedId = result.insertedId
  
    //use navigate instead of bcheck to redirect to success page
    res.json({ bcheck: (insertedId ? true : false) });
    //res.redirect('/front/components/success');
  } catch (err) {
    res.status(500).json({ message: 'Deposite failed', error: err.message });
  }
});


//-------------------------testing ---------------------------


recordRoutes.route("/getActivity").get(async function (req, res) {
  try {
    const db_connect = await dbo.getDb();
    //const {userName} = req.body;
    const userName = req.session.userName;
    // Query for a record with the provided username
    const userRecord = await db_connect.collection("Bank").findOne({ userName });

    // username does not exist
    if (!userRecord) 
    {
      return res.status(404).json({ message: 'User not found' });
    }

    const userActivity = await db_connect.collection("Legger").find({ AccountNum: userRecord.AccountNum }).toArray();

    res.json(userActivity);
  
  } catch (err) {
    res.status(500).json({ message: 'GetActivitiy failed', error: err.message });
  }
});





 module.exports = recordRoutes;