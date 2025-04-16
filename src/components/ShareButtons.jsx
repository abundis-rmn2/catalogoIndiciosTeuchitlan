import React from 'react';
import { BASE_URL } from '../App'; // Import BASE_URL

const ShareButtons = ({ indicio }) => {
  const shareUrl = `${BASE_URL}/#${indicio}`; // Use BASE_URL for absolute URL

  return (
    <div className="share-buttons">
      <p>Compartir:</p>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button whatsapp"
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button facebook"
      >
        Facebook
      </a>
      <a
        href={`fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button messenger"
      >
        Messenger
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button x"
      >
        X
      </a>
    </div>
  );
};

export default ShareButtons;
