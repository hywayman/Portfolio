import "./App.css";
import React from "react";
// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";
 // We import all the components we need in our app
import Navbar from "./components/navbar";
import Home from "./components/home";
import Login from "./components/login";
import Success from "./components/success";
import Register from "./components/register";

 const App = () => {
 return (
   <div>
      <Navbar />
      <Routes>
      <Route exact path="/" element={<Home/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/success" element={<Success/>} />
      <Route path="/register" element={<Register/>} />
     </Routes>
   </div>
 );
};
 export default App;