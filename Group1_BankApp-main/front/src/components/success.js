import classes from "./success.module.css";
import React, { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import DepositForm from "./DepositForm";
import WithdrawForm from "./WithdrawForm";
import TransferForm from "./TransferForm";
import TransactionSheet from "./TransactionSheet";

const Success = () => {
  const [isAuth, setisAuth] = useState(false);
  const [userName, setuserName] = useState("");
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Check user authentication status when the component mounts
    const checkAuthentication = async () => {
      try {
        const response = await fetch("http://localhost:5000/getSession", {
          method: "GET",
          credentials: "include", // Include credentials (session cookie)
        });

        //save the response to data
        const data = await response.json();
        setisAuth(data.loggedIn);
        setuserName(data.userName);

        console.log(data);



        if (data.loggedIn) {
          // User is authenticated
          setisAuth(data.loggedIn);
          setuserName(data.userName);

          console.log(isAuth);
          console.log(userName);
          console.log("User is authenticated");
        } else {
          // User is not authenticated, redirect to login screen
          console.log("User is not authenticated");
          // You can use Navigate or window.location to redirect


        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Handle error, for example, display an error message
      }
      setIsLoading(false);
    };

    const getUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/getBank", {
          method: "GET",
          credentials: "include", // Include credentials (session cookie)
        });
        //save the response to data

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Handle error, for example, display an error message
      }
      setIsLoading(false);
    };

    checkAuthentication();

    if(isAuth){
      getUserData();
    }

    
  }, [isAuth,showDepositForm,showTransferForm,showWithdrawForm,userName]);
  
  const hideAll = () => {
    setShowDepositForm(false);
    setShowWithdrawForm(false);
    setShowTransferForm(false);
    setShowTransactionSheet(false);
  }

  const showFormhandler = (show) => {
    if (show === 0){
      hideAll()
      setShowDepositForm(true);
    }
    if(show === 1){
      hideAll()
      setShowWithdrawForm(true);
    }
    if(show === 2){
      hideAll()
      setShowTransferForm(true);
    }
    if(show === 3){
      hideAll()
      setShowTransactionSheet(true)
    }
  }

  const hideDepositForm = () => {
    setShowDepositForm(false);
  }

  const hideWithdrawForm = () => {
    setShowWithdrawForm(false);
  }

  const hideTransferForm = () => {
    setShowTransferForm(false);
  }

  return (
    <div className={classes.container}>
      {isLoading ? <LoadingScreen isLoading={isLoading}/> : <></>}
      {isAuth && !isLoading ? 
      (<><h1>Successful login, welcome {userName}</h1>
      <div>
        <h3>Account Number: {userData.AccountNum}</h3>
        <table>
          <tbody>
            <tr>
              <th>Savings</th>
              <th>${userData.Savings}</th>
            </tr>
            <tr>
              <th>Checking</th>
              <th>${userData.Checking}</th>
            </tr>
            <tr>
              <th>Investments</th>
              <th>${userData.Investments}</th>
            </tr>
          </tbody>
        </table>
        <div className={classes.buttonHolder}>
          <button onClick={() => {showFormhandler(0)}}>Deposit</button>
          <button onClick={() => {showFormhandler(1)}}>Withdraw</button>
          <button onClick={() => {showFormhandler(2)}}>Transfer</button>
          <button onClick={() => {showFormhandler(3)}}>Transaction Sheet</button>
        </div>
        <div className={classes.formHolder}>
          {showDepositForm ? <DepositForm hideHandler={hideDepositForm}/> : <></>}
          {showWithdrawForm? <WithdrawForm hideHandler={hideWithdrawForm}/> : <></>}
          {showTransferForm? <TransferForm hideHandler={hideTransferForm}/> : <></>}
          {showTransactionSheet? <TransactionSheet /> : <></>}
        </div>
      </div>
      
      </>
      ):<></>}
      {!isAuth && !isLoading ? <><h1>Server error please try again!</h1></>: <></>}
    </div>
  );
};

export default Success;

