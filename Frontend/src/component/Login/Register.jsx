import React ,{useState}from "react";

function Register(){
    const [data, setData] = useState({
        name: "",
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
    const handleSubmit = (e)=>{
        e.preventDefault();
        // API call for register
    }

    return(
        <>
        <div className="containerRegister">
        <div className="register">
            <h1>Register</h1>

            <form action="" className="registerForm"
            onSubmit={handleSubmit}>
                <input type="text" 
                name="name"
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
            </form>
            </div>
            </div>
        </>
    )
}
export default Register