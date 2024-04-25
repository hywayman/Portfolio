

// We import bootstrap to make our application look better.
import "bootstrap/dist/css/bootstrap.css";
import React, { useEffect, useState } from "react";
import { useNavigate} from "react-router";
import { Link } from "react-router-dom";

const Navbar = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(handleLogin, 5000); // Check every 5 seconds
    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, []);

  const handleLogin = async () => {
    
    try{

      const response = await fetch("http://localhost:5000/getSession", {
        method: "Get",
        credentials: "include",
      });
  
      if (response.ok) {
        const cookie = await response.json();
        let status = cookie.loggedIn;
        console.log(status);
        if (status){
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error("Error during banner login:", error);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      // Send a logout request to the server
      const response = await fetch("http://localhost:5000/logout", {
        method: "GET",
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        // Logout successful, navigate to the login page
        window.location.href = "/login";
        setIsLoggedIn(false);
      } else {
        // Handle logout failure
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Group 1 Banking App
        </Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          {isLoggedIn ? (
            <button className="btn btn-outline-primary" onClick={handleLogout}>
              Logout
          </button>
          ) : (
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">
                  Register
                </Link>
              </li>
            </ul>
          )}
        </div>
          {/* <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/register">
                Register
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-primary" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
