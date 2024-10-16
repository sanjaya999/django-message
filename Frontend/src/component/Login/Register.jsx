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
            <h1>Register</h1>

            <form action="" onSubmit={handleSubmit}>
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

        </>
    )
}
export default Register