import { ComponentPublicInstance, onBeforeUpdate, Ref, ref } from 'vue';

export interface UseElementRefsComponent<T extends Element> {
  setElementRef(key: string, el: ComponentPublicInstance | null | undefined): void;
  getElementRef(key: string): T | null;
}

export interface UseElementRefsComposable {
  setup<T extends Element>(): UseElementRefsComponent<T>;
}

export const useElementRefs: UseElementRefsComposable = {
  setup<T extends Element = Element>(): UseElementRefsComponent<T> {
    const elementRefs: Ref<Record<string, T>> = ref({});

    onBeforeUpdate(() => {
      elementRefs.value = {};
    });

    function setElementRef(key: string, el: ComponentPublicInstance): void {
      if (el?.$el) {
        elementRefs.value[key] = el.$el;
      }
    }

    function getElementRef(key: string): T | null {
      return elementRefs.value[key] ?? null;
    }

    return {
      setElementRef,
      getElementRef,
    };
  },
};
