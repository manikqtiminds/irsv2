import React from 'react';

export function VerticalThumbnails({ images, currentImageIndex, onThumbnailClick }) {
  return (
    <div className=" md:h-[70vh] lg:h-[60vh] "> {/* changed  */}
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <div className="flex flex-row mb-3 md:mb-0 md:flex-col gap-2 p-[2px]">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onThumbnailClick(index)}
              className={`thumbnail-container relative aspect-video rounded-lg overflow-hidden transition hover:ring-2 hover:ring-blue-400 focus:outline-none ${
                index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <img
                src={image.imageUrl}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-1 right-1 text-xs text-white bg-black/50 px-1 rounded">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
