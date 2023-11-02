import { computed, ComputedRef, getCurrentInstance, StyleValue } from 'vue';

export interface UseFieldProps {
  tag?: string;
  title?: string;
  label?: string;
  message?: string;
  html?: boolean;
  tooltip?: string;
  readonly?: boolean;
  editorProps?: AnyDict;
  tagProps?: AnyDict;
  tagClass?: string | string[] | AnyDict;
  tagStyle?: StyleValue;
  rules?: InputRule[];
}

export interface UseFieldComponent {
  activeSlots: ComputedRef<string[]>;
}

export interface UseFieldComposable {
  defaultProps: InferDefaults<UseFieldProps>;
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
  defaultProps: {
    tag: 'span',
    title: 'Edit value',
    label: '',
    message: '',
    html: false,
    tooltip: '',
    readonly: false,
    editorProps: () => ({}),
    tagProps: () => ({}),
    tagClass: '',
    tagStyle: '',
    rules: () => [],
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
