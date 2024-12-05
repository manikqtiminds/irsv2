import { useState, useCallback } from 'react';

export function useFullscreen(elementRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      elementRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [elementRef]);

  return { isFullscreen, toggleFullscreen };
}