import React ,{useState}from "react";
import { Link } from "react-router-dom";
import { post } from "../../api/api";


function Register(){
    const[alertMessage , setAlertMessage] = useState("")
    const [data, setData] = useState({
        fullname: "",
        email: "",
        password: "",
    });

    const handleChange = (e)=>{
        const {name , value } = e.target
        setData({
            ...data,
            [name] : value
        })
        
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await post(`/register`, data)
            //display successful alert message
            if (response.status === "201") {
                setAlertMessage("Registration Successful");
            }
        } catch (error) {
            //alert on email already exist message
            const errorMessage = error.response.data.message || "";
            if(errorMessage.includes("email already exists")){
                setAlertMessage("Email already exists");
            }else {
                setAlertMessage("Registration Failed");
            }
        }
    };
    return(
        <>
        <div className="container">
        {alertMessage && (
                <div className="alert">
                    {alertMessage}
                </div>
            )}
        <div className="register">
           
            <h1>Register</h1>

            <form action="" className="registerForm"
            onSubmit={handleSubmit}>
                <div className="inner">
                <input type="text" 
                className="login-input"
                name="fullname"
                placeholder="fullname" 
                value = {data.name}
                onChange={handleChange} required
                />
                </div>

                <div className="inner">
                <input type="text" 
                 className="login-input"
                placeholder="email"
                name="email"
                value={data.username}
                onChange={handleChange} required
                 /></div>

                <div className="inner">
                <input type="password"
                 className="login-input"
                 placeholder="Password"
                 name="password"
                 value={data.password}
                 onChange={handleChange} required
                 /></div>
                
                <input type="submit" value="Register" />
                <h3>Doesnt have an account ? 
        <Link to="/login" className="linkto">Login</Link>
      </h3>
            </form>
            </div>
            </div>
        </>
    )
}
export default Register