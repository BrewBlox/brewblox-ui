import { computed, getCurrentInstance, PropType, WritableComputedRef } from 'vue';


export interface UseValEditProps<T = any> {
  modelValue: {
    type: PropType<T>,
    required: true,
  },
  serviceId: {
    type: PropType<string>,
    required: true,
  },
  blockId: {
    type: PropType<string>,
    required: true,
  },
  editable: {
    type: PropType<boolean>,
    default: boolean,
  },
  dense: {
    type: PropType<boolean>,
    default: boolean,
  },
  comparison: {
    type: PropType<boolean>,
    default: boolean,
  }
}

export type UseValEditEmits = [
  'update:modelValue',
  'edit',
]

export interface UseValEditComponent<T> {
  field: WritableComputedRef<T>;
  startEdit(): void;
}

export interface UseValEditComposable {
  props: UseValEditProps;
  emits: UseValEditEmits;
  setup<T>(modelValue: unknown): UseValEditComponent<T>;
}

export const useValEdit: UseValEditComposable = {
  props: {
    modelValue: {
      type: [Object, Array, String, Number, Date, Boolean] as PropType<any>,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
    blockId: {
      type: String,
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: true,
    },
    comparison: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:modelValue',
    'edit',
  ],
  setup<T>(modelValue: unknown): UseValEditComponent<T> {
    const { emit } = getCurrentInstance()!;

    const field = computed<T>({
      get: () => modelValue as T,
      set: v => emit('update:modelValue', v),
    });

    function startEdit(): void {
      emit('edit');
    }

    return {
      field,
      startEdit,
    };
  },
};
