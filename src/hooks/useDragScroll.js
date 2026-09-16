import { useRef } from "react";

export function useDragScroll() {
  const scrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // <header data-widget-drag-handle>
  // Assim o scroll não começa no header do card.
  function shouldIgnoreDrag(target) {
    return target.closest(
      "button, input, textarea, select, a, [data-widget-drag-handle], [data-no-drag]",
    );
  }

  function handlePointerDown(event) {
    if (shouldIgnoreDrag(event.target)) return;

    isDraggingRef.current = true;
    startXRef.current = event.clientX;
    scrollLeftRef.current = scrollRef.current.scrollLeft;

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!isDraggingRef.current) return;

    const distance = event.clientX - startXRef.current;
    scrollRef.current.scrollLeft = scrollLeftRef.current - distance;
  }

  function handlePointerUp(event) {
    isDraggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    ref: scrollRef,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  };
}
