import React from 'react';
import LazyImage from './LazyImage';

function Gallery({
  filteredItems,
  handleItemClick,
  getImageUrl,
  handleImageError,
  selectedItem,
  closeDetailView,
  goToNextItem,
  goToPrevItem,
  currentItemIndex,
  carouselRef,
  toggleMobileInfo,
  showMobileInfo,
  trackEvent,
  setSelectedItem,
  setCurrentItemIndex,
}) {
  return (
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

      {selectedItem && (
        <div className="detail-overlay" onClick={closeDetailView}>
          <div
            className="detail-container"
            id={`indicio=${selectedItem.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-button" onClick={closeDetailView}>×</button>

            {filteredItems.length > 1 && (
              <>
                <button className="nav-arrow prev-arrow" onClick={goToPrevItem}>&lt;</button>
                <button className="nav-arrow next-arrow" onClick={goToNextItem}>&gt;</button>
              </>
            )}

            <div className="detail-content">
              <div className="detail-image-container">
                <LazyImage
                  key={`detail-${selectedItem.id}`}
                  src={getImageUrl(selectedItem.id)}
                  alt={`${selectedItem['INDICIO']} - ${selectedItem['TIPO DE INDICIO']}`}
                  onError={() => handleImageError(selectedItem.id)}
                  className="detail-priority-image"
                  immediate={true}
                />
              </div>

              <div className="detail-title-bar" onClick={toggleMobileInfo}>
                <h2>{selectedItem['INDICIO']}</h2>
                <button className="mobile-info-toggle">
                  {showMobileInfo ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
              </div>

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
              </div>
            </div>

            {filteredItems.length > 1 && (
              <div className="carousel-container" ref={carouselRef}>
                {filteredItems.map((item, index) => (
                  <div
                    key={`thumb-${item.id}`}
                    className={`carousel-item ${index === currentItemIndex ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentItemIndex(index);
                      setSelectedItem(item);
                      window.location.hash = item['INDICIO'];
                      trackEvent('thumbnail_click', 'Carousel', `${item.id} - ${item['INDICIO']}`, item['INDICIO']);
                    }}
                  >
                    <LazyImage
                      key={`carousel-${item.id}`}
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
    </main>
  );
}

export default Gallery;
