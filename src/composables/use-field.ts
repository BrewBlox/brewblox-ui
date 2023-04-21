import {
  computed,
  ComputedRef,
  getCurrentInstance,
  PropType,
  StyleValue,
} from 'vue';

export interface UseFieldProps {
  tag: {
    type: PropType<string>;
    default: string;
  };
  title: {
    type: PropType<string>;
    default: string;
  };
  label: {
    type: PropType<string>;
    default: string;
  };
  message: {
    type: PropType<string>;
    default: string;
  };
  html: {
    type: PropType<boolean>;
    default: boolean;
  };
  tooltip: {
    type: PropType<string>;
    default: string;
  };
  readonly: {
    type: PropType<boolean>;
    default: boolean;
  };
  dialogProps: {
    type: PropType<AnyDict>;
    default: () => AnyDict;
  };
  tagProps: {
    type: PropType<AnyDict>;
    default: () => AnyDict;
  };
  tagClass: {
    type: PropType<string | string[] | AnyDict>;
    default: string;
  };
  tagStyle: {
    type: PropType<StyleValue>;
    default: string;
  };
  rules: {
    type: PropType<InputRule[]>;
    default: () => InputRule[];
  };
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
  'label',
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
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    html: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: String,
      default: '',
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
    const instance = getCurrentInstance()!;

    const activeSlots = computed<string[]>(() =>
      Object.keys(instance.slots).filter((s) => fieldSlots.includes(s)),
    );

    return {
      activeSlots,
    };
  },
};
