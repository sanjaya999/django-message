import React, { useState } from "react";
import { get } from "../api/api";

function Search() {
    const [searchValue, setSearchValue] = useState("");
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setSearchValue(e.target.value);
        setError(null);
    };

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
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={searchValue}
                    onChange={handleChange}
                    placeholder="Search"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Searching..." : "Submit"}
                </button>
            </form>
            
            {error && <div style={{ color: "red" }}>{error}</div>}
            {results.length > 0 && (
                <div>
                    {results.map((result) =>(
                        <div key={result.id}>
                         
                        {result.fullName}

                        </div>
                    ))}
                </div>
            )}
            
        </div>
    );
}

export default Search;