import { useState, useEffect, useRef } from 'react';
import './App.css';
import LazyImage from './components/LazyImage';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    tipo: '',
    color: '',
    marca: '',
    talla: '', // Added talla filter
    search: '',
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  // Add state for mobile info toggle
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  // Reference to the carousel container for scrolling
  const carouselRef = useRef(null);

  // Initialize filter visibility to true for desktop, will be controlled by CSS media query
  const [showFilters, setShowFilters] = useState(true);
  
  // Function to toggle filter visibility (primarily for mobile)
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Effect to initialize filters based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Auto-show filters on desktop, default to hidden on mobile
      setShowFilters(window.innerWidth > 768);
    };
    
    // Set initial state
    handleResize();
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch and parse CSV data with improved parsing for quotes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/complete_data.csv');
        const csvText = await response.text();
        
        // Parse CSV with proper handling of quotes
        const parseCSV = (csv) => {
          const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
          const headers = parseCSVLine(lines[0]);
          
          return lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const item = {};
            headers.forEach((header, index) => {
              // Ensure we trim whitespace from all values
              item[header] = values[index] ? values[index].trim() : '';
            });
            return item;
          });
        };
        
        // Parse a single CSV line with proper quote handling
        const parseCSVLine = (line) => {
          const result = [];
          let startPos = 0;
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            // Handle quotes
            if (line[i] === '"') {
              inQuotes = !inQuotes;
              continue;
            }
            
            // If we're at a comma and not inside quotes, we've found a field boundary
            if (line[i] === ',' && !inQuotes) {
              result.push(line.substring(startPos, i).replace(/"/g, ''));
              startPos = i + 1;
            }
          }
          
          // Add the last field
          result.push(line.substring(startPos).replace(/"/g, ''));
          return result;
        };
        
        const data = parseCSV(csvText);
        setItems(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError('Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Effect to center the active item in the carousel
  useEffect(() => {
    if (carouselRef.current && selectedItem) {
      const carousel = carouselRef.current;
      const activeItem = carousel.querySelector('.carousel-item.active');
      
      if (activeItem) {
        const scrollPosition = activeItem.offsetLeft - (carousel.offsetWidth / 2) + (activeItem.offsetWidth / 2);
        carousel.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentItemIndex, selectedItem]);

  // Filter items based on criteria with improved space handling
  const filteredItems = items.filter(item => {
    // Split colors by comma and trim whitespace
    const itemColors = item['COLOR'] ? 
      item['COLOR'].split(',').map(color => color.trim()).filter(Boolean) : 
      [];
      
    const searchTerm = filters.search.trim().toLowerCase();
    
    return (
      (filters.tipo === '' || (item['TIPO DE INDICIO'] && item['TIPO DE INDICIO'].trim().includes(filters.tipo.trim()))) &&
      (filters.color === '' || (itemColors.length > 0 && itemColors.some(color => color.toLowerCase().includes(filters.color.trim().toLowerCase())))) &&
      (filters.marca === '' || (item['MARCA'] && item['MARCA'].trim().includes(filters.marca.trim()))) &&
      (filters.talla === '' || (item['TALLA'] && item['TALLA'].trim() !== 'S/D' && item['TALLA'].trim().includes(filters.talla.trim()))) && // Added talla filter
      (searchTerm === '' || 
        (item['TIPO DE INDICIO'] && item['TIPO DE INDICIO'].toLowerCase().includes(searchTerm)) ||
        (item['COLOR'] && item['COLOR'].toLowerCase().includes(searchTerm)) ||
        (item['MARCA'] && item['MARCA'].toLowerCase().includes(searchTerm)) ||
        (item['TALLA'] && item['TALLA'].toLowerCase().includes(searchTerm)) || // Added talla to search
        (item['OBSERVACIONES'] && item['OBSERVACIONES'].toLowerCase().includes(searchTerm)))
    );
  });

  // Extract unique values for filters with improved space handling
  const uniqueTypes = [...new Set(items
    .map(item => item['TIPO DE INDICIO'])
    .filter(Boolean)
    .map(type => type.trim())
  )].sort();
  
  // Process colors to handle comma-separated values and trim spaces
  const uniqueColors = [...new Set(
    items
      .flatMap(item => item['COLOR'] ? 
        item['COLOR'].split(',')
          .map(color => color.trim())
          .filter(Boolean) : 
        []
      )
  )].sort();
  
  const uniqueBrands = [...new Set(
    items
      .map(item => item['MARCA'])
      .filter(Boolean)
      .map(brand => brand.trim())
  )].sort();
  
  // Extract unique sizes (tallas)
  const uniqueSizes = [...new Set(
    items
      .map(item => item['TALLA'])
      .filter(value => value && value.trim() !== '' && value.trim() !== 'S/D')
      .map(size => size.trim())
  )].sort();

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Reset all filters
  const clearFilters = () => {
    setFilters({
      tipo: '',
      color: '',
      marca: '',
      talla: '', // Added talla
      search: '',
    });
  };

  // Handle item selection for detail view
  const handleItemClick = (item) => {
    const index = filteredItems.findIndex(i => i.id === item.id);
    setCurrentItemIndex(index);
    setSelectedItem(item);
  };

  // Close detail view
  const closeDetailView = () => {
    setSelectedItem(null);
  };

  // Navigate to next item - Update to force image refresh
  const goToNextItem = (e) => {
    e.stopPropagation();
    const nextIndex = (currentItemIndex + 1) % filteredItems.length;
    setCurrentItemIndex(nextIndex);
    setSelectedItem(filteredItems[nextIndex]);
    // Reset mobile info state when changing items
    setShowMobileInfo(false);
  };

  // Navigate to previous item - Update to force image refresh
  const goToPrevItem = (e) => {
    e.stopPropagation();
    const prevIndex = (currentItemIndex - 1 + filteredItems.length) % filteredItems.length;
    setCurrentItemIndex(prevIndex);
    setSelectedItem(filteredItems[prevIndex]);
    // Reset mobile info state when changing items
    setShowMobileInfo(false);
  };

  // Function to handle image loading errors - updated for LazyImage
  const handleImageError = (itemId) => {
    console.log(`Failed to load image for item ${itemId}`);
  };

  // Function to get correct image URL with full path checking
  const getImageUrl = (itemId) => {
    return `/indicios/${itemId}.jpg`;
  };

  // Function to toggle info display on mobile
  const toggleMobileInfo = (e) => {
    e.stopPropagation();
    setShowMobileInfo(!showMobileInfo);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app-container">
      <header className="site-header">
        <div className="header-main">
          <h1>Catálogo de Indicios - Rancho Izaguirre Teuchitlan, Jalisco </h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {/* Filter section moved inside header */}
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
                    <option key={index} value={type}>{type}</option>
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
                    <option key={index} value={color}>{color}</option>
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
                    <option key={index} value={brand}>{brand}</option>
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
                    <option key={index} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <button onClick={clearFilters} className="clear-button">Limpiar filtros</button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Add spacer for fixed header on mobile */}
      <div className="header-spacer"></div>

      <main className="gallery-container">
        {filteredItems.length === 0 ? (
          <p className="no-results">No se encontraron resultados</p>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="item-card" 
                onClick={() => handleItemClick(item)}
              >
                <div className="item-image-container">
                  <LazyImage 
                    src={getImageUrl(item.id)} 
                    alt={`${item['INDICIO']} - ${item['TIPO DE INDICIO']}`} 
                    onError={() => handleImageError(item.id)}
                  />
                </div>
                <div className="item-info">
                  <h3>{item['INDICIO']}</h3>
                  <p>{item['TIPO DE INDICIO']} - {item['COLOR']}</p>
                  <p>
                    {item['MARCA'] !== 'S/D' ? item['MARCA'] : 'Sin marca'}
                    {item['TALLA'] && item['TALLA'] !== 'S/D' ? ` - Talla: ${item['TALLA']}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedItem && (
        <div className="detail-overlay" onClick={closeDetailView}>
          <div className="detail-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeDetailView}>×</button>
            
            {/* Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button className="nav-arrow prev-arrow" onClick={goToPrevItem}>&lt;</button>
                <button className="nav-arrow next-arrow" onClick={goToNextItem}>&gt;</button>
              </>
            )}
            
            <div className="detail-content">
              <div className="detail-image-container">
                <LazyImage 
                  key={`detail-${selectedItem.id}`} // Add key to force re-render
                  src={getImageUrl(selectedItem.id)} 
                  alt={`${selectedItem['INDICIO']} - ${selectedItem['TIPO DE INDICIO']}`}
                  onError={() => handleImageError(selectedItem.id)}
                  className="detail-priority-image"
                  immediate={true} // Add prop to load immediately without delay
                />
              </div>
              
              {/* Mobile-friendly title bar that can be clicked to show more info */}
              <div className="detail-title-bar" onClick={toggleMobileInfo}>
                <h2>{selectedItem['INDICIO']}</h2>
                <button className="mobile-info-toggle">
                  {showMobileInfo ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
              </div>
              
              {/* Info section that can be toggled on mobile */}
              <div className={`detail-info ${showMobileInfo ? 'mobile-expanded' : ''}`}>
                <table>
                  <tbody>
                    <tr>
                      <th>Tipo:</th>
                      <td>{selectedItem['TIPO DE INDICIO'] && selectedItem['TIPO DE INDICIO'].trim()}</td>
                    </tr>
                    <tr>
                      <th>Color:</th>
                      <td>{selectedItem['COLOR'] && selectedItem['COLOR'].trim()}</td>
                    </tr>
                    <tr>
                      <th>Marca:</th>
                      <td>{selectedItem['MARCA'] && selectedItem['MARCA'].trim() !== 'S/D' ? selectedItem['MARCA'].trim() : 'Sin datos'}</td>
                    </tr>
                    <tr>
                      <th>Talla:</th>
                      <td>{selectedItem['TALLA'] && selectedItem['TALLA'].trim() !== 'S/D' ? selectedItem['TALLA'].trim() : 'Sin datos'}</td>
                    </tr>
                    <tr>
                      <th>Observaciones:</th>
                      <td>{selectedItem['OBSERVACIONES'] && selectedItem['OBSERVACIONES'].trim() || 'Sin observaciones'}</td>
                    </tr>
                  </tbody>
                </table>
                
                {/* Fixed external link section with better validation */}
                {selectedItem['LINK FOTO'] && selectedItem['LINK FOTO'].trim() !== '' && selectedItem['LINK FOTO'].trim() !== 'S/D' ? (
                  <div className="external-link">
                    <a 
                      href={selectedItem['LINK FOTO'].trim().startsWith('http') ? 
                        selectedItem['LINK FOTO'].trim() : 
                        `https://${selectedItem['LINK FOTO'].trim()}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Ver fotografía original
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
            
            {/* Thumbnail Carousel with ref */}
            {filteredItems.length > 1 && (
              <div className="carousel-container" ref={carouselRef}>
                {filteredItems.map((item, index) => (
                  <div 
                    key={`thumb-${item.id}`}
                    className={`carousel-item ${index === currentItemIndex ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentItemIndex(index);
                      setSelectedItem(item);
                      setShowMobileInfo(false); // Reset mobile info when changing items
                    }}
                  >
                    <LazyImage 
                      key={`carousel-${item.id}`} // Add key to force re-render
                      src={getImageUrl(item.id)}
                      alt={`${item['INDICIO']} - Thumbnail`}
                      onError={() => handleImageError(item.id)}
                      className="carousel-thumbnail"
                      placeholderSrc="/placeholder-image.png"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <footer>
        <p>Total de elementos: {filteredItems.length} de {items.length}</p>
      </footer>
    </div>
  );
}

export default App;
