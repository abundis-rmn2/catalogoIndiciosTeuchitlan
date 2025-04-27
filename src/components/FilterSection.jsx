import React from 'react';

function FilterSection({
  filters,
  uniqueTypes,
  uniqueColors,
  uniqueBrands,
  uniqueSizes,
  showFilters,
  toggleFilters,
  handleFilterChange,
  clearFilters,
}) {
  return (
    <div className="filter-section">
      <div className="filter-toggle-container">
        <button className="filter-toggle-button" onClick={toggleFilters}>
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
      </div>

      <div className={`filter-container ${showFilters ? 'show' : ''}`}>
        <div className="filter-content">
          <div className="filter-group">
            <label htmlFor="tipo-filter">Tipo:</label>
            <select
              id="tipo-filter"
              value={filters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
            >
              <option value="">Todos</option>
              {uniqueTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="color-filter">Color:</label>
            <select
              id="color-filter"
              value={filters.color}
              onChange={(e) => handleFilterChange('color', e.target.value)}
            >
              <option value="">Todos</option>
              {uniqueColors.map((color, index) => (
                <option key={index} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="marca-filter">Marca:</label>
            <select
              id="marca-filter"
              value={filters.marca}
              onChange={(e) => handleFilterChange('marca', e.target.value)}
            >
              <option value="">Todas</option>
              {uniqueBrands.map((brand, index) => (
                <option key={index} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="talla-filter">Talla:</label>
            <select
              id="talla-filter"
              value={filters.talla}
              onChange={(e) => handleFilterChange('talla', e.target.value)}
            >
              <option value="">Todas</option>
              {uniqueSizes.map((size, index) => (
                <option key={index} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <button onClick={clearFilters} className="clear-button">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterSection;
