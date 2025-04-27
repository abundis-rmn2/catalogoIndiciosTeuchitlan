import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BASE_URL } from '../App';
import { trackShareEvent } from '../utils/analytics';

function Share({ selectedItem, getImageUrl }) {
  const shareUrl = `${BASE_URL}/indicio/${selectedItem['INDICIO']}`;
  const imageUrl = getImageUrl(selectedItem.id);

  const handleShare = async (platform) => {
    let url = '';
    const prendasHablanLink = `https://lasprendashablan.tejer.red/indicio/${selectedItem['INDICIO']}`;
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
        `¿Crees que es de un familiar querido? 👉 ${prendasHablanLink}`;
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(prendasHablanLink)}`;
        break;
      case 'messenger':
        url = `fb-messenger://share?link=${encodeURIComponent(prendasHablanLink)}`;
        break;
      case 'x':
        const messageX =
        `🔍 Mira esta ${selectedItem['TIPO DE INDICIO']} en las #PrendasHablan\n` +
        `${prendasHablanLink}`;
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(messageX)}`;
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
      <h3>¿Crees que este indicio pertenece a una persona reportada como desaparecida cercana a ti? </h3>
      <p>Esta prenda u objeto fue documentada como indicio en el Rancho Izaguirre en Teuchitlán, Jalisco. Sin embargo pertenece a un familiar, amigo o conocido. 
        <b><a href={`https://lasprendashablan.tejer.red/indicio/${selectedItem['INDICIO']}`}>Las Prendas Hablan</a></b> es un trabajo periodístico que busca coincidencias entre las ropas e indicios localizados en el rancho, y aquellas portadas por personas reportadas como desaparecidas.</p>
        <p>Si crees que este indicio está relacionado con algún familiar, amigo o conocido responde este formulario y compártenos tu historia.</p>
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
