import React from 'react';
import { BASE_URL } from '../App';

function Share({ selectedItem, getImageUrl }) {
  const shareUrl = `${BASE_URL}/#${selectedItem['INDICIO']}`;
  const imageUrl = getImageUrl(selectedItem.id);

  const handleShare = (platform) => {
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`Mira este indicio: ${selectedItem['INDICIO']} - ${shareUrl}`)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&picture=${encodeURIComponent(imageUrl)}`;
        break;
      case 'messenger':
        url = `fb-messenger://share?link=${encodeURIComponent(shareUrl)}&picture=${encodeURIComponent(imageUrl)}`;
        break;
      case 'x':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mira este indicio: ${selectedItem['INDICIO']} - ${shareUrl}`)}&url=${encodeURIComponent(imageUrl)}`;
        break;
      default:
        return;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="share-buttons">
      <button onClick={() => handleShare('whatsapp')} className="share-button whatsapp">
        Compartir en WhatsApp
      </button>
      <button onClick={() => handleShare('facebook')} className="share-button facebook">
        Compartir en Facebook
      </button>
      <button onClick={() => handleShare('messenger')} className="share-button messenger">
        Compartir en Messenger
      </button>
      <button onClick={() => handleShare('x')} className="share-button x">
        Compartir en X
      </button>
    </div>
  );
}

export default Share;
