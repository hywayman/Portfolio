import {useState} from "react";

const LoadingScreen = (props) => {
    const [isLoading, setIsLoading] = useState(props.isLoading);

    return <>
    {isLoading ?
    <div>
        <h1>Loading........</h1>
    </div> : <div></div>}
    </>;
};

export default LoadingScreen;