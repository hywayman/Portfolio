import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";



const Record = (props) => (
 <tr>
   <td>{props.record.userName}</td>
   <td>{props.record.numGuesses}</td>
 </tr>
);
export default function Results() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);

  // This method fetches the records from the database.
 useEffect(() => {
   async function getRecords() {
     const response = await fetch(`http://localhost:5000/HighScore/`);
      if (!response.ok) 
      {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }
      const records = await response.json();

      setRecords(records);
   }
    getRecords();
    return;
 }, [records.length]);

  // This method will map out the records on the table
 function recordList() {
   return records.map((record) => {
     return (
       <Record
         record={record}
         key={record._id}
       />
     );
   });
 }
  // This following section will display the table with the records of individuals.
 return (
   <div class="container" style={{ margin: 20 }}>
     <h3>High Scores - Top 10 Players</h3>
     <table class="table table-bordered table-striped" >
       <thead>
         <tr>
           <th>Name</th>
           <th>Number Of Guesses Made</th>
         </tr>
       </thead>
       <tbody>{recordList()}</tbody>
     </table>


   </div>
 );
}