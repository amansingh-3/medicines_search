import React, { useState } from "react";
import Search from "./components/Search/Search";
import Card from "./components/Card/Card";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  return (
    <>
      <Search onSearch={handleSearch} />
      <Card searchQuery={searchQuery} />
    </>
  );
};

export default App;
