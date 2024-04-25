/*
import React from "react";
import { Link } from "react-router-dom";

export default function Home () {
  return (
    <div className="container" style={{ margin: 20 }}>
      <h1>Authentication application</h1>
      <p>Please select an option:</p>
      <div className="form-group ">
          <Link to="/login" className="btn btn-primary ml-2">
            Login
          </Link>

          <Link to="/register" className="btn btn-secondary ml-2">
            Register
          </Link>
        </div>
    </div>
  );
};
 */

import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container" style={{ margin: 20 }}>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mb-4">Authentication Application</h1>
          <div className="text-center mb-4">
            <p>Please select an option:</p>
          </div>
          <div className="d-flex justify-content-center">
            <Link to="/login" className="btn btn-primary mr-2">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary ml-2">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

