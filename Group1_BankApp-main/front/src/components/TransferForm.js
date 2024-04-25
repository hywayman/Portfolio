import classes from "./form.module.css";
import {useRef, useState} from "react"

const TransferForm = (props) => {
    const toAccountType = useRef();
    const fromAccountType = useRef();
    const amount = useRef();
    const [statusCode, setStatusCode] = useState("");

    const onSubmitHandler = async(event) => {
        event.preventDefault();
        setStatusCode("");
        
        if(amount.current.value === "0.00"){
            setStatusCode("Valid amount needed");
            return;
        }

        const response = await fetch(`http://localhost:5000/transfer`,{
            method: "POST",
            headers: {"Content-Type": "application/json",},
            credentials: "include",
            body: JSON.stringify({"fromAccount": fromAccountType.current.value, 
                                    "toAccount": toAccountType.current.value, 
                                    "amount": Number(amount.current.value)})
        })

        const result = await response.json();
        if(!result.bcheck){
            setStatusCode("Error Transferring!");
        } else {
            setStatusCode("Money Transferred!");
            amount.current.value = 0;
            window.alert("Money Transferred!");
            props.hideHandler();
        }
    }

    return(
    <>
        <form onSubmit={onSubmitHandler}>
            <div className={classes.title}>Transfer Form</div>
            <div className={classes.controlHolder}>
                <label for="account">Transfer from: </label>
                <select name="account" id="accoung" ref={fromAccountType}>
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                    <option value="Investments">Investments</option>
                </select>
            </div>
            <div className={classes.controlHolder}>
                <label for="account">Transfer to: </label>
                <select name="account" id="accoung" ref={toAccountType}>
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                    <option value="Investments">Investments</option>
                </select>
            </div>
            <div className={classes.controlHolder}>
                <label for="amount">Amount to transfer: </label>
                <input type="number" min="0.00" step="0.01" defaultValue={0.00} ref={amount}/>
            </div>
            <div>
                <button type="submit">Submit Transfer</button>
            </div>
            <div className={classes.title}>{statusCode}</div>
        </form>
    </>);

}

export default TransferForm;