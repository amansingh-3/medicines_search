import React, { useState, useEffect } from "react";
import "./Search.css";

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query.trim());
  };
  return (
    <>
      <div className="container">
        <div className="heading">
          <h1>Find your Medicine in Lowest Price</h1>
          <div className="search-bar">
            <div className="search-icon">
              <svg
                fill="#000000"
                height="15px"
                width="15px"
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 330 330"
                xml:space="preserve"
                transform="rotate(270)">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    id="XMLID_29_"
                    d="M100.606,100.606L150,51.212V315c0,8.284,6.716,15,15,15c8.284,0,15-6.716,15-15V51.212l49.394,49.394 C232.322,103.535,236.161,105,240,105c3.839,0,7.678-1.465,10.606-4.394c5.858-5.857,5.858-15.355,0-21.213l-75-75 c-5.857-5.858-15.355-5.858-21.213,0l-75,75c-5.858,5.857-5.858,15.355,0,21.213C85.251,106.463,94.749,106.463,100.606,100.606z"></path>{" "}
                </g>
              </svg>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Search for a medicine..."
                value={query}
                onChange={handleChange}
              />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
