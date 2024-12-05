import React from 'react';

export function ImageThumbnails({ images, currentImageIndex, onThumbnailClick }) {
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex space-x-3 pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onThumbnailClick(index)}
            className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden transition transform hover:scale-105 focus:outline-none ${
              index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <img
              src={image.imageUrl}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}