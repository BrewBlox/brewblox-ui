import { computed, ComputedRef, getCurrentInstance, PropType } from 'vue';

export interface UseFieldProps {
  tag: {
    type: PropType<string>,
    default: string,
  },
  title: {
    type: PropType<string>,
    default: string,
  },
  label: {
    type: PropType<string>,
    required: false,
  },
  message: {
    type: PropType<string>,
    required: false,
  },
  html: {
    type: PropType<boolean>,
    default: boolean,
  },
  tooltip: {
    type: PropType<string>,
    required: false,
  },
  readonly: {
    type: PropType<boolean>,
    default: boolean,
  },
  dialogProps: {
    type: PropType<AnyDict>,
    default: () => AnyDict,
  },
  tagProps: {
    type: PropType<AnyDict>,
    default: () => AnyDict,
  },
  tagClass: {
    type: PropType<string | string[] | AnyDict>,
    default: string,
  },
  tagStyle: {
    type: PropType<string | string[] | AnyDict>,
    default: string,
  },
  rules: {
    type: PropType<InputRule[]>,
    default: () => InputRule[],
  },
}

export interface UseFieldComponent {
  activeSlots: ComputedRef<string[]>;
}

export interface UseFieldComposable {
  props: UseFieldProps;
  setup(): UseFieldComponent;
}

const fieldSlots = [
  'prepend',
  'append',
  'before',
  'after',
  'error',
  'hint',
  'counter',
  'loading',
];

export const useField: UseFieldComposable = {
  props: {
    tag: {
      type: String,
      default: 'span',
    },
    title: {
      type: String,
      default: 'Edit value',
    },
    label: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    html: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: String,
      required: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    dialogProps: {
      type: Object,
      default: (): AnyDict => ({}),
    },
    tagProps: {
      type: Object,
      default: (): AnyDict => ({}),
    },
    tagClass: {
      type: [Array, Object, String],
      default: '',
    },
    tagStyle: {
      type: [Array, Object, String],
      default: '',
    },
    rules: {
      type: Array as PropType<InputRule[]>,
      default: (): InputRule[] => [],
    },
  },
  setup() {
    const { slots } = getCurrentInstance()!;

    const activeSlots = computed<string[]>(
      () => Object.keys(slots)
        .filter(s => fieldSlots.includes(s)),
    );

    return {
      activeSlots,
    };
  },
};
