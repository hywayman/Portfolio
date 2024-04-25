import classes from "./form.module.css";
import {useRef, useState} from "react";

const isZero = (value) => value === 0;

const WithdrawForm = (props) => {
    const accountType = useRef();
    const amount = useRef();
    const [statusCode, setStatusCode] = useState("");

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setStatusCode("");

        if(amount.current.value === "0.00"){
            setStatusCode("Must have an amount greater than 0");
            return;
        }

        const response = await fetch(`http://localhost:5000/withdrawl`, {
            method: "POST",
            headers: {"Content-Type": "application/json",},
            credentials: "include",
            body: JSON.stringify({"fromAccount": accountType.current.value,
                                    "amount": Number(amount.current.value)})
        })

        const result = await response.json();
        if(!result.bcheck){
            setStatusCode("Error making withdrawl!");
        } else {
            setStatusCode("Withdrawl made.");
            amount.current.value = 0;
            window.alert("Withdrawl made.");
            props.hideHandler();
        }
    }

    return(
    <>
        <form onSubmit={onSubmitHandler}>
            <div className={classes.title}>Withdraw Form</div>
            <div className={classes.controlHolder}>
                <label for="account">Withdraw from: </label>
                <select name="account" id="accoung" ref={accountType}>
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                    <option value="Investments">Investments</option>
                </select>
            </div>
            <div className={classes.controlHolder}>
                <label for="amount">Amount to withdraw: </label>
                <input type="number" min="0.00" step="0.01" defaultValue={0.00} ref={amount} />
            </div>
            <div>
                <button type="submit">Submit Withdrawl</button>
            </div>
            <div className={classes.title}>{statusCode}</div>
        </form>
    </>);

}

export default WithdrawForm;