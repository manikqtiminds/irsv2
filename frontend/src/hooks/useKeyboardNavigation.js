import { useEffect } from 'react';

export function useKeyboardNavigation(onPrevious, onNext) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') onPrevious();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPrevious, onNext]);
}