import { useRef, useEffect, RefObject } from 'react';

export const useDragToScroll = (ref: RefObject<HTMLElement>) => {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Prevent starting a drag on interactive elements like buttons or inputs,
      // which would interfere with their default behavior.
      const target = e.target as HTMLElement;
      if (target.closest('button, input, a, select, textarea')) {
        return;
      }

      isDragging.current = true;
      startY.current = e.pageY - element.offsetTop;
      scrollTop.current = element.scrollTop;
      
      // Apply styles to indicate dragging and prevent text selection
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';

      // Add listeners to the document to handle mouse movement and release
      // anywhere on the page, making the drag feel more robust.
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault(); // Prevent other unwanted interactions during drag
      const y = e.pageY - element.offsetTop;
      const walk = (y - startY.current) * 2; // Multiplier for faster scrolling
      element.scrollTop = scrollTop.current - walk;
    };
    
    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      
      // Restore original cursor and text selection behavior
      if (element) {
        element.style.cursor = 'grab';
        element.style.userSelect = 'auto';
      }

      // Clean up document-level event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    // Initialize cursor style
    element.style.cursor = 'grab';
    
    // Add the primary event listener to the scrollable element
    element.addEventListener('mousedown', handleMouseDown as EventListener);

    // Main cleanup function for the effect
    return () => {
      element.removeEventListener('mousedown', handleMouseDown as EventListener);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [ref]); // The effect only needs to re-run if the referenced element changes.
};
