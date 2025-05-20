import { useState, useEffect, useRef } from 'react';
import './App.css';
import LazyImage from './components/LazyImage';
import { initGTM, trackEvent } from './utils/analytics'; // Updated import to use initGTM
import ShareButtons from './components/ShareButtons'; // Import ShareButtons
import Search from './components/Search'; // Import the Search component
import FilterSection from './components/FilterSection'; // Import the FilterSection component
import Gallery from './components/Gallery'; // Import the Gallery component

const BASE_URL = 'https://rancho-izaguirre.abundis.com.mx'; // Declare BASE_URL

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

  // Initialize Google Tag Manager
  useEffect(() => {
    initGTM(); // Updated to use initGTM
  }, []);

  // Effect to handle direct navigation to a URL and update the preview image
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/indicio\/(.+)$/);
    if (match) {
      const indicio = match[1].trim();
      const item = items.find(i => i['INDICIO'] === indicio);
      if (item) {
        const index = items.findIndex(i => i['INDICIO'] === indicio);
        setCurrentItemIndex(index);
        setSelectedItem(item);

        // Update the og:image meta tag
        const imageUrl = getImageUrl(item.id);
        let metaTag = document.querySelector('meta[property="og:image"]');
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('property', 'og:image');
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', imageUrl);
      }
    }
  }, [items]); // Run this effect after items are loaded

  // Effect to update the preview image meta tag when the selected item changes
  useEffect(() => {
    if (selectedItem) {
      const imageUrl = getImageUrl(selectedItem.id);
      let metaTag = document.querySelector('meta[property="og:image"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', 'og:image');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', imageUrl);
    }
  }, [selectedItem]);

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
    trackEvent('filter_change', 'Filters', name, value); // Track filter change
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
    window.history.pushState(null, '', `/indicio/${item['INDICIO']}`); // Update URL to /indicio/[INDICIO]
    trackEvent('item_click', 'Items', `${item.id} - ${item['INDICIO']}`, item['INDICIO']); // Track item click
  };

  // Close detail view
  const closeDetailView = () => {
    setSelectedItem(null);
    window.history.pushState(null, '', '/'); // Reset URL to root
  };

  // Navigate to next item - Update to force image refresh
  const goToNextItem = (e) => {
    e.stopPropagation();
    const nextIndex = (currentItemIndex + 1) % filteredItems.length;
    setCurrentItemIndex(nextIndex);
    setSelectedItem(filteredItems[nextIndex]);
    window.history.pushState(null, '', `/indicio/${filteredItems[nextIndex]['INDICIO']}`); // Update URL to /indicio/[INDICIO]
    // Reset mobile info state when changing items
    setShowMobileInfo(false);
    trackEvent('navigation', 'Items', `${filteredItems[nextIndex].id} - ${filteredItems[nextIndex]['INDICIO']}`, filteredItems[nextIndex]['INDICIO']); // Track next item
  };

  // Navigate to previous item - Update to force image refresh
  const goToPrevItem = (e) => {
    e.stopPropagation();
    const prevIndex = (currentItemIndex - 1 + filteredItems.length) % filteredItems.length;
    setCurrentItemIndex(prevIndex);
    setSelectedItem(filteredItems[prevIndex]);
    window.history.pushState(null, '', `/indicio/${filteredItems[prevIndex]['INDICIO']}`); // Update URL to /indicio/[INDICIO]
    // Reset mobile info state when changing items
    setShowMobileInfo(false);
    trackEvent('navigation', 'Items', `${filteredItems[prevIndex].id} - ${filteredItems[prevIndex]['INDICIO']}`, filteredItems[prevIndex]['INDICIO']); // Track previous item
  };

  // Function to handle image loading errors - updated for LazyImage
  const handleImageError = (itemId) => {
    console.log(`Failed to load image for item ${itemId}`);
  };

  // Function to get correct image URL with full path checking
  const getImageUrl = (itemId) => {
    const version = 'v1'; // Static versioning to ensure caching
    return `${BASE_URL}/indicios/${itemId}.jpg?cache=${version}`; // Append cache-busting query parameter
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
          <Search 
            value={filters.search} 
            onChange={(value) => handleFilterChange('search', value)} 
          />
        </div>

        <FilterSection
          filters={filters}
          uniqueTypes={uniqueTypes}
          uniqueColors={uniqueColors}
          uniqueBrands={uniqueBrands}
          uniqueSizes={uniqueSizes}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
        />
      </header>
      
      {/* Add spacer for fixed header on mobile */}
      <div className="header-spacer"></div>

      <Gallery
        filteredItems={filteredItems}
        handleItemClick={handleItemClick}
        getImageUrl={getImageUrl}
        handleImageError={handleImageError}
        selectedItem={selectedItem}
        closeDetailView={closeDetailView}
        goToNextItem={goToNextItem}
        goToPrevItem={goToPrevItem}
        currentItemIndex={currentItemIndex}
        carouselRef={carouselRef}
        toggleMobileInfo={toggleMobileInfo}
        showMobileInfo={showMobileInfo}
        trackEvent={trackEvent}
        setSelectedItem={setSelectedItem}
        setCurrentItemIndex={setCurrentItemIndex}
      />

      <footer>
        <p>Total de elementos: {filteredItems.length} de {items.length}</p>
      </footer>
    </div>
  );
}

export { BASE_URL }; // Re-add export for BASE_URL
export default App;
