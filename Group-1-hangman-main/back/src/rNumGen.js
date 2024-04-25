const express = require('express');
const rNumGenRoutes = express.Router();

rNumGenRoutes.get('/rNumGen', (req, res) => {
    try{
        const rtarget = Math.floor(Math.random() * 10); 
        console.log("Random Num was generated: " + rtarget);
        res.json({ rtarget: 'Result from the back-end function' });
        return req; 
    }
    catch (err) 
    {
        throw err;
    }
    

});

module.exports = rNumGenRoutes;




/* 
async function rNumGen(){
    const rtarget = Math.floor(Math.random() * 10);

    const dbo = require("~/back/db/conn");
    const db_connect = await dbo.getDb();

    const myobj = {
        target: rtarget
    };

    const result = await db_connect.collection("records").insertOne(myobj);
    return result;
}
export default rNumGen; */