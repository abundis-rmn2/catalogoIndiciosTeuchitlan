import React from 'react';

function Search({ value, onChange }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Buscar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
    </div>
  );
}

export default Search;
