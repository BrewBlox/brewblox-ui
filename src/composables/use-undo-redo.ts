import { computed, ComputedRef, ref, unref, UnwrapRef } from 'vue';

export interface UseUndoRedoComponent<T> {
  canUndo: ComputedRef<boolean>;
  canRedo: ComputedRef<boolean>;
  undo(cb: (replacement: UnwrapRef<T>) => unknown): void;
  redo(cb: (replacement: UnwrapRef<T>) => unknown): void;
  pushUndoStack(): void;
  clearUndoStack(): void;
}

export interface UseUndoRedoComposable {
  setup<T>(state: T): UseUndoRedoComponent<T>;
}

export const UseUndoRedo: UseUndoRedoComposable = {
  setup<T>(state: T): UseUndoRedoComponent<T> {
    const undoStack = ref<string[]>([]);
    const redoStack = ref<string[]>([]);

    const canUndo = computed<boolean>(() => undoStack.value.length > 0);
    const canRedo = computed<boolean>(() => redoStack.value.length > 0);

    function undo(cb: (replacement: UnwrapRef<T>) => unknown): void {
      const replacement = undoStack.value.pop();
      if (replacement) {
        redoStack.value.push(JSON.stringify(unref(state)));
        cb(JSON.parse(replacement));
      }
    }

    function redo(cb: (replacement: UnwrapRef<T>) => unknown): void {
      const replacement = redoStack.value.pop();
      if (replacement) {
        undoStack.value.push(JSON.stringify(unref(state)));
        cb(JSON.parse(replacement));
      }
    }

    function pushUndoStack(): void {
      undoStack.value.push(JSON.stringify(unref(state)));
      redoStack.value.length = 0;
    }

    function clearUndoStack(): void {
      undoStack.value.length = 0;
      redoStack.value.length = 0;
    }

    return {
      canUndo,
      canRedo,
      undo,
      redo,
      pushUndoStack,
      clearUndoStack,
    };
  },
};
