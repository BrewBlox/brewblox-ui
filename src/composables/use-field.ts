import { LooseDictionary } from 'quasar';
import { PropType } from 'vue';

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
    type: PropType<LooseDictionary>,
    default: () => LooseDictionary,
  },
  tagProps: {
    type: PropType<LooseDictionary>,
    default: () => LooseDictionary,
  },
  tagClass: {
    type: PropType<string | string[] | LooseDictionary>,
    default: string,
  },
  tagStyle: {
    type: PropType<string | string[] | LooseDictionary>,
    default: string,
  },
  rules: {
    type: PropType<InputRule[]>,
    default: () => InputRule[],
  },
}

export interface UseFieldComposable {
  props: UseFieldProps;
}

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
      default: (): LooseDictionary => ({}),
    },
    tagProps: {
      type: Object,
      default: (): LooseDictionary => ({}),
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
};
