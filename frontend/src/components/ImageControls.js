import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize } from 'lucide-react';

export function ImageControls({ onZoomIn, onZoomOut, onReset, onFullscreen }) {
  return (
    <div className="absolute bottom-4 right-4 flex space-x-2">
      <button 
        onClick={onZoomIn}
        className="p-2 bg-black/50 rounded-full hover:bg-black/75 text-white transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button 
        onClick={onZoomOut}
        className="p-2 bg-black/50 rounded-full hover:bg-black/75 text-white transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button 
        onClick={onReset}
        className="p-2 bg-black/50 rounded-full hover:bg-black/75 text-white transition-colors"
        title="Reset View"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button 
        onClick={onFullscreen}
        className="p-2 bg-black/50 rounded-full hover:bg-black/75 text-white transition-colors"
        title="Fullscreen"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
}