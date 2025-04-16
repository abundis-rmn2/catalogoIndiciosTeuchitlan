import React from 'react';
import LazyImage from './LazyImage';

function Carousel({
  filteredItems,
  currentItemIndex,
  carouselRef,
  setCurrentItemIndex,
  setSelectedItem,
  getImageUrl,
  handleImageError,
  trackEvent,
}) {
  return (
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
  );
}

export default Carousel;
