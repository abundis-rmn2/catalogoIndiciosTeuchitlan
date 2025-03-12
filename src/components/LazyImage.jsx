import { useState, useEffect, useRef } from 'react';

// Image loading queue to prevent too many simultaneous requests
const imageQueue = [];
const MAX_CONCURRENT_LOADS = 4; // Limit concurrent image loads
let activeLoads = 0;

// Process the queue - loads next images when slots are available
const processQueue = () => {
  if (activeLoads >= MAX_CONCURRENT_LOADS || imageQueue.length === 0) return;
  
  while (activeLoads < MAX_CONCURRENT_LOADS && imageQueue.length > 0) {
    const nextLoad = imageQueue.shift();
    activeLoads++;
    
    // Load the image
    const img = new Image();
    img.src = nextLoad.src;
    
    img.onload = () => {
      nextLoad.onSuccess(nextLoad.src);
      activeLoads--;
      setTimeout(processQueue, 100); // Small delay between loads
    };
    
    img.onerror = () => {
      nextLoad.onError();
      activeLoads--;
      setTimeout(processQueue, 100);
    };
  }
};

function LazyImage({ src, alt, onError, className, placeholderSrc, immediate = false }) {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef(null);
  const observerRef = useRef(null);
  const lastSrc = useRef(src);
  
  // Reset state when src changes
  useEffect(() => {
    if (src !== lastSrc.current) {
      setImageSrc('');
      setIsLoading(true);
      setHasError(false);
      lastSrc.current = src;
      
      // Load immediately if requested or if already visible
      if (immediate) {
        queueImageLoad(src);
      } else if (observerRef.current && imageRef.current) {
        observerRef.current.unobserve(imageRef.current);
        observerRef.current.observe(imageRef.current);
      }
    }
  }, [src, immediate]);
  
  // Handle successful image load
  const handleImageLoad = (loadedSrc) => {
    setImageSrc(loadedSrc);
    setIsLoading(false);
    setHasError(false);
  };
  
  // Handle image loading error
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };
  
  // Queue this image for loading
  const queueImageLoad = (imgSrc) => {
    setIsLoading(true);
    
    // Add to queue
    imageQueue.push({
      src: imgSrc,
      onSuccess: handleImageLoad,
      onError: handleImageError
    });
    
    // Start processing the queue
    processQueue();
  };
  
  // Set up intersection observer to detect when image enters viewport
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !imageSrc && !hasError) {
          queueImageLoad(src);
        }
      },
      { 
        rootMargin: '200px', // Load when image is 200px from entering viewport
        threshold: 0.01 
      }
    );
    
    if (imageRef.current) {
      // If immediate loading is requested, queue it right away
      if (immediate) {
        queueImageLoad(src);
      } else {
        observerRef.current.observe(imageRef.current);
      }
    }
    
    return () => {
      if (observerRef.current && imageRef.current) {
        observerRef.current.unobserve(imageRef.current);
      }
    };
  }, [src, immediate]);
  
  return (
    <div ref={imageRef} className={`lazy-image-container ${className || ''}`}>
      {isLoading && (
        <div className="image-placeholder">
          {placeholderSrc ? 
            <img src={placeholderSrc} alt="Loading..." className="placeholder" /> :
            <div className="loading-spinner"></div>
          }
        </div>
      )}
      
      {imageSrc && (
        <img 
          src={imageSrc} 
          alt={alt} 
          className={`lazy-image ${isLoading ? 'hidden' : ''}`}
          onError={handleImageError}
        />
      )}
      
      {hasError && (
        <div className="image-error">
          <img 
            src="/placeholder-image.png"
            alt={alt}
            className="error-placeholder"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22150%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20fill%3D%22%23333333%22%3EImagen%20no%20disponible%3C%2Ftext%3E%3C%2Fsvg%3E';
            }}
          />
        </div>
      )}
    </div>
  );
}

export default LazyImage;
