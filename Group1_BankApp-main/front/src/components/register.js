import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";


export default function Register() {
 
  const [form, setform] = useState({
   userName: "",
   userPassword: "",
   confirmPassword: ""
 });
 

 const navigate = useNavigate();

  // These methods will update the state properties.
 function updateForm(value) {
   return setform((prev) => {
     return { ...prev, ...value }; // unpacking the object and repacks it . val will overite prev if the data already exists
   });
 }

  // This function will handle the submission.
 async function onSubmit(e) 
 {
   e.preventDefault();



  if (form.userPassword !== form.confirmPassword) 
  {
    alert("Passwords do not match. Please try again.");
    return;
  }

  // Check password policy threshold (e.g., minimum length)
  if (form.userPassword.length < 8) 
  {
    alert("Password must be at least 8 characters long.");
    return;
  }



    // When a post request is sent to the create url, we'll add a new record to the database.
   const User = { ...form }; //unpacts the form object


   const response = await fetch("http://localhost:5000/add", {
     method: "POST",
     body: JSON.stringify(User), // This is the body of the post request turned to a string.
     credentials: "include",
     headers: {
       "Content-Type": "application/json",
     },
     
   })
   .catch(error => {
     window.alert(error);
     return;
   });


   if (response) 
   {
      const check = await response.json();
      if (check.bcheck) {
        navigate('/success');
      } else {
        navigate('/register');
      }
      // Clear form fields
      setform({ Username: "", Password: "", confirmPassword: ""});
    }
  }

 // This following section will display the form that takes the input from the user.
 return (
    <div className="container" style={{ margin: 20 }}>
       <h3>Enter Usrename and Password</h3>
       <form onSubmit={onSubmit}> 
         <div className="form-group row pt=4">
         <br/>
           <label htmlFor="username">Username: </label>
           <input
             type="text"
             className="form-control col-6"
             id="username"
             value={form.userName}
             onChange={(e) => updateForm({ userName: e.target.value })}
             autoComplete="off"
           />
         </div>
         <div className="form-group row pt=4">
         <br/>
           <label htmlFor="userPassword">Password: </label>
           <input
             type="password"
             className="form-control col-6"
             id="userPassword"
             value={form.userPassword}
             onChange={(e) => updateForm({ userPassword: e.target.value })}
             autoComplete="off"
           />
         </div>

         <div className="form-group row pt=4">
         <br/>
           <label htmlFor="confirmPassword">Confirm Password: </label>
           <input
             type="password"
             className="form-control col-6"
             id="confirmPassword"
             value={form.confirmPassword}
             onChange={(e) => updateForm({ confirmPassword: e.target.value })}
             autoComplete="off"
           />
         </div>
         <br/>
         <div className="form-group">
           <input
             type="submit" value="Login" className="btn btn-primary"/>
             
         </div>
       </form>
     </div>
  );
}