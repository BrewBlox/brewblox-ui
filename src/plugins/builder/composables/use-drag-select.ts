import { Ref, ref } from 'vue';

import { rotatedSize } from '@/utils/coordinates';

import { SQUARE_SIZE } from '../const';
import { FlowPart } from '../types';

interface DragSelectArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Reorder area start/end so that the start is in the top left corner,
// and the end is in the bottom right corner,
// regardless of whether the user dragged ltr or rtl.
function normalizedArea(area: DragSelectArea): DragSelectArea {
  return {
    startX: Math.min(area.startX, area.endX),
    startY: Math.min(area.startY, area.endY),
    endX: Math.max(area.startX, area.endX),
    endY: Math.max(area.startY, area.endY),
  };
}

export interface UseDragSelectComponent {
  selectAreaRef: Ref<SVGRectElement | undefined>;
  startDragSelect(area: DragSelectArea): void;
  updateDragSelect(x: number, y: number): void;
  stopDragSelect(): void;
  makeSelectAreaFilter(): (part: FlowPart) => boolean;
}

export interface UseDragSelectComposable {
  setup(): UseDragSelectComponent;
}

export const useDragSelect: UseDragSelectComposable = {
  setup(): UseDragSelectComponent {
    const selectAreaRef = ref<SVGRectElement>();
    const activeArea = ref<DragSelectArea | null>(null);

    function applyAttributes(): void {
      if (!selectAreaRef.value) {
        return;
      }
      const area = activeArea.value;
      if (area) {
        const { startX, startY, endX, endY } = normalizedArea(area);
        selectAreaRef.value.setAttribute('x', `${startX}`);
        selectAreaRef.value.setAttribute('y', `${startY}`);
        selectAreaRef.value.setAttribute('width', `${endX - startX}`);
        selectAreaRef.value.setAttribute('height', `${endY - startY}`);
      }
      else {
        selectAreaRef.value.setAttribute('width', '0');
        selectAreaRef.value.setAttribute('height', '0');
      }
    }

    function startDragSelect(area: DragSelectArea): void {
      activeArea.value = { ...area };
      applyAttributes();
    }

    function updateDragSelect(x: number, y: number): void {
      if (activeArea.value) {
        activeArea.value.endX = x;
        activeArea.value.endY = y;
        applyAttributes();
      }
    }

    function stopDragSelect(): void {
      activeArea.value = null;
      applyAttributes();
    }

    function makeSelectAreaFilter(): (part: FlowPart) => boolean {
      if (!activeArea.value) {
        return () => false;
      }

      const area = normalizedArea(activeArea.value);
      const startX = area.startX / SQUARE_SIZE;
      const startY = area.startY / SQUARE_SIZE;
      const endX = area.endX / SQUARE_SIZE;
      const endY = area.endY / SQUARE_SIZE;

      return part => {
        // Part X/Y position is always in the top left corner,
        // but rotation will impact the end coordinates for non-square parts
        // We can ignore flipping, as all parts are rectangular
        const [sizeX, sizeY] = rotatedSize(part.rotate, part.size);

        // The selection must touch all squares occupied by the part
        return startX <= part.x + 1
          && startY <= part.y + 1
          && endX >= part.x + sizeX - 1
          && endY >= part.y + sizeY - 1;
      };
    }

    return {
      selectAreaRef,
      startDragSelect,
      updateDragSelect,
      stopDragSelect,
      makeSelectAreaFilter,
    };
  },
};
