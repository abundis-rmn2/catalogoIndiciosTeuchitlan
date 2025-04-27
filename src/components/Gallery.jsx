import React from 'react';
import LazyImage from './LazyImage';
import ItemsGrid from './ItemsGrid';
import Carousel from './Carousel';
import Share from './Share';

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
  const baseUrl = window.location.origin;

  return (
    <main className="gallery-container">
      {filteredItems.length === 0 ? (
        <p className="no-results">No se encontraron resultados</p>
      ) : (
        <ItemsGrid
          filteredItems={filteredItems}
          handleItemClick={handleItemClick}
          getImageUrl={getImageUrl}
          handleImageError={handleImageError}
        />
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
                        <th>Indicio:</th>
                        <td>{selectedItem['INDICIO'] && selectedItem['INDICIO'].trim()}</td>
                    </tr>
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
                <Share baseUrl={baseUrl} selectedItem={selectedItem} getImageUrl={getImageUrl} />
              </div>
            </div>

            {filteredItems.length > 1 && (
              <Carousel
                filteredItems={filteredItems}
                currentItemIndex={currentItemIndex}
                carouselRef={carouselRef}
                setCurrentItemIndex={setCurrentItemIndex}
                setSelectedItem={setSelectedItem}
                getImageUrl={getImageUrl}
                handleImageError={handleImageError}
                trackEvent={trackEvent}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default Gallery;
