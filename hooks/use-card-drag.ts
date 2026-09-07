'use client';
import { useId, useRef, type PointerEvent, type MouseEvent } from 'react';
// Pointer capture supports mouse, pen and tablet touch with the same large drop zones.
export function useCardDrag(
  select: (card: number) => void,
  drop: (zone: number, card: number) => void,
) {
  const group = useId();
  const gesture = useRef<{
    card: number;
    x: number;
    y: number;
    skipClick: boolean;
  } | null>(null);
  function cardProps(card: number) {
    return {
      draggable: false,
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) return;
        gesture.current = {
          card,
          x: event.clientX,
          y: event.clientY,
          skipClick: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        select(card);
      },
      onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
        const start = gesture.current;
        if (!start) return;
        const moved =
          Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8;
        if (moved) {
          start.skipClick = true;
          const target = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest<HTMLElement>('[data-drop-group]');
          if (target?.dataset.dropGroup === group) {
            const zone = Number(target.dataset.dropZone);
            if (Number.isInteger(zone)) drop(zone, start.card);
          }
        }
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
      },
      onPointerCancel: () => {
        gesture.current = null;
      },
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        if (gesture.current?.skipClick) {
          event.preventDefault();
          gesture.current = null;
          return;
        }
        select(card);
      },
    };
  }
  return {
    cardProps,
    zoneProps: (zone: number) => ({
      'data-drop-group': group,
      'data-drop-zone': zone,
    }),
  };
}
