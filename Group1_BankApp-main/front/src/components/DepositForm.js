import classes from "./form.module.css";
import {useRef, useState} from "react";

const DepositForm = (props) => {
    const accountType = useRef();
    const amount = useRef();
    const [statusCode, setStatusCode] = useState("");
    
    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        setStatusCode("");
        
        if(amount.current.value === "0.00"){
            setStatusCode("Valid amount needed");
            return;
        }

        const response = await fetch(`http://localhost:5000/deposit`,{
            method: "POST",
            headers: {"Content-Type": "application/json",},
            credentials: "include",
            body: JSON.stringify({"toAccount": accountType.current.value, 
                        "amount": Number(amount.current.value)})
        })
        
        const result = await response.json();
        if(!result.bcheck){
            setStatusCode("Error submitting deposit!");
        } else {
            setStatusCode("Deposit submitted!");
            amount.current.value = 0;
            window.alert("Deposit submitted!")
            props.hideHandler();
        }
    };

    return(
    <>
        <form onSubmit={onSubmitHandler}>
            <div className={classes.title}>Deposit Form</div>
            <div className={classes.controlHolder}>
                <label htmlFor="account">Deposit to: </label>
                <select name="account" id="accoung" ref={accountType}>
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                    <option value="Investments">Investments</option>
                </select>
            </div>
            <div className={classes.controlHolder}>
                <label htmlFor="amount">Amount to deposit: </label>
                <input type="number" min="0.00" step="0.01" defaultValue={0.00} ref={amount}/>
            </div>
            <div>
                <button>Submit Deposit</button>
            </div>
            <div className={classes.title}>{statusCode}</div>
        </form>
    </>);

}

export default DepositForm;