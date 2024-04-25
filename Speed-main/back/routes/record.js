const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;


//------------------------Working -------------------------------------------------------



// this will allow the display/return of the Database object for a passed in player 
recordRoutes.route("/HS").get(async function (req, res) {
  try {
    const db_connect = await dbo.getDb();
    const myquery = { Name: req.params.Name };
    const result = await db_connect.collection("HighScore").findOne(myquery);
    res.json(result);
  } catch (err) {
    throw err;
  }
});


 module.exports = recordRoutes;