import React from 'react';
import LazyImage from './LazyImage';

function ItemsGrid({ filteredItems, handleItemClick, getImageUrl, handleImageError }) {
  return (
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
  );
}

export default ItemsGrid;
