import { useState, useCallback } from 'react';

export function useImageZoom(initialScale = 1) {
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const reset = useCallback(() => {
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
  }, [initialScale]);

  const handlePan = useCallback((dx, dy) => {
    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  }, []);

  return {
    scale,
    position,
    zoomIn,
    zoomOut,
    reset,
    handlePan
  };
}