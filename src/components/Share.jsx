import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BASE_URL } from '../App';
import { trackShareEvent } from '../utils/analytics';

function Share({ selectedItem, getImageUrl }) {
  const shareUrl = `${BASE_URL}/indicio/${selectedItem['INDICIO']}`;
  const imageUrl = getImageUrl(selectedItem.id);

  const handleShare = async (platform) => {
    let url = '';
    switch (platform) {
      case 'whatsapp':
        const message = 
        `${imageUrl}\n\n` + // Imagen como primer elemento (vista previa)
        `🔍 *Mira esta prenda:*\n` +
        `• Tipo: ${selectedItem['TIPO DE INDICIO']}\n` +
        `• Color: ${selectedItem['COLOR']}\n` +
        `• Marca: ${selectedItem['MARCA']}\n` +
        `• Talla: ${selectedItem['TALLA']}\n` +
        `• Detalles: ${selectedItem['OBSERVACIONES']}\n\n` +
        `¿Crees que es de un familiar querido? 👉 ${shareUrl}`;
    
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
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
    await trackShareEvent(platform, selectedItem['INDICIO']); // Track the share event
  };

  return (
   <>
    <div className="historia-prendas">
      <h3>¿Crees que este indicio pertenece a un ser dado por desaparecido cercano a tí? </h3>
      <p>Esta prenda u objeto fue documentada como indicio en el Rancho Izaguirre en Teuchitlan, Jalisco.
        Sin embargo pertenece a un familiar, amigo o conocido. <b><a href={`https://lasprendashablan.tejer.red/indicio/${selectedItem['INDICIO']}`}>Las Prendas Hablan</a></b> es un trabajo
        periodistico que busca a los dueños de estos objetos. </p>
        <p>Si crees que este inidicio esta relacionado con algun familiar, amigo o conocido tuyo compartenos tu historia.</p>
        <a 
          className="prendasHablan" 
          href={`https://lasprendashablan.tejer.red/indicio/${selectedItem['INDICIO']}`} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => trackShareEvent('prendasHablan', selectedItem['INDICIO'])} // Track the event
        >
          Contar historia en <b>Las prendas Hablan</b>
        </a>
    </div>
    <div className="share-buttons">
      <h4>Si crees que esta prenda pertenece a algún conocido compartela:</h4>
      <button onClick={() => handleShare('whatsapp')} className="share-button whatsapp">
        <i className="fab fa-whatsapp"></i>
      </button>
      <button onClick={() => handleShare('facebook')} className="share-button facebook">
        <i className="fab fa-facebook"></i>
      </button>
      <button onClick={() => handleShare('messenger')} className="share-button messenger">
        <i className="fab fa-facebook-messenger"></i>
      </button>
      <button onClick={() => handleShare('x')} className="share-button x">
        <i className="fab fa-twitter"></i>
      </button>
    </div>
  </>
  );
}

export default Share;
