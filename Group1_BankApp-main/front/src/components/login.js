import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    userName: "",
    userPassword: "",
  });

  const navigate = useNavigate();

  // This function will handle the submission.
  async function onSubmit(e) {
    e.preventDefault();
    // When a post request is sent to the create url, we'll add a new record to the database.
    const User = { ...form }; //unpacts the form object
    const response = await fetch("http://localhost:5000/c", {
      method: "POST",
      credentials: "include", // Include credentials (session cookie)
      body: JSON.stringify(User), // This is the body of the post request turned to a string.
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((error) => {
      window.alert(error);
      return;
    });

    if (response) {
      const check = await response.json();
      if (check.Hashcheck) {
        navigate('/success');
      } else {
        navigate('/login');
      }
      // Clear form fields
      setForm({ userName: "", userPassword: "" });
    }
  }

  // These methods will update the state properties.
  function updateForm(value) {
    setForm((prev) => {
      return { ...prev, ...value }; // unpacking the object and repacks it . val will overite prev if the data already exists
    });
  }

  // This following section will display the form that takes the input from the user.
  return (
    <div className="container" style={{ margin: 20 }}>
      <h1>Enter Username and Password</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={form.userName}
            onChange={(e) => updateForm({ userName: e.target.value })}
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label htmlFor="userPassword">Password: </label>
          <input
            type="password"
            className="form-control"
            id="userPassword"
            value={form.userPassword}
            onChange={(e) => updateForm({ userPassword: e.target.value })}
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <input
            type="submit"
            value="Login"
            className="btn btn-primary"
          />
          <Link to="/register" className="btn btn-secondary ml-2">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
