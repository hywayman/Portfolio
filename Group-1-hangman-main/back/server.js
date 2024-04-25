//used to connect express to DB

const express = require("express");
const app = express();
const session = require('express-session');  // new
const MongoStore = require('connect-mongo'); // new
const cors = require("cors");

//tells where the config files is located
require("dotenv").config({ path: "./config.env" });
//set port can set a port stinng
const port = process.env.PORT || 5000;

//this is the middle ware. express is now using cors
//app.use(cors());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));


//express will use json
app.use(express.json());

const uri = process.env.ATLAS_URI;
// Advanced usage
app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: false, // don't create session until something stored
  resave: false, //don't save session if unmodified
  store: MongoStore.create({
    mongoUrl: process.env.ATLAS_URI
  })
}));

app.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
        if (err)
        {
            console.error(err);
        } 
   });
  console.log(`Server is running on port: ${port}`);
});


app.use(require("./routes/record"));
// get driver connection
const dbo = require("./db/conn");

