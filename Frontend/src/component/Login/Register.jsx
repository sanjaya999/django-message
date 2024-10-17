import React ,{useState}from "react";
import { Link } from "react-router-dom";
import { post } from "../../api/api";


function Register(){
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
    const handleSubmit = async(e)=>{
        e.preventDefault();
        const response = await post(`/register` , data);
        console.log(response);
    }

    return(
        <>
        <div className="container">
        <div className="register">
            <h1>Register</h1>

            <form action="" className="registerForm"
            onSubmit={handleSubmit}>
                <input type="text" 
                name="fullname"
                placeholder="fullname" 
                value = {data.name}
                onChange={handleChange}
                />

                <input type="text" 
                placeholder="email"
                name="email"
                value={data.username}
                onChange={handleChange}
                 />

                <input type="password"
                 placeholder="Password"
                 name="password"
                 value={data.password}
                 onChange={handleChange}
                 />
                
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