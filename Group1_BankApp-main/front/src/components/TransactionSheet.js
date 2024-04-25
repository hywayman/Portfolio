import {useState} from "react";
import Transaction from "./Transaction";
import { useEffect } from "react";

const Record = (props) => {

    return (
        <tr>
            <td>{props.record.Date}</td>
            <td>{props.record.AccountNum}</td>
            <td>{props.record.Action}</td>
        </tr>
        )
};

export default function TransactionSheet() {
    const [getUserData, setUserData] = useState([]);


    useEffect(() => {
        async function getRecords() {
            try {
                const response = await fetch("http://localhost:5000/getActivity", {
                    method: "GET",
                    credentials: "include", // Include credentials (session cookie)
                });
                
                //save the response to data
                const data = await response.json();

                setUserData(data);

            } catch (error) {
              console.error("Error no account activity:", error);
              // Handle error, for example, display an error message
            }
        }
         getRecords();
         return;
      }, [getUserData.length]);
     
       // This method will map out the records on the table
      function recordList() {
        return getUserData.map((userData) => {
          return (
            <Record
              record={userData}
              key={userData._id}
            />
          );
        });
      }
       // This following section will display the table with the records of individuals.
      return (
        <div class="container" style={{ margin: 20 }}>
          <h3>Account Legger</h3>
          <table class="table table-bordered table-striped" >
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{recordList()}</tbody>
          </table>     
        </div>
      );
}