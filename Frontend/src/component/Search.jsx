import React, { useState } from "react";
import { get } from "../api/api";

function Search({onSelectUser}) {
    const [searchValue, setSearchValue] = useState("");
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setSearchValue(e.target.value);
        setError(null);
    };
    const selected = (resultId)=>{
        onSelectUser(resultId)
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!searchValue.trim()) {
            setError("Please enter a search term");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Direct URL construction for the search query
            const response = await get(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            
            console.log("Response:", response);
            setResults(response);
          
        
        } catch (error) {
            const errorMessage = error.response.data.message
            if(errorMessage.includes("No user found")){
                setError("No user found")
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="search-container">
            <form className="search-form" 
            onSubmit={handleSubmit}>
               <div className="search-wrapper">
                    <input
                        className="search-input"
                        type="text"
                        value={searchValue}
                        onChange={handleChange}
                        placeholder="Search users..."
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className={`search-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Searching..." : "Search"}
                    </button>
                </div>
                {error && <div>{error}</div>}
            {results.length > 0 && (
                <div  className="results-container">
                    {results.map((result) =>(
                        <div key={result.id}
                        onClick={()=>selected(result.id)}
                        className="result-item"
                        >
                         
                        {result.fullName}

                        </div>
                    ))}
                </div>
            )}
            </form>
            

            
        </div>
    );
}

export default Search;