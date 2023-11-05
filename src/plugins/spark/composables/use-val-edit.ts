import { computed, getCurrentInstance, WritableComputedRef } from 'vue';

export interface UseValEditProps<T> {
  modelValue: T;
  serviceId: string;
  blockId: string;
  editable?: boolean;
  dense?: boolean;
  comparison?: boolean;
}

export type UseValEditEmits<T> = {
  'update:modelValue': [data: T];
  edit: [];
};

export interface UseValEditComponent<T> {
  field: WritableComputedRef<T>;
  startEdit(): void;
}

export interface UseValEditComposable {
  defaultProps<T>(): InferDefaults<UseValEditProps<T>>;
  setup<T>(): UseValEditComponent<T>;
}

export const useValEdit: UseValEditComposable = {
  defaultProps<T>(): InferDefaults<UseValEditProps<T>> {
    return {
      editable: false,
      dense: true,
      comparison: false,
    };
  },
  setup<T>(): UseValEditComponent<T> {
    const instance = getCurrentInstance()!;

    const field = computed<T>({
      get: () => instance.props.modelValue as T,
      set: (v) => instance.emit('update:modelValue', v),
    });

    function startEdit(): void {
      instance.emit('edit');
    }

    return {
      field,
      startEdit,
    };
  },
};
